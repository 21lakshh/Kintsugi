import { GoogleGenerativeAI } from "@google/generative-ai";
import { TransactionTypes, TransactionCategories } from '../types/index.js';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Document type specific prompts
const DOCUMENT_PROMPTS = {
  form16: `
    Analyze this Form 16 document and extract the following financial information in JSON format:
    
    {
      "documentType": "form16",
      "employeeDetails": {
        "name": "string",
        "pan": "string",
        "employerName": "string",
        "assessmentYear": "string"
      },
      "transactions": [
        {
          "type": "Income|Deduction|Expense",
          "category": "Salary Income|80C Deduction|80D Medical|HRA|Professional Tax",
          "amount": number,
          "description": "string",
          "date": "YYYY-MM-DD",
          "hasReceipt": boolean
        }
      ],
      "taxDetails": {
        "grossSalary": number,
        "standardDeduction": number,
        "section80C": number,
        "section80D": number,
        "hra": number,
        "professionalTax": number,
        "tdsDeducted": number
      },
      "confidence": number (0-1)
    }
    
    Extract ALL salary components, deductions, and TDS details. Be precise with amounts.
  `,
  
  salary_slip: `
    Extract salary data as JSON:
    
    Rules:
    - Basic Pay/Allowances → "Income", "Salary Income"
    - PF/EPF → "Deduction", "80C Deduction"  
    - Medical Insurance → "Deduction", "80D Medical"
    - Professional Tax/TDS → "Expense", "Professional Tax"
    
    {
      "documentType": "salary_slip",
      "transactions": [
        {
          "type": "Income|Deduction|Expense",
          "category": "Salary Income|80C Deduction|80D Medical|Professional Tax",
          "amount": number,
          "description": "string",
          "date": "YYYY-MM-DD",
          "hasReceipt": true
        }
      ],
      "confidence": 0.9
    }
    
    Return ONLY JSON. Extract all salary components.
  `,
  
  investment_proof: `
    Analyze this investment/deduction proof document and extract:
    
    {
      "documentType": "investment_proof",
      "transactions": [
        {
          "type": "Deduction",
          "category": "80C Deduction|80D Medical",
          "amount": number,
          "description": "string (investment type/policy details)",
          "date": "YYYY-MM-DD",
          "hasReceipt": true
        }
      ],
      "investmentDetails": {
        "section": "80C|80D|80CCD",
        "investmentType": "string",
        "policyNumber": "string",
        "maturityDate": "YYYY-MM-DD"
      },
      "confidence": number (0-1)
    }
  `,
  
  business_document: `
    Analyze this business document (P&L, invoice, expense receipt) and extract:
    
    {
      "documentType": "business_document",
      "transactions": [
        {
          "type": "Income|Expense",
          "category": "Business Income|Business Expense",
          "amount": number,
          "description": "string",
          "date": "YYYY-MM-DD",
          "hasReceipt": true
        }
      ],
      "businessDetails": {
        "invoiceNumber": "string",
        "clientName": "string",
        "serviceDescription": "string",
        "gstAmount": number
      },
      "confidence": number (0-1)
    }
  `
};

/**
 * Process uploaded document with AI
 * @param {File} file - The uploaded document
 * @param {string} documentType - Type of document (form16, salary_slip, etc.)
 * @param {Object} userProfile - User profile for context
 * @returns {Promise<Object>} Extracted financial data
 */
