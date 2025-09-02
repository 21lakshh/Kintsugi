import { UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router'
import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore.js'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema } from '../schemas/validation.js'
import { TransactionTypes, TransactionCategories } from '../types/index.js'
import FileUpload from '../components/FileUpload.jsx'

export default function Home() {
    const { user } = useUser()
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState('upload') // 'upload' or 'manual'

    // Zustand store hooks
    const {
        transactions,
        taxCalculations,
        deductionUtilization,
        aiInsights,
        addTransaction,
        generateAIInsights,
        initializeApp,
        loading,
        setLoading
    } = useAppStore()

    // Initialize app when component mounts
    useEffect(() => {
        initializeApp()
    }, [initializeApp])

    // React Hook Form setup
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            amount: '',
            description: '',
            type: TransactionTypes.INCOME,
            category: TransactionCategories.SALARY_INCOME,
            hasReceipt: false
        }
    })

 const openModal = () => setShowModal(true)
    const closeModal = () => {
        setShowModal(false)
        reset()
    }

    const currentDate = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })

    // Initialize app on component mount
    useEffect(() => {
        initializeApp()
    }, [initializeApp])

    // Handle manual transaction submission
    const onSubmitTransaction = async (data) => {
        try {
            setLoading(true)
            const transactionData = {
                ...data,
                amount: parseFloat(data.amount),
                hasReceipt: false // Will be updated when file upload is implemented
            }
            
            addTransaction(transactionData)
            closeModal()
            
            // Generate new AI insights after adding transaction
            setTimeout(() => {
                generateAIInsights()
            }, 100)
        } catch (error) {
            console.error('Error adding transaction:', error)
        } finally {
            setLoading(false)
        }
    }

    // Get recent transactions (last 5)
    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)

    // Get current tax liability from calculations
    const currentTaxLiability = taxCalculations?.oldRegime?.taxLiability || 0
    const regimeRecommendation = taxCalculations?.recommendation
    const transactionCount = transactions.length

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-8">
                            <Link to="/" className="text-3xl font-bold text-emerald-600">
                                LiveTax
                            </Link>
                            <div className="hidden md:flex gap-6">
                                <Link to="/home" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium border-b-2 border-emerald-600 pb-1">
                                    Dashboard
                                </Link>
                                <Link to="/transactions" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                                    Transactions
                                </Link>
                                <Link to="/analysis" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                                    Analysis
                                </Link>
                                <Link to="/filing" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                                    Filing Hub
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Universal Add Button */}
                            <button 
                                onClick={openModal}
                                className="fixed top-6 right-20 z-50 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all duration-200 hover:scale-105 flex items-center justify-center"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                            <span className="text-gray-700 font-medium">
                                {user?.firstName || 'User'}
                            </span>
                            <UserButton />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-gray-900">Add Financial Data</h3>
                                <button 
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            {/* Toggle Switch */}
                            <div className="flex items-center gap-4 mt-4">
                                <button 
                                    onClick={() => setModalType('upload')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        modalType === 'upload' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    Upload Document
                                </button>
                                <button 
                                    onClick={() => setModalType('manual')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        modalType === 'manual' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    Add Details Manually
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            {modalType === 'upload' ? (
                                <FileUpload 
                                    documentType={null}
                                    onUploadComplete={() => {
                                        // Handle successful file upload
                                        // Optionally close modal after successful upload
                                        // closeModal()
                                    }}
                                    multiple={true}
                                />
                            ) : (
                                <form onSubmit={handleSubmit(onSubmitTransaction)} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input 
                                                type="date" 
                                                {...register('date')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                                            />
                                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                placeholder="0" 
                                                {...register('amount', { valueAsNumber: true })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                                            />
                                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g., Medical Insurance Premium" 
                                            {...register('description')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                                        />
                                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                            <select 
                                                {...register('type')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            >
                                                <option value={TransactionTypes.INCOME}>Income</option>
                                                <option value={TransactionTypes.DEDUCTION}>Deduction</option>
                                                <option value={TransactionTypes.EXPENSE}>Expense</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            <select 
                                                {...register('category')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            >
                                                <optgroup label="Income">
                                                    <option value={TransactionCategories.SALARY_INCOME}>Salary Income</option>
                                                    <option value={TransactionCategories.BUSINESS_INCOME}>Business Income</option>
                                                    <option value={TransactionCategories.CAPITAL_GAINS}>Capital Gains</option>
                                                    <option value={TransactionCategories.OTHER_INCOME}>Other Income</option>
                                                </optgroup>
                                                <optgroup label="Deductions">
                                                    <option value={TransactionCategories.SECTION_80C}>80C Deduction</option>
                                                    <option value={TransactionCategories.SECTION_80D}>80D Medical</option>
                                                    <option value={TransactionCategories.HRA}>HRA</option>
                                                </optgroup>
                                                <optgroup label="Expenses">
                                                    <option value={TransactionCategories.BUSINESS_EXPENSE}>Business Expense</option>
                                                    <option value={TransactionCategories.PROFESSIONAL_TAX}>Professional Tax</option>
                                                </optgroup>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitting || loading}
                                            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {(isSubmitting || loading) ? 'Adding...' : 'Add Transaction'}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={closeModal} 
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Hello, {user?.firstName || 'User'}! Here's your financial snapshot for {currentDate}.
                    </h1>
                </div>

                {/* Live Financial Pulse - Key Metrics */}
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    {/* Estimated Tax Liability */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Estimated Tax Liability</h3>
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                        <div className="mb-3">
                            <span className="text-3xl font-bold text-gray-900">₹{currentTaxLiability.toLocaleString()}</span>
                    </div>
                        <div className="mb-4">
                            {/* Simple sparkline representation */}
                            <div className="flex items-end space-x-1 h-8">
                                {[40, 45, 35, 55, 48, 52, 58, 62, 59, 65, 70, Math.min(100, (currentTaxLiability / 1000))].map((height, i) => (
                                    <div key={i} className="bg-red-200 w-2" style={{height: `${height}%`}}></div>
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">Based on {transactionCount} transactions this FY</p>
                    </div>

                    {/* Regime Recommendation */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Regime Recommendation</h3>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-3 mb-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Old Regime</span>
                                    <span className="font-medium">₹{(taxCalculations?.oldRegime?.taxLiability || 0).toLocaleString()}</span>
                                </div>
                                <div className="bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${regimeRecommendation?.regime === 'old' ? 'bg-green-500' : 'bg-gray-400'}`} 
                                        style={{width: `${Math.min(100, (taxCalculations?.oldRegime?.taxLiability || 0) / 1500)}%`}}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">New Regime</span>
                                    <span className="font-medium">₹{(taxCalculations?.newRegime?.taxLiability || 0).toLocaleString()}</span>
                                </div>
                                <div className="bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${regimeRecommendation?.regime === 'new' ? 'bg-green-500' : 'bg-gray-400'}`} 
                                        style={{width: `${Math.min(100, (taxCalculations?.newRegime?.taxLiability || 0) / 1500)}%`}}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        {regimeRecommendation && (
                            <>
                                <p className="text-sm text-green-600 font-medium">
                                    ✓ You're better off with the {regimeRecommendation.regime === 'old' ? 'Old' : 'New'} Regime
                                </p>
                                <p className="text-sm text-gray-600">Projected savings: ₹{regimeRecommendation.savings.toLocaleString()}</p>
                            </>
                        )}
                    </div>

                    {/* Deduction Utilization */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Deduction Utilization</h3>
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="space-y-4">
                                <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">80C</span>
                                    <span className="font-medium">₹{deductionUtilization.section80C.used.toLocaleString()} / ₹{deductionUtilization.section80C.limit.toLocaleString()}</span>
                                </div>
                                <div className="bg-gray-200 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${deductionUtilization.section80C.utilization}%`}}></div>
                                </div>
                                <span className="text-xs text-gray-500">{deductionUtilization.section80C.utilization.toFixed(0)}% utilized</span>
                            </div>
                                <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">80D</span>
                                    <span className="font-medium">₹{deductionUtilization.section80D.used.toLocaleString()} / ₹{deductionUtilization.section80D.limit.toLocaleString()}</span>
                                </div>
                                <div className="bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${deductionUtilization.section80D.utilization === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                        style={{width: `${deductionUtilization.section80D.utilization}%`}}
                                    ></div>
                                </div>
                                <span className={`text-xs ${deductionUtilization.section80D.utilization === 100 ? 'text-green-600' : 'text-gray-500'}`}>
                                    {deductionUtilization.section80D.utilization.toFixed(0)}% utilized
                                </span>
                            </div>
                                <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">HRA</span>
                                    <span className="font-medium">₹{deductionUtilization.hra.used.toLocaleString()} / ₹{deductionUtilization.hra.limit.toLocaleString()}</span>
                                </div>
                                <div className="bg-gray-200 rounded-full h-2">
                                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${deductionUtilization.hra.utilization}%`}}></div>
                                </div>
                                <span className="text-xs text-gray-500">{deductionUtilization.hra.utilization.toFixed(0)}% utilized</span>
                            </div>
                        </div>
                        {deductionUtilization.section80C.utilization < 100 && (
                            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                                <p className="text-sm text-amber-800">
                                    💡 Max out 80C to save an extra ₹{((deductionUtilization.section80C.limit - deductionUtilization.section80C.used) * 0.3).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Transaction Ledger */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                                <Link to="/transactions" className="text-emerald-600 hover:text-emerald-700 font-medium">View All</Link>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{transaction.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    transaction.type === 'Income' ? 'bg-green-100 text-green-800' :
                                                    transaction.type === 'Deduction' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {transaction.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {transaction.hasReceipt ? (
                                                    <span className="text-emerald-600">📎</span>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* AI Assistant Panel */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Your Tax Assistant
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">Powered by AI</p>
                        </div>
                        <div className="p-6 space-y-4">
                            {aiInsights.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">Add some transactions to get personalized AI insights!</p>
                                </div>
                            ) : (
                                aiInsights.slice(0, 3).map((insight) => (
                                    <div 
                                        key={insight.id} 
                                        className={`p-4 rounded-lg ${
                                            insight.type === 'info' ? 'bg-blue-50' :
                                            insight.type === 'warning' ? 'bg-amber-50' :
                                            insight.type === 'success' ? 'bg-green-50' : 'bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                insight.type === 'info' ? 'bg-blue-100' :
                                                insight.type === 'warning' ? 'bg-amber-100' :
                                                insight.type === 'success' ? 'bg-green-100' : 'bg-gray-100'
                                            }`}>
                                                {insight.type === 'info' && (
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                )}
                                                {insight.type === 'warning' && (
                                                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                    </svg>
                                                )}
                                                {insight.type === 'success' && (
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                                )}
                                </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-900 mb-1">{insight.title}</h4>
                                                <p className="text-sm text-gray-700 mb-2">{insight.message}</p>
                                                {insight.action && (
                                                    <button className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                                        insight.type === 'info' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                                                        insight.type === 'warning' ? 'bg-amber-600 text-white hover:bg-amber-700' :
                                                        insight.type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-600 text-white hover:bg-gray-700'
                                                    }`}>
                                                        {insight.action}
                            </button>
                                                )}
                                            </div>
                                </div>
                                </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}