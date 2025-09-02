import { UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router'
import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore.js'

export default function Analysis() {
    const { user } = useUser()
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState('upload')
    const [activeTab, setActiveTab] = useState('comparison')
    const [whatIfInvestment, setWhatIfInvestment] = useState(50000)
    const [whatIfCategory, setWhatIfCategory] = useState('ELSS')

    // Zustand store hooks
    const {
        userProfile,
        transactions,
        taxCalculations,
        deductionUtilization,
        calculateTax
    } = useAppStore()

    const openModal = () => setShowModal(true)
    const closeModal = () => setShowModal(false)

    // Initialize when component mounts
    useEffect(() => {
        // Any initialization logic can go here
    }, [])

    // Calculate what-if savings based on tax bracket
    const calculateWhatIfSavings = (investment) => {
        if (!taxCalculations?.oldRegime?.taxableIncome) return investment * 0.2 // Default 20%
        
        const taxableIncome = taxCalculations.oldRegime.taxableIncome
        let taxRate = 0.2 // Default
        
        if (taxableIncome > 1000000) taxRate = 0.3
        else if (taxableIncome > 500000) taxRate = 0.2
        else if (taxableIncome > 250000) taxRate = 0.05
        
        return investment * taxRate
    }

    const whatIfSavings = calculateWhatIfSavings(whatIfInvestment)

    // Get breakdown data from transactions
    const getIncomeBreakdown = () => {
        return transactions
            .filter(t => t.type === 'Income')
            .reduce((acc, t) => {
                const existing = acc.find(item => item.category === t.category)
                if (existing) {
                    existing.amount += t.amount
                } else {
                    acc.push({ category: t.category, amount: t.amount })
                }
                return acc
            }, [])
    }

    const getDeductionBreakdown = () => {
        return transactions
            .filter(t => t.type === 'Deduction')
            .reduce((acc, t) => {
                const existing = acc.find(item => item.category === t.category)
                if (existing) {
                    existing.amount += t.amount
                } else {
                    acc.push({ category: t.category, amount: t.amount })
                }
                return acc
            }, [])
    }

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
                                <Link to="/home" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                                    Dashboard
                                </Link>
                                <Link to="/transactions" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                                    Transactions
                                </Link>
                                <Link to="/analysis" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium border-b-2 border-emerald-600 pb-1">
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

            {/* Modal Overlay - Same as other pages */}
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
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-lg font-medium text-gray-900 mb-2">Upload Receipt or Document</p>
                                    <p className="text-gray-600 mb-4">Drag and drop or click to select files</p>
                                    <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                                        Choose Files
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">Supports PDF, JPG, PNG files</p>
                                </div>
                            ) : (
                                <form className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                            <input type="number" placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <input type="text" placeholder="e.g., Medical Insurance Premium" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                                            <option>Select Category</option>
                                            <option>80C Deduction</option>
                                            <option>80D Medical</option>
                                            <option>HRA</option>
                                            <option>Business Income</option>
                                            <option>Salary Income</option>
                                            <option>Capital Gains</option>
                                            <option>Other Income</option>
                                            <option>Business Expense</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                                            Add Transaction
                                        </button>
                                        <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Deep Dive Analysis</h1>
                    <p className="text-gray-600">Strategic tax planning with regime comparison and what-if scenarios.</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('comparison')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'comparison'
                                        ? 'border-emerald-500 text-emerald-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Regime Comparison
                            </button>
                            <button
                                onClick={() => setActiveTab('breakdown')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'breakdown'
                                        ? 'border-emerald-500 text-emerald-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Detailed Breakdown
                            </button>
                            <button
                                onClick={() => setActiveTab('whatif')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'whatif'
                                        ? 'border-emerald-500 text-emerald-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                What-If Analysis
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'comparison' && (
                            <div className="space-y-8">
                                {taxCalculations ? (
                                    <>
                                        {/* Regime Comparison Chart */}
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className={`p-6 rounded-xl border ${
                                                taxCalculations.recommendation?.regime === 'old' 
                                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                                                    : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
                                            }`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-xl font-semibold text-gray-900">Old Regime</h3>
                                                    {taxCalculations.recommendation?.regime === 'old' && (
                                                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                            Recommended
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Tax Liability</span>
                                                        <span className={`font-bold text-2xl ${
                                                            taxCalculations.recommendation?.regime === 'old' ? 'text-green-600' : 'text-gray-600'
                                                        }`}>
                                                            ₹{(taxCalculations.oldRegime?.taxLiability || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Effective Tax Rate</span>
                                                        <span className="font-medium">{(taxCalculations.oldRegime?.effectiveRate || 0).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="pt-2 border-t border-green-200">
                                                        <div className="text-sm text-gray-600 space-y-1">
                                                            <div className="flex justify-between">
                                                                <span>Gross Income</span>
                                                                <span>₹{(taxCalculations.oldRegime?.grossIncome || 0).toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Total Deductions</span>
                                                                <span>-₹{(taxCalculations.oldRegime?.totalDeductions || 0).toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between font-medium border-t pt-1">
                                                                <span>Taxable Income</span>
                                                                <span>₹{(taxCalculations.oldRegime?.taxableIncome || 0).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`p-6 rounded-xl border ${
                                                taxCalculations.recommendation?.regime === 'new' 
                                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                                                    : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
                                            }`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-xl font-semibold text-gray-900">New Regime</h3>
                                                    {taxCalculations.recommendation?.regime === 'new' && (
                                                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                            Recommended
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Tax Liability</span>
                                                        <span className={`font-bold text-2xl ${
                                                            taxCalculations.recommendation?.regime === 'new' ? 'text-green-600' : 'text-gray-600'
                                                        }`}>
                                                            ₹{(taxCalculations.newRegime?.taxLiability || 0).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Effective Tax Rate</span>
                                                        <span className="font-medium">{(taxCalculations.newRegime?.effectiveRate || 0).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="pt-2 border-t border-gray-200">
                                                        <div className="text-sm text-gray-600 space-y-1">
                                                            <div className="flex justify-between">
                                                                <span>Gross Income</span>
                                                                <span>₹{(taxCalculations.newRegime?.grossIncome || 0).toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Standard Deduction</span>
                                                                <span>-₹{(taxCalculations.newRegime?.totalDeductions || 0).toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>No other deductions</span>
                                                                <span>₹0</span>
                                                            </div>
                                                            <div className="flex justify-between font-medium border-t pt-1">
                                                                <span>Taxable Income</span>
                                                                <span>₹{(taxCalculations.newRegime?.taxableIncome || 0).toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Savings Summary */}
                                        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                                            <div className="text-center">
                                                <h3 className="text-2xl font-bold text-emerald-900 mb-2">
                                                    {taxCalculations.recommendation?.reason}
                                                </h3>
                                                <p className="text-emerald-700">
                                                    You save ₹{(taxCalculations.recommendation?.savings || 0).toLocaleString()} with the {taxCalculations.recommendation?.regime} regime.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="text-center">
                                            <button 
                                                onClick={calculateTax}
                                                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                                            >
                                                Recalculate Analysis
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 mb-4">
                                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
                                        <p className="text-gray-600 mb-4">Add some transactions to see your regime comparison</p>
                                        <Link 
                                            to="/home" 
                                            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                                        >
                                            Add Transactions
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'breakdown' && (
                            <div className="space-y-8">
                                {transactions.length > 0 ? (
                                    <>
                                        {/* AI-Generated Analysis - Ready for LLM integration */}
                                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-blue-900 mb-3">AI Analysis Results</h3>
                                                    <div className="prose text-blue-800 space-y-4">
                                                        <p>
                                                            <strong>Profile Analysis:</strong> Based on your {userProfile?.userType} profile with {transactions.length} transactions, 
                                                            your total recorded income is ₹{transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}.
                                                        </p>
                                                        
                                                        {deductionUtilization.section80C.utilization < 100 && (
                                                            <p>
                                                                <strong>Section 80C Optimization:</strong> You've utilized ₹{deductionUtilization.section80C.used.toLocaleString()} out of the ₹{deductionUtilization.section80C.limit.toLocaleString()} limit. 
                                                                Consider maximizing the remaining ₹{(deductionUtilization.section80C.limit - deductionUtilization.section80C.used).toLocaleString()} through ELSS investments.
                                                            </p>
                                                        )}

                                                        {userProfile?.housingDetails?.housingStatus === 'rented' && (
                                                            <p>
                                                                <strong>HRA Strategy:</strong> As a tenant with monthly rent of ₹{userProfile.housingDetails.monthlyRent?.toLocaleString()}, 
                                                                ensure you're claiming HRA exemption optimally based on your salary structure.
                                                            </p>
                                                        )}

                                                        {userProfile?.userType === 'business' && (
                                                            <p>
                                                                <strong>Business Tax Planning:</strong> As a business owner, consider if presumptive taxation under Section 44AD 
                                                                (8% of gross receipts) would be beneficial for your {userProfile.employmentDetails?.businessType} business.
                                                            </p>
                                                        )}
                                                        
                                                        <p className="text-sm text-blue-600">
                                                            💡 This analysis will become more detailed as you add more transactions and upload documents.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Breakdown Tables */}
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Breakdown</h3>
                                                <div className="space-y-3">
                                                    {getIncomeBreakdown().length > 0 ? (
                                                        <>
                                                            {getIncomeBreakdown().map((income, index) => (
                                                                <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                                                                    <span className="text-gray-600">{income.category}</span>
                                                                    <span className="font-medium">₹{income.amount.toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                            <div className="flex justify-between py-2 font-semibold">
                                                                <span>Total Gross Income</span>
                                                                <span>₹{getIncomeBreakdown().reduce((sum, income) => sum + income.amount, 0).toLocaleString()}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p className="text-gray-500 text-center py-4">No income transactions recorded</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Deduction Breakdown</h3>
                                                <div className="space-y-3">
                                                    {getDeductionBreakdown().length > 0 ? (
                                                        <>
                                                            {getDeductionBreakdown().map((deduction, index) => (
                                                                <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                                                                    <span className="text-gray-600">{deduction.category}</span>
                                                                    <span className="font-medium">₹{deduction.amount.toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                            <div className="flex justify-between py-2 border-b border-gray-100">
                                                                <span className="text-gray-600">Standard Deduction</span>
                                                                <span className="font-medium">₹50,000</span>
                                                            </div>
                                                            <div className="flex justify-between py-2 font-semibold">
                                                                <span>Total Deductions</span>
                                                                <span>₹{(getDeductionBreakdown().reduce((sum, ded) => sum + ded.amount, 0) + 50000).toLocaleString()}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p className="text-gray-500 text-center py-4">No deduction transactions recorded</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 mb-4">
                                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Found</h3>
                                        <p className="text-gray-600 mb-4">Add some transactions to see detailed analysis</p>
                                        <Link 
                                            to="/home" 
                                            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                                        >
                                            Add Transactions
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'whatif' && (
                            <div className="space-y-8">
                                {/* What-If Calculator */}
                                <div className="bg-white p-6 rounded-xl border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Investment Scenario Calculator</h3>
                                    
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Additional Investment Amount
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2 text-gray-500">₹</span>
                                                    <input
                                                        type="number"
                                                        value={whatIfInvestment}
                                                        onChange={(e) => setWhatIfInvestment(Number(e.target.value))}
                                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                        placeholder="50000"
                                                    />
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="150000"
                                                    step="5000"
                                                    value={whatIfInvestment}
                                                    onChange={(e) => setWhatIfInvestment(Number(e.target.value))}
                                                    className="w-full mt-2"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Investment Category
                                                </label>
                                                <select
                                                    value={whatIfCategory}
                                                    onChange={(e) => setWhatIfCategory(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                >
                                                    <option value="ELSS">ELSS Mutual Funds</option>
                                                    <option value="PPF">Public Provident Fund</option>
                                                    <option value="NSC">National Savings Certificate</option>
                                                    <option value="LIC">Life Insurance Premium</option>
                                                    <option value="FD">Tax Saving Fixed Deposit</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50 p-6 rounded-xl">
                                            <h4 className="font-semibold text-emerald-900 mb-4">Scenario Results</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-emerald-700">Investment Amount</span>
                                                    <span className="font-bold">₹{whatIfInvestment.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-emerald-700">Tax Savings</span>
                                                    <span className="font-bold text-green-600">₹{whatIfSavings.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-emerald-700">Effective Cost</span>
                                                    <span className="font-bold">₹{(whatIfInvestment - whatIfSavings).toLocaleString()}</span>
                                                </div>
                                                <div className="border-t border-emerald-200 pt-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-emerald-700">New Tax Liability</span>
                                                        <span className="font-bold">₹{((taxCalculations?.oldRegime?.taxLiability || 0) - whatIfSavings).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Multiple Scenarios */}
                                <div className="bg-white p-6 rounded-xl border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Scenario Comparisons</h3>
                                    
                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="border border-gray-200 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-3">Conservative (₹25,000 ELSS)</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Investment</span>
                                                    <span>₹25,000</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Tax Saving</span>
                                                    <span className="text-green-600">₹7,500</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Net Cost</span>
                                                    <span>₹17,500</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="border border-emerald-300 bg-emerald-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-emerald-900 mb-3">Optimal (₹50,000 Mix)</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-emerald-700">Investment</span>
                                                    <span>₹50,000</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-emerald-700">Tax Saving</span>
                                                    <span className="text-green-600">₹15,000</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-emerald-700">Net Cost</span>
                                                    <span>₹35,000</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="border border-gray-200 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-3">Aggressive (₹75,000 PPF)</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Investment</span>
                                                    <span>₹75,000</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Tax Saving</span>
                                                    <span className="text-green-600">₹22,500</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Net Cost</span>
                                                    <span>₹52,500</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recommendation */}
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                    <h4 className="font-semibold text-blue-900 mb-3">💡 Smart Recommendation</h4>
                                    <p className="text-blue-800">
                                        Based on your current financial position and remaining 80C limit of ₹30,000, 
                                        we recommend investing in ELSS mutual funds. This will give you tax savings of ₹9,000 
                                        while providing potential for higher returns compared to traditional tax-saving options.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
