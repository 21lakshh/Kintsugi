import { useState } from 'react'
import { useAppStore } from '../store/useAppStore.js'
import { TransactionTypes, TransactionCategories } from '../types/index.js'

export default function ExtractedDataConfirmation() {
  const {
    tempExtractedData,
    pendingTransactions = [],
    updatePendingTransaction,
    removePendingTransaction,
    confirmPendingTransactions,
    rejectPendingTransactions
  } = useAppStore()

  const [editingIndex, setEditingIndex] = useState(null)

  console.log('🔍 ExtractedDataConfirmation render check:', {
    tempExtractedData: !!tempExtractedData,
    pendingTransactionsLength: pendingTransactions.length,
    tempData: tempExtractedData
  });

  if (!tempExtractedData || pendingTransactions.length === 0) {
    console.log('❌ ExtractedDataConfirmation: Not showing modal - no temp data');
    return null
  }

  console.log('✅ ExtractedDataConfirmation: Showing modal with', pendingTransactions.length, 'transactions');

  const handleEdit = (index, field, value) => {
    updatePendingTransaction(index, { [field]: value })
  }

  const handleConfirm = () => {
    confirmPendingTransactions()
  }

  const handleReject = () => {
    rejectPendingTransactions()
  }

  const handleRemoveTransaction = (index) => {
    removePendingTransaction(index)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Review Extracted Data
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                AI has extracted {pendingTransactions.length} transactions. Please review and confirm.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">
                  Confidence: {Math.round((tempExtractedData.confidence || 0.8) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Info */}
        {tempExtractedData.employeeDetails && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">{tempExtractedData.employeeDetails.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">PAN:</span>
                <span className="ml-2 text-gray-900">{tempExtractedData.employeeDetails.pan}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Employer:</span>
                <span className="ml-2 text-gray-900">{tempExtractedData.employeeDetails.employerName}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">AY:</span>
                <span className="ml-2 text-gray-900">{tempExtractedData.employeeDetails.assessmentYear}</span>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="flex-1 overflow-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingTransactions.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingIndex === index ? (
                      <select
                        value={transaction.type}
                        onChange={(e) => handleEdit(index, 'type', e.target.value)}
                        className="text-sm border rounded px-2 py-1 w-full"
                      >
                        {Object.values(TransactionTypes).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'Income' ? 'bg-green-100 text-green-800' :
                        transaction.type === 'Deduction' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {editingIndex === index ? (
                      <select
                        value={transaction.category}
                        onChange={(e) => handleEdit(index, 'category', e.target.value)}
                        className="text-sm border rounded px-2 py-1 w-full"
                      >
                        {Object.values(TransactionCategories).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-gray-900">{transaction.category}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {editingIndex === index ? (
                      <input
                        type="number"
                        value={transaction.amount}
                        onChange={(e) => handleEdit(index, 'amount', Number(e.target.value))}
                        className="text-sm border rounded px-2 py-1 w-20"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">
                        ₹{transaction.amount.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={transaction.description}
                        onChange={(e) => handleEdit(index, 'description', e.target.value)}
                        className="text-sm border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <span className="text-gray-900">{transaction.description}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {editingIndex === index ? (
                      <input
                        type="date"
                        value={transaction.date}
                        onChange={(e) => handleEdit(index, 'date', e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      />
                    ) : (
                      <span className="text-gray-900">{transaction.date}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      {editingIndex === index ? (
                        <>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingIndex(null)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingIndex(index)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemoveTransaction(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {pendingTransactions.length} transactions ready to import
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReject}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Confirm & Import
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
