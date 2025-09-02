import { UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router'
import { useState, useEffect } from 'react'
import { useAppStore } from '../store/useAppStore.js'

export default function Filing() {
    const { user } = useUser()
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState('upload')

    // Zustand store hooks
    const {
        userProfile,
        transactions,
        taxCalculations,
        uploadedFiles,
        exportTaxSummary
    } = useAppStore()

    const openModal = () => setShowModal(true)
    const closeModal = () => setShowModal(false)

    // Initialize when component mounts
    useEffect(() => {
        // Any initialization logic can go here
    }, [])

    // Dynamic filing readiness checklist based on user data
    const getChecklistItems = () => {
        const items = [
            { 
                id: 1, 
                item: 'All transactions recorded', 
                status: transactions.length > 0 ? 'completed' : 'pending', 
                description: `${transactions.length} transactions recorded` 
            },
            { 
                id: 2, 
                item: 'Income statements verified', 
                status: transactions.some(t => t.type === 'Income') ? 'completed' : 'pending', 
                description: userProfile?.userType === 'salaried' ? 'Form 16 and salary slips needed' : 'P&L and business documents needed' 
            },
            { 
                id: 3, 
                item: 'Deduction documents uploaded', 
                status: transactions.some(t => t.type === 'Deduction') ? 'completed' : 'pending', 
                description: '80C, 80D, and HRA supporting documents' 
            },
            { 
                id: 4, 
                item: 'Tax regime selected', 
                status: taxCalculations?.recommendation ? 'completed' : 'pending', 
                description: taxCalculations?.recommendation ? `${taxCalculations.recommendation.regime} regime recommended` : 'Add transactions to get recommendation' 
            },
            { 
                id: 5, 
                item: 'Bank details updated', 
                status: userProfile?.personalInfo ? 'completed' : 'pending', 
                description: 'Refund account information in profile' 
            },
            { 
                id: 6, 
                item: 'Required documents uploaded', 
                status: uploadedFiles.length > 0 ? 'completed' : 'pending', 
                description: `${uploadedFiles.length} documents uploaded` 
            }
        ]

        return items
    }

    const checklistItems = getChecklistItems()
    const completedItems = checklistItems.filter(item => item.status === 'completed').length
    const completionPercentage = (completedItems / checklistItems.length) * 100

    // Determine ITR form based on user profile and income
    const getRecommendedITRForm = () => {
        if (!userProfile || !taxCalculations) return 'ITR-1'
        
        const totalIncome = taxCalculations.oldRegime?.grossIncome || 0
        const hasBusinessIncome = userProfile.userType === 'business' || userProfile.userType === 'both'
        const hasCapitalGains = transactions.some(t => t.category === 'Capital Gains')
        
        if (hasBusinessIncome) {
            return 'ITR-3'
        } else if (hasCapitalGains || totalIncome > 5000000) {
            return 'ITR-2'
        } else {
            return 'ITR-1'
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
                                <Link to="/transactions" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                                    Transactions
                                </Link>
                                <Link to="/analysis" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
                                    Analysis
                                </Link>
                                <Link to="/filing" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium border-b-2 border-emerald-600 pb-1">
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Filing Hub</h1>
                    <p className="text-gray-600">Your year-end finish line - streamlined tax filing with pre-filled forms and direct ITR export.</p>
                </div>

                {/* Filing Readiness Status */}
                <div className={`p-8 rounded-xl text-white mb-8 ${
                    completionPercentage >= 80 
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                        : completionPercentage >= 50 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">
                                {completionPercentage >= 80 
                                    ? '🎉 You are ready to file!' 
                                    : completionPercentage >= 50 
                                    ? '⚠️ Almost ready to file' 
                                    : '📝 Let\'s get you ready to file'
                                }
                            </h2>
                            <p className="text-opacity-90 text-lg">
                                {completionPercentage >= 80 
                                    ? 'All your documents are organized and your tax calculation is complete.' 
                                    : completionPercentage >= 50 
                                    ? 'You\'re on the right track! Complete a few more steps.' 
                                    : 'Add your transactions and upload documents to get started.'
                                }
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{completionPercentage.toFixed(0)}%</div>
                            <div className="text-opacity-90">Complete</div>
                        </div>
                    </div>
                    <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2">
                        <div 
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                        ></div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Filing Checklist */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Checklist */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Filing Checklist</h3>
                            <div className="space-y-4">
                                {checklistItems.map((item) => (
                                    <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                            item.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                                        }`}>
                                            {item.status === 'completed' ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <span className="text-xs">{item.id}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-medium ${item.status === 'completed' ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {item.item}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                        </div>
                                        {item.status === 'pending' && (
                                            <button className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors">
                                                Complete
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pre-filled ITR Preview */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Pre-filled ITR Form Preview</h3>
                            {taxCalculations ? (
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Name</span>
                                                    <span>{userProfile?.personalInfo?.firstName} {userProfile?.personalInfo?.lastName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">PAN</span>
                                                    <span>{userProfile?.personalInfo?.pan || 'Not provided'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Assessment Year</span>
                                                    <span>2024-25</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">ITR Form</span>
                                                    <span>{getRecommendedITRForm()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">User Type</span>
                                                    <span className="capitalize">{userProfile?.userType}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Tax Summary</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Total Income</span>
                                                    <span>₹{(taxCalculations.oldRegime?.grossIncome || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Taxable Income</span>
                                                    <span>₹{(taxCalculations.oldRegime?.taxableIncome || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Tax Payable</span>
                                                    <span>₹{(taxCalculations.oldRegime?.taxLiability || 0).toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Regime</span>
                                                    <span>{taxCalculations.recommendation?.regime || 'Not calculated'}</span>
                                                </div>
                                                <div className="flex justify-between font-medium">
                                                    <span className="text-blue-600">Estimated Refund/Payment</span>
                                                    <span className="text-blue-600">Calculate after TDS data</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 p-6 rounded-lg text-center">
                                    <p className="text-yellow-800">Add transactions to see your ITR preview</p>
                                    <Link to="/home" className="mt-2 inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                                        Add Transactions
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filing Actions */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={exportTaxSummary}
                                    disabled={!taxCalculations}
                                    className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-4-4m4 4l4-4m-4 4V4m0 6h.01" />
                                    </svg>
                                    Generate JSON/XML for ITR Portal
                                </button>
                                <button 
                                    onClick={exportTaxSummary}
                                    disabled={!taxCalculations}
                                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Download PDF Summary
                                </button>
                                <Link 
                                    to="/transactions"
                                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium block text-center"
                                >
                                    View All Transactions
                                </Link>
                            </div>
                        </div>

                        {/* Filing Timeline */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="font-medium text-gray-900">July 31, 2024</p>
                                        <p className="text-sm text-gray-600">Last date for ITR filing</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="font-medium text-gray-900">December 31, 2024</p>
                                        <p className="text-sm text-gray-600">Last date for revised return</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="font-medium text-gray-900">March 31, 2025</p>
                                        <p className="text-sm text-gray-600">End of assessment year</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Support */}
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
                            <p className="text-blue-700 text-sm mb-4">
                                Our tax experts are here to help you with any questions about filing your return.
                            </p>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                                Chat with Expert
                            </button>
                        </div>
                    </div>
                </div>

                {/* Final Filing Section */}
                <div className="mt-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {completionPercentage >= 80 ? 'Ready to File Your ITR?' : 'Complete Your Setup First'}
                    </h2>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        {completionPercentage >= 80 
                            ? 'Your tax return has been prepared based on all your financial data. Review the summary above and proceed to file directly through the Income Tax portal.'
                            : `You're ${completionPercentage.toFixed(0)}% ready. Complete the remaining steps to proceed with filing.`
                        }
                    </p>
                    <div className="flex gap-4 justify-center">
                        {completionPercentage >= 80 ? (
                            <>
                                <button 
                                    onClick={() => window.open('https://www.incometax.gov.in/iec/foportal/', '_blank')}
                                    className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg"
                                >
                                    File ITR Now
                                </button>
                                <button 
                                    onClick={exportTaxSummary}
                                    className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Download Summary
                                </button>
                            </>
                        ) : (
                            <>
                                <Link 
                                    to="/home"
                                    className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold text-lg shadow-lg"
                                >
                                    Add Transactions
                                </Link>
                                <Link 
                                    to="/transactions"
                                    className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    View All Data
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