export const processDocumentWithAI = async (file, documentType, userProfile) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent extraction
      }
    });
    
    // Convert file to base64
    const fileData = await fileToGenerativePart(file);
    
    // Get appropriate prompt - default to salary_slip for better categorization
    const prompt = DOCUMENT_PROMPTS[documentType] || DOCUMENT_PROMPTS.salary_slip;
    
    // Add user context to prompt
    const contextualPrompt = `
      ${prompt}
      
      User Context:
      - User Type: ${userProfile?.userType || 'salaried'}
      - Assessment Year: ${userProfile?.assessmentYear || '2024-25'}
      - Preferred Tax Regime: ${userProfile?.taxRegime || 'old'}
      
      Important: Return ONLY valid JSON. No markdown formatting or additional text.
    `;
    
    const result = await model.generateContent([contextualPrompt, fileData]);
    const response = await result.response;
    
    // Check for response issues
    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error('No valid response from Gemini API - response may have been blocked')
    }
    
    const candidate = response.candidates[0]
    console.log('🤖 Gemini response status:', {
      finishReason: candidate.finishReason,
      hasContent: !!candidate.content,
      hasParts: !!candidate.content?.parts?.length
    })
    
    // Handle different finish reasons
    if (candidate.finishReason === 'MAX_TOKENS') {
      throw new Error('Response was truncated due to token limit. The document might be too large or complex. Try with a smaller/simpler document.')
    }
    
    if (candidate.finishReason === 'SAFETY') {
      throw new Error('Response was blocked for safety reasons. The document content may have triggered safety filters.')
    }
    
    if (candidate.finishReason === 'RECITATION') {
      throw new Error('Response was blocked due to recitation concerns.')
    }
    
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('Empty response from Gemini API')
    }
    
    const text = candidate.content.parts[0].text
    
    if (!text || text.trim() === '') {
      throw new Error('No text content in Gemini response')
    }
    
    // Parse JSON response
    const extractedData = JSON.parse(text.replace(/```json\n?|```\n?/g, ''));
    
    console.log('🤖 AI Raw Response:', extractedData);
    
    // Validate and normalize transactions
    const normalizedTransactions = extractedData.transactions?.map(transaction => {
      // Apply smart categorization
      const smartCategory = smartCategorizeTransaction(transaction);
      
      console.log(`📊 Processing: ${transaction.description}`);
      console.log(`   Original: ${transaction.type} -> ${transaction.category}`);
      console.log(`   Smart: ${smartCategory.type} -> ${smartCategory.category}`);
      
      return {
        ...transaction,
        id: null, // Will be set by store
        type: smartCategory.type,
        category: smartCategory.category,
        amount: Math.abs(Number(transaction.amount)),
        date: transaction.date || new Date().toISOString().split('T')[0],
        hasReceipt: true,
        source: 'ai_extracted',
        documentId: file.name
      };
    }) || [];
    
    console.log('✅ Normalized Transactions:', normalizedTransactions);
    
    const finalResult = {
      success: true,
      extractedData: {
        ...extractedData,
        transactions: normalizedTransactions
      },
      metadata: {
        documentType: extractedData.documentType || documentType,
        processingTime: new Date().toISOString(),
        fileName: file.name,
        fileSize: file.size,
        confidence: extractedData.confidence || 0.8
      }
    };
    
    // Save to separate localStorage for debugging/persistence
    try {
      const geminiResponses = JSON.parse(localStorage.getItem('gemini-responses') || '[]');
      geminiResponses.push({
        timestamp: new Date().toISOString(),
        fileName: file.name,
        rawResponse: extractedData,
        processedResult: finalResult
      });
      // Keep only last 10 responses
      if (geminiResponses.length > 10) {
        geminiResponses.shift();
      }
      localStorage.setItem('gemini-responses', JSON.stringify(geminiResponses));
      console.log('💾 Saved to gemini-responses localStorage');
    } catch (error) {
      console.error('Failed to save to gemini-responses:', error);
    }
    
    return finalResult;
    
  } catch (error) {
    console.error('AI document processing failed:', error);
    return {
      success: false,
      error: error.message,
      extractedData: {
        transactions: [],
        confidence: 0
      },
      metadata: {
        documentType: documentType,
        processingTime: new Date().toISOString(),
        fileName: file.name,
        error: true
      }
    };
  }
}

/**
 * Generates a conversational response from the Tax Assistant chatbot.
 * @param {object} financialContext - A summary of the user's financial data.
 * @param {Array<object>} chatHistory - The history of the conversation so far.
 * @returns {Promise<string>} The chatbot's response.
 */
export const getChatbotResponse = async (financialContext, chatHistory) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const summarizedContext = {
        ...financialContext.userProfile,
        taxLiability: {
            oldRegime: financialContext.taxCalculations?.oldRegime?.taxLiability,
            newRegime: financialContext.taxCalculations?.newRegime?.taxLiability,
        },
        deductions: financialContext.deductionUtilization,
        totalIncome: financialContext.taxCalculations?.oldRegime?.grossIncome,
        transactionCount: financialContext.transactions.length,
    };

    const systemPrompt = `
        You are "Tax Assistant," an expert AI tax advisor for an application called LiveTax. 
        Your tone is helpful, friendly, and professional.
        You have access to the user's real-time financial data.
        Your goal is to answer the user's questions based on their specific financial context.
        NEVER give generic advice. ALWAYS use the provided data to give personalized, actionable insights.
        Keep your answers concise and easy to understand. Use markdown for formatting (bold, lists).
        
        CURRENT USER'S FINANCIAL CONTEXT (JSON):
        ${JSON.stringify(summarizedContext, null, 2)}
    `;

    try {
        const chat = model.startChat({
            history: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: "Understood. I am Tax Assistant, and I will answer questions based on the user's provided financial context." }] },
                ...chatHistory,
            ],
        });

        const latestUserInput = chatHistory[chatHistory.length - 1].parts[0].text;
        const result = await chat.sendMessage(latestUserInput);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini chat generation failed:", error);
        return "I'm sorry, I encountered an error while processing your request. Please try again.";
    }
};

