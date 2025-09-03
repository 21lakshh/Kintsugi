import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'
import { TransactionTypes, TaxRegimes, DeductionLimits, TaxSlabs } from '../types/index.js'
import { getChatbotResponse } from '../services/aiService.js'

// Tax calculation utility functions
const calculateTaxLiability = (taxableIncome, regime) => {
  const slabs = regime === TaxRegimes.OLD ? TaxSlabs.OLD_REGIME : TaxSlabs.NEW_REGIME
  let tax = 0
  let remainingIncome = taxableIncome

  for (const slab of slabs) {
    if (remainingIncome <= 0) break
    
    const taxableAtThisSlab = Math.min(remainingIncome, slab.max - slab.min + 1)
    tax += (taxableAtThisSlab * slab.rate) / 100
    remainingIncome -= taxableAtThisSlab
  }

  // Add Health and Education Cess (4%)
  const cess = tax * 0.04
  return Math.round(tax + cess)
}

const calculateDeductionUtilization = (transactions) => {
  const deductions = transactions.filter(t => t.type === TransactionTypes.DEDUCTION)
  
  const section80C = deductions
    .filter(t => t.category === '80C Deduction')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const section80D = deductions
    .filter(t => t.category === '80D Medical')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const hra = deductions
    .filter(t => t.category === 'HRA')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    section80C: {
      used: Math.min(section80C, DeductionLimits.SECTION_80C),
      limit: DeductionLimits.SECTION_80C,
      utilization: Math.min((section80C / DeductionLimits.SECTION_80C) * 100, 100)
    },
    section80D: {
      used: Math.min(section80D, DeductionLimits.SECTION_80D_INDIVIDUAL),
      limit: DeductionLimits.SECTION_80D_INDIVIDUAL,
      utilization: Math.min((section80D / DeductionLimits.SECTION_80D_INDIVIDUAL) * 100, 100)
    },
    hra: {
      used: hra,
      // HRA limit calculation would be complex, using simplified version
      limit: 360000, // This should be calculated based on salary and rent
      utilization: Math.min((hra / 360000) * 100, 100)
    }
  }
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // User Profile State
      userProfile: null,
      isProfileComplete: false,
      isNewUser: true, // Track if this is a new user
      
      // Transactions State
      transactions: [],
      transactionFilters: {
        searchTerm: '',
        type: 'all',
        category: 'all',
        dateRange: 'all',
        hasReceipt: 'all'
      },
      
      // Tax Calculation State
      taxSettings: {
        preferredRegime: TaxRegimes.OLD,
        autoCalculate: true,
        includeProjections: true
      },
      taxCalculations: {
        oldRegime: null,
        newRegime: null,
        recommendation: null
      },
      deductionUtilization: {
        section80C: { used: 0, limit: DeductionLimits.SECTION_80C, utilization: 0 },
        section80D: { used: 0, limit: DeductionLimits.SECTION_80D_INDIVIDUAL, utilization: 0 },
        hra: { used: 0, limit: 360000, utilization: 0 }
      },
      
      // File Upload State
      uploadedFiles: [],
      fileUploadStatus: null,
      
      // AI Insights State
      aiInsights: [],
      isAssistantLoading: false,
      chatHistory: [
        {
            role: 'model',
            parts: [{ text: 'Hello! I am your personal tax assistant. How can I help you today?' }],
        }
      ],
      
      // UI State
      loading: false,
      error: null,
      notifications: [],
      useDebugDataContext: false, // <-- New debug flag
      
      // Actions
      
      // User Profile Actions
      setUserProfile: (profile) => {
        set({ 
          userProfile: profile, 
          isProfileComplete: true,
          isNewUser: false // User now has a profile, so not new
        })
      },
      
      updateUserProfile: (updates) => {
        set((state) => ({
          userProfile: { ...(state.userProfile || {}), ...updates },
          isNewUser: false // User has completed setup
        }))
      },
      
      // Mark user as returning (has existing profile)
      markAsReturningUser: () => {
        set({ isNewUser: false })
      },
      
      // Transaction Actions
      addTransaction: (transactionData) => set((state) => {
        const transaction = {
          id: uuidv4(),
          ...transactionData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        const updatedTransactions = [...state.transactions, transaction]
        const deductionUtilization = calculateDeductionUtilization(updatedTransactions)
        
        // Trigger tax recalculation
        get().calculateTax()
        
        return {
          transactions: updatedTransactions,
          deductionUtilization
        }
      }),
      
      updateTransaction: (id, updates) => set((state) => {
        const updatedTransactions = state.transactions.map(t => 
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        )
        
        const deductionUtilization = calculateDeductionUtilization(updatedTransactions)
        
        // Trigger tax recalculation
        get().calculateTax()
        
        return {
          transactions: updatedTransactions,
          deductionUtilization
        }
      }),
      
      deleteTransaction: (id) => set((state) => {
        const updatedTransactions = state.transactions.filter(t => t.id !== id)
        const deductionUtilization = calculateDeductionUtilization(updatedTransactions)
        
        // Trigger tax recalculation
        get().calculateTax()
        
        return {
          transactions: updatedTransactions,
          deductionUtilization
        }
      }),
      
      setTransactionFilters: (filters) => set((state) => ({
        transactionFilters: { ...state.transactionFilters, ...filters }
      })),
      
      // Tax Calculation Actions
      calculateTax: () => set((state) => {
        const { transactions, taxSettings } = state
        
        const incomeTransactions = transactions.filter(t => t.type === TransactionTypes.INCOME)
        const deductionTransactions = transactions.filter(t => t.type === TransactionTypes.DEDUCTION)
        
        let totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
        let totalDeductions = deductionTransactions.reduce((sum, t) => sum + t.amount, 0)
        
        if (taxSettings.includeProjections) {
            const monthlyData = {}
            transactions.forEach(t => {
                const month = format(new Date(t.date), 'yyyy-MM')
                if (!monthlyData[month]) {
                    monthlyData[month] = { income: 0, deductions: 0 }
                }
                if (t.type === TransactionTypes.INCOME) monthlyData[month].income += t.amount
                if (t.type === TransactionTypes.DEDUCTION) monthlyData[month].deductions += t.amount
            })

            const months = Object.keys(monthlyData)
            if (months.length > 0) {
                const totalIncomeSoFar = Object.values(monthlyData).reduce((sum, m) => sum + m.income, 0)
                const totalDeductionsSoFar = Object.values(monthlyData).reduce((sum, m) => sum + m.deductions, 0)
                
                const avgMonthlyIncome = totalIncomeSoFar / months.length
                const avgMonthlyDeductions = totalDeductionsSoFar / months.length

                totalIncome = avgMonthlyIncome * 12
                totalDeductions = avgMonthlyDeductions * 12
            }
        }
        
        const professionalTax = transactions
            .filter(t => t.category === 'Professional Tax')
            .reduce((sum, t) => sum + t.amount, 0)
        
        const projectedProfessionalTax = taxSettings.includeProjections && transactions.some(t => t.source === 'ai_extracted')
            ? professionalTax * 12
            : professionalTax
        
        // Old Regime Calculation
        const oldRegimeTaxableIncome = Math.max(0, totalIncome - totalDeductions - Math.min(projectedProfessionalTax, 2500) - DeductionLimits.STANDARD_DEDUCTION)
        const oldRegimeTax = calculateTaxLiability(oldRegimeTaxableIncome, TaxRegimes.OLD)
        
        // New Regime Calculation (no deductions except standard)
        const newRegimeTaxableIncome = Math.max(0, totalIncome - DeductionLimits.STANDARD_DEDUCTION)
        const newRegimeTax = calculateTaxLiability(newRegimeTaxableIncome, TaxRegimes.NEW)
        
        const oldRegimeData = {
          grossIncome: totalIncome,
          totalDeductions: totalDeductions + DeductionLimits.STANDARD_DEDUCTION + Math.min(projectedProfessionalTax, 2500),
          taxableIncome: oldRegimeTaxableIncome,
          taxLiability: oldRegimeTax,
          effectiveRate: totalIncome > 0 ? (oldRegimeTax / totalIncome) * 100 : 0
        }
        
        const newRegimeData = {
          grossIncome: totalIncome,
          totalDeductions: DeductionLimits.STANDARD_DEDUCTION,
          taxableIncome: newRegimeTaxableIncome,
          taxLiability: newRegimeTax,
          effectiveRate: totalIncome > 0 ? (newRegimeTax / totalIncome) * 100 : 0
        }
        
        const recommendation = oldRegimeTax <= newRegimeTax ? TaxRegimes.OLD : TaxRegimes.NEW
        const savings = Math.abs(oldRegimeTax - newRegimeTax)
        
        return {
          taxCalculations: {
            oldRegime: oldRegimeData,
            newRegime: newRegimeData,
            recommendation: {
              regime: recommendation,
              savings,
              reason: recommendation === TaxRegimes.OLD 
                ? `Old regime saves ₹${savings.toLocaleString()} due to deduction utilization`
                : `New regime saves ₹${savings.toLocaleString()} with simplified tax structure`
            }
          }
        }
      }),
      
      setTaxSettings: (settings) => set((state) => ({
        taxSettings: { ...state.taxSettings, ...settings }
      })),
      
      // File Upload Actions
      uploadFile: (file, metadata) => set((state) => {
        const uploadedFile = {
          id: uuidv4(),
          file,
          ...metadata,
          status: 'uploading',
          uploadedAt: new Date().toISOString()
        }
        
        return {
          uploadedFiles: [...state.uploadedFiles, uploadedFile],
          fileUploadStatus: 'uploading'
        }
      }),
      
      updateFileStatus: (fileId, status, data = {}) => set((state) => ({
        uploadedFiles: state.uploadedFiles.map(f => 
          f.id === fileId ? { ...f, status, ...data } : f
        ),
        fileUploadStatus: status
      })),
      
      // AI Insights Actions
      addAIInsight: (insight) => set((state) => {
        // Prevent duplicate insights
        if (state.aiInsights.some(i => i.title === insight.title)) {
            return {};
        }
        return {
            aiInsights: [...state.aiInsights, {
              id: uuidv4(),
              ...insight,
              createdAt: new Date().toISOString(),
              isRead: false
            }]
        }
      }),
      
      markInsightAsRead: (insightId) => set((state) => ({
        aiInsights: state.aiInsights.map(insight => 
          insight.id === insightId ? { ...insight, isRead: true } : insight
        )
      })),
      
      generateAIInsights: () => {
        const state = get()
        const { transactions, deductionUtilization, taxCalculations } = state
        const insights = []
        
        // Check for 80C optimization
        if (deductionUtilization.section80C.utilization < 100) {
          const remaining = deductionUtilization.section80C.limit - deductionUtilization.section80C.used
          const potentialSaving = remaining * 0.3 // Assuming 30% tax bracket
          
          insights.push({
            type: 'warning',
            title: '80C Deduction Optimization',
            message: `You have ₹${remaining.toLocaleString()} remaining in your 80C limit. Consider investing in ELSS before March to save an extra ₹${potentialSaving.toLocaleString()}.`,
            action: 'Show Options',
            priority: 'high'
          })
        }
        
        // Check for medical insurance due dates
        const medicalTransactions = transactions.filter(t => t.category === '80D Medical')
        if (medicalTransactions.length > 0) {
          const lastPayment = medicalTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
          const daysSinceLastPayment = Math.floor((new Date() - new Date(lastPayment.date)) / (1000 * 60 * 60 * 24))
          
          if (daysSinceLastPayment > 300) { // Approximately 10 months
            insights.push({
              type: 'info',
              title: 'Medical Insurance Renewal',
              message: `Your medical insurance premium is likely due soon. Paying it before the due date will help maintain your ₹${deductionUtilization.section80D.used.toLocaleString()} deduction.`,
              action: 'Set Reminder',
              priority: 'medium'
            })
          }
        }
        
        // Tax planning congratulations
        if (taxCalculations.recommendation?.regime === TaxRegimes.OLD && deductionUtilization.section80C.utilization > 80) {
          insights.push({
            type: 'success',
            title: 'Excellent Tax Planning!',
            message: `Great job! Your tax planning is on track. You're utilizing deductions efficiently and staying within the optimal regime.`,
            priority: 'low'
          })
        }
        
        // Add insights to store
        insights.forEach(insight => get().addAIInsight(insight))
      },
      
      askTaxAssistant: async (userInput) => {
        const state = get();
        
        const newMessage = {
            role: 'user',
            parts: [{ text: userInput }],
        };

        set({ 
            chatHistory: [...state.chatHistory, newMessage],
            isAssistantLoading: true 
        });

        let financialContext;

        if (state.useDebugDataContext) {
            console.warn("⚠️ Using DEBUG data from gemini-responses localStorage");
            const geminiResponses = JSON.parse(localStorage.getItem('gemini-responses') || '[]');
            if (geminiResponses.length > 0) {
                const latestResponse = geminiResponses[geminiResponses.length - 1];
                financialContext = {
                    userProfile: { "source": "Debug data from gemini-responses" },
                    transactions: latestResponse.processedResult.extractedData.transactions,
                    taxCalculations: { "source": "Debug data - Not calculated" },
                    deductionUtilization: { "source": "Debug data - Not calculated" },
                };
            } else {
                financialContext = { error: "No debug data found in gemini-responses" };
            }
        } else {
            console.info("🔵 Using LIVE data from application state");
            financialContext = {
                userProfile: state.userProfile,
                transactions: state.transactions,
                taxCalculations: state.taxCalculations,
                deductionUtilization: state.deductionUtilization,
            };
        }

        const response = await getChatbotResponse(financialContext, [...state.chatHistory, newMessage]);

        const assistantMessage = {
            role: 'model',
            parts: [{ text: response }],
        };

        set(prevState => ({
            chatHistory: [...prevState.chatHistory, assistantMessage],
            isAssistantLoading: false,
        }));
    },
      
      toggleDebugDataContext: () => set(state => ({ useDebugDataContext: !state.useDebugDataContext })),

      // Utility Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, {
          id: uuidv4(),
          ...notification,
          createdAt: new Date().toISOString()
        }]
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      // Data Export Actions
      exportTransactions: (format = 'csv') => {
        const { transactions } = get()
        
        if (format === 'csv') {
          const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Has Receipt']
          const csvContent = [
            headers.join(','),
            ...transactions.map(t => [
              t.date,
              `"${t.description}"`,
              t.amount,
              t.type,
              `"${t.category}"`,
              t.hasReceipt ? 'Yes' : 'No'
            ].join(','))
          ].join('\n')
          
          const blob = new Blob([csvContent], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`
          a.click()
          URL.revokeObjectURL(url)
        }
      },
      
      exportTaxSummary: () => {
        const { taxCalculations, userProfile } = get()
        
        const summary = {
          userInfo: {
            name: userProfile?.personalInfo?.firstName + ' ' + userProfile?.personalInfo?.lastName,
            pan: userProfile?.personalInfo?.pan,
            assessmentYear: userProfile?.taxInfo?.assessmentYear
          },
          taxCalculations,
          exportedAt: new Date().toISOString()
        }
        
        const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tax_summary_${format(new Date(), 'yyyy-MM-dd')}.json`
        a.click()
        URL.revokeObjectURL(url)
      },
      
      // File Management Actions
      addUploadedFile: (file) => {
        set((state) => {
          state.uploadedFiles.push(file)
        })
      },

      removeUploadedFile: (fileId) => {
        set((state) => {
          state.uploadedFiles = state.uploadedFiles.filter(f => f.id !== fileId)
        })
      },

      // Temporary Data Actions (for AI extraction confirmation)
      setTempExtractedData: (extractedData) => set({ 
        tempExtractedData: extractedData,
        pendingTransactions: extractedData?.transactions || []
      }),

      updatePendingTransaction: (index, updates) => set((state) => ({
        pendingTransactions: state.pendingTransactions.map((t, i) => 
          i === index ? { ...t, ...updates } : t
        )
      })),

      removePendingTransaction: (index) => set((state) => ({
        pendingTransactions: state.pendingTransactions.filter((_, i) => i !== index)
      })),

      confirmPendingTransactions: () => {
        const state = get()
        const { pendingTransactions } = state
        
        // Add all pending transactions to the main transactions array
        pendingTransactions.forEach(transaction => {
          get().addTransaction(transaction)
        })

        // Clear temporary data
        set({ 
          tempExtractedData: null, 
          pendingTransactions: [] 
        })

        // Generate AI insights for the new data
        get().generateAIInsights()
      },

      rejectPendingTransactions: () => set({ 
        tempExtractedData: null, 
        pendingTransactions: [] 
      }),



      // Initialize default AI insights
      initializeApp: () => {
        const state = get()
        if (state.transactions.length > 0) {
          state.calculateTax()
          state.generateAIInsights()
        }
      }
    }),
    {
      name: 'livetax-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userProfile: state.userProfile,
        isNewUser: state.isNewUser,
        transactions: state.transactions,
        taxSettings: state.taxSettings,
        uploadedFiles: state.uploadedFiles,
        tempExtractedData: state.tempExtractedData,
        pendingTransactions: state.pendingTransactions
      })
    }
  )
)
