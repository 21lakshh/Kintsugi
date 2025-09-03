import { UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router'
import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore.js'
import { TransactionTypes, TransactionCategories } from '../types/index.js'

export default function Transactions() {
    const { user } = useUser()
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState('upload')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedType, setSelectedType] = useState('all')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [dateRange, setDateRange] = useState('all')

    // Zustand store hooks
    const {
        transactions,
        setTransactionFilters,
        deleteTransaction,
        exportTransactions
    } = useAppStore()

    const openModal = () => setShowModal(true)
    const closeModal = () => setShowModal(false)

    // Initialize when component mounts
    useEffect(() => {
        // Any initialization logic can go here
    }, [])

    // Update filters in store when changed
    useEffect(() => {
        setTransactionFilters({
            searchTerm,
            type: selectedType,
            category: selectedCategory,
            dateRange
        })
    }, [searchTerm, selectedType, selectedCategory, dateRange, setTransactionFilters])

    // Filter transactions based on search and filter criteria
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = selectedType === 'all' || transaction.type === selectedType
        const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory
        
        // Date filtering
        let matchesDate = true
        if (dateRange === 'last30') {
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            matchesDate = new Date(transaction.date) >= thirtyDaysAgo
        } else if (dateRange === 'last90') {
            const ninetyDaysAgo = new Date()
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
            matchesDate = new Date(transaction.date) >= ninetyDaysAgo
        }
        
        return matchesSearch && matchesType && matchesCategory && matchesDate
    })

    // Calculate tax impact for each transaction
    const calculateTaxImpact = (transaction) => {
        const taxRate = 0.3 // Simplified tax rate
        if (transaction.type === 'Income') {
            return transaction.amount * taxRate
        } else if (transaction.type === 'Deduction') {
            return -(transaction.amount * taxRate)
        }
        return 0
    }

    const totalTransactions = filteredTransactions.length
    const totalIncome = filteredTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0)
    const totalDeductions = filteredTransactions.filter(t => t.type === 'Deduction').reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = filteredTransactions.filter(t => t.type === 'Expense' && t.category !== TransactionCategories.TAX_PAID).reduce((sum, t) => sum + t.amount, 0)
    const taxPaid = filteredTransactions.filter(t => t.category === TransactionCategories.TAX_PAID).reduce((sum, t) => sum + t.amount, 0)

    const handleDeleteTransaction = (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            deleteTransaction(id)
        }
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
                                <Link to="/transactions" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium border-b-2 border-emerald-600 pb-1">
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

            {/* Modal Overlay - Same as Home */}
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Transaction History</h1>
                    <p className="text-gray-600">Your comprehensive financial ledger with powerful filtering and search capabilities.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid md:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Total Transactions</h3>
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Total Income</h3>
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">₹{totalIncome.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Total Deductions</h3>
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">₹{totalDeductions.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">₹{totalExpenses.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-600">Tax Paid (TDS)</h3>
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">₹{taxPaid.toLocaleString()}</p>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="grid md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="all">All Types</option>
                                <option value="Income">Income</option>
                                <option value="Deduction">Deduction</option>
                                <option value="Expense">Expense</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="all">All Categories</option>
                                <option value="80C Deduction">80C Deduction</option>
                                <option value="80D Medical">80D Medical</option>
                                <option value="HRA">HRA</option>
                                <option value="Business Income">Business Income</option>
                                <option value="Salary Income">Salary Income</option>
                                <option value="Business Expense">Business Expense</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="all">All Time</option>
                                <option value="last30">Last 30 Days</option>
                                <option value="last90">Last 90 Days</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button 
                                onClick={() => exportTransactions('csv')}
                                disabled={filteredTransactions.length === 0}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Export CSV
                            </button>
                            <Link 
                                to="/home"
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Add Transactions
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Transaction Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">
                            All Transactions ({filteredTransactions.length})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax Impact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        transaction.type === 'Income' ? 'bg-green-500' :
                                                        transaction.type === 'Deduction' ? 'bg-blue-500' :
                                                        'bg-gray-500'
                                                    }`}></div>
                                                    <span className="text-sm text-gray-900">{transaction.category}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{transaction.amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`font-medium ${
                                                    calculateTaxImpact(transaction) > 0 ? 'text-red-600' : 'text-green-600'
                                                }`}>
                                                    {calculateTaxImpact(transaction) > 0 ? '+' : ''}₹{Math.abs(calculateTaxImpact(transaction)).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center gap-2">
                                                    <button className="text-emerald-600 hover:text-emerald-700">Edit</button>
                                                    <button 
                                                        onClick={() => handleDeleteTransaction(transaction.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                    {transaction.hasReceipt && (
                                                        <button className="text-blue-600 hover:text-blue-700">📎 View</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="text-gray-400 mb-4">
                                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Found</h3>
                                            <p className="text-gray-600 mb-4">
                                                {transactions.length === 0 
                                                    ? 'Start by adding your first transaction'
                                                    : 'No transactions match your current filters'
                                                }
                                            </p>
                                            <Link 
                                                to="/home" 
                                                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                                            >
                                                Add Transaction
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    )
}