/**
 * Generate personalized tax insights using AI
 * @param {Object} userProfile - Complete user profile
 * @param {Array} transactions - User's transactions
 * @param {Object} taxCalculations - Current tax calculations
 * @returns {Promise<Array>} AI-generated insights
 */
export const generatePersonalizedInsights = async () => {
  // TODO: Integrate with Gemini API for personalized insights
  
  // AI insights generation would happen here
  // Integration with Gemini LLM service

  // Return structure for LLM integration
  const insights = []

  // Based on user profile, generate contextual insights
  // Salaried and business-specific insights will be generated by LLM

  return insights
}

/**
 * Generate ITR filing recommendations
 * @param {Object} userProfile - User profile
 * @param {Array} transactions - All transactions
 * @param {Object} taxCalculations - Tax calculations
 * @returns {Promise<Object>} Filing recommendations
 */
export const generateFilingRecommendations = async () => {
  // TODO: Integrate with Gemini API for filing guidance
  
  return {
    recommendedForm: 'ITR-1', // Will be determined by LLM
    readinessScore: 0,
    missingDocuments: [],
    recommendations: []
  }
}

/**
 * Analyze tax optimization opportunities
 * @param {Object} userProfile - User profile
 * @param {Array} transactions - All transactions
 * @returns {Promise<Array>} Optimization suggestions
 */
export const analyzeTaxOptimization = async () => {
  // TODO: Integrate with Gemini API for optimization analysis
  
  return {
    suggestions: [],
    potentialSavings: 0,
    urgentActions: [],
    longTermPlanning: []
  }
}

// Helper function to convert file to base64 for Gemini
async function fileToGenerativePart(file) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
}

// Validation functions
function validateTransactionType(type) {
  const validTypes = Object.values(TransactionTypes);
  return validTypes.includes(type) ? type : TransactionTypes.INCOME;
}

function validateTransactionCategory(category, type) {
  const validCategories = Object.values(TransactionCategories);
  if (validCategories.includes(category)) {
    return category;
  }
  
  // Default categories based on type
  switch (type) {
    case TransactionTypes.INCOME:
      return TransactionCategories.SALARY_INCOME;
    case TransactionTypes.DEDUCTION:
      return TransactionCategories.SECTION_80C;
    case TransactionTypes.EXPENSE:
      return TransactionCategories.BUSINESS_EXPENSE;
    default:
      return TransactionCategories.SALARY_INCOME;
  }
}

// Smart categorization based on transaction description and context
function smartCategorizeTransaction(transaction) {
  const description = transaction.description.toLowerCase();
  const amount = transaction.amount;
  
  // Salary income components
  if (description.includes('basic pay') || description.includes('salary')) {
    return {
      type: TransactionTypes.INCOME,
      category: TransactionCategories.SALARY_INCOME
    };
  }
  
  // HRA - part of gross salary, so it's income (deduction is claimed separately)
  if (description.includes('hra') || description.includes('house rent')) {
    return {
      type: TransactionTypes.INCOME,
      category: TransactionCategories.SALARY_INCOME
    };
  }
  
  // Allowances - usually income
  if (description.includes('allowance') || description.includes('overtime') || description.includes('bonus')) {
    return {
      type: TransactionTypes.INCOME,
      category: TransactionCategories.SALARY_INCOME
    };
  }
  
  // Deductions from salary
  if (description.includes('provident fund') || description.includes('pf') || description.includes('epf')) {
    return {
      type: TransactionTypes.DEDUCTION,
      category: TransactionCategories.SECTION_80C
    };
  }
  
  if (description.includes('medical') && (description.includes('insurance') || description.includes('premium'))) {
    return {
      type: TransactionTypes.DEDUCTION,
      category: TransactionCategories.SECTION_80D
    };
  }
  
  if (description.includes('professional tax') || description.includes('pt')) {
    return {
      type: TransactionTypes.EXPENSE,
      category: TransactionCategories.PROFESSIONAL_TAX
    };
  }
  
  if (description.includes('tds') || description.includes('income tax')) {
    return {
      type: TransactionTypes.EXPENSE,
      category: TransactionCategories.TAX_PAID
    };
  }
  
  // ESI and other statutory deductions
  if (description.includes('esi') || description.includes('employee state insurance')) {
    return {
      type: TransactionTypes.EXPENSE,
      category: TransactionCategories.PROFESSIONAL_TAX
    };
  }

  if (description.includes('other deductions')) {
    return {
      type: TransactionTypes.EXPENSE,
      category: TransactionCategories.OTHER_EXPENSE
    };
  }
  
  // Default fallback
  return {
    type: transaction.type,
    category: validateTransactionCategory(transaction.category, transaction.type)
  };
}
