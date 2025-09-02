import { useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router'
import { useAppStore } from '../store/useAppStore.js'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// User profiling schema
const onboardingSchema = z.object({
  userType: z.enum(['salaried', 'business', 'both']),
  basicInfo: z.object({
    annualIncome: z.number().min(0, 'Annual income must be positive'),
    age: z.number().min(18, 'Must be at least 18 years old').max(100, 'Invalid age'),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
    dependents: z.number().min(0, 'Cannot have negative dependents'),
    city: z.string().min(1, 'City is required'),
    isMetroCity: z.boolean()
  }),
  employmentDetails: z.object({
    // For Salaried
    employerName: z.string().optional(),
    employmentType: z.enum(['private', 'government', 'psu', 'ngo']).optional(),
    
    // For Business
    businessType: z.enum(['sole_proprietorship', 'partnership', 'company', 'llp', 'professional']).optional(),
    businessName: z.string().optional(),
    gstRegistered: z.boolean().optional()
  }),
  housingDetails: z.object({
    housingStatus: z.enum(['owned', 'rented', 'family']),
    monthlyRent: z.number().min(0).optional(),
    homeLoan: z.boolean(),
    homeLoanAmount: z.number().min(0).optional()
  }),
  investmentProfile: z.object({
    riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']),
    investmentExperience: z.enum(['beginner', 'intermediate', 'expert']),
    currentInvestments: z.array(z.string()).optional()
  })
})

const SALARIED_DOCUMENTS = [
  {
    category: 'Income Proofs',
    documents: [
      { name: 'Form 16', required: true, description: 'Annual tax certificate from employer' },
      { name: 'Salary Slips', required: true, description: 'Last 3 months salary slips' },
      { name: 'Bonus/Allowance Statements', required: false, description: 'Any additional income proof' }
    ]
  },
  {
    category: 'Investment Proofs (80C/80D)',
    documents: [
      { name: 'Life Insurance Premium Receipts', required: false, description: 'LIC/Term insurance payments' },
      { name: 'PPF Passbook', required: false, description: 'Public Provident Fund statements' },
      { name: 'ELSS Investment Statements', required: false, description: 'Tax-saving mutual fund investments' },
      { name: 'NSC/Tax-saving FD Receipts', required: false, description: 'National Savings Certificate or Fixed deposits' },
      { name: 'Sukanya Samriddhi Account', required: false, description: 'Girl child savings scheme' },
      { name: 'Home Loan Principal Certificate', required: false, description: 'Principal repayment for 80C' }
    ]
  },
  {
    category: 'Expenses & Loans',
    documents: [
      { name: 'Home Loan Interest Certificate', required: false, description: 'Section 24 deduction' },
      { name: 'Rent Receipts', required: false, description: 'For HRA exemption' },
      { name: 'Children Tuition Fee Receipts', required: false, description: 'Education expenses' }
    ]
  },
  {
    category: 'Health & Insurance',
    documents: [
      { name: 'Health Insurance Premium Receipts', required: false, description: 'Self, family, parents insurance' },
      { name: 'Preventive Health Check-up Bills', required: false, description: 'Annual health checkups' }
    ]
  },
  {
    category: 'Other Income',
    documents: [
      { name: 'Bank Interest Certificates', required: false, description: 'Form 16A/26AS for interest income' },
      { name: 'Dividend Statements', required: false, description: 'Share/mutual fund dividends' },
      { name: 'Capital Gains Statements', required: false, description: 'Shares, mutual funds, property sales' },
      { name: 'Rental Income Details', required: false, description: 'Property rental agreements & receipts' }
    ]
  },
  {
    category: 'Tax Credits',
    documents: [
      { name: 'Form 26AS/AIS', required: true, description: 'Tax already deducted/paid summary' }
    ]
  }
]

const BUSINESS_DOCUMENTS = [
  {
    category: 'Income Proofs',
    documents: [
      { name: 'Profit & Loss Statement', required: true, description: 'Annual P&L for the financial year' },
      { name: 'Balance Sheet', required: true, description: 'Company/business balance sheet' },
      { name: 'Bank Statements', required: true, description: 'Business bank account statements' },
      { name: 'GST Returns', required: false, description: 'If GST registered' }
    ]
  },
  {
    category: 'Business Expenses',
    documents: [
      { name: 'Office Rent Agreement & Receipts', required: false, description: 'Business premises rent' },
      { name: 'Utility Bills', required: false, description: 'Electricity, water, internet for office' },
      { name: 'Raw Material Bills', required: false, description: 'Manufacturing/trading expenses' },
      { name: 'Employee Salary Records', required: false, description: 'Staff compensation' },
      { name: 'Travel & Business Expenses', required: false, description: 'Business travel and other expenses' },
      { name: 'Depreciation Schedules', required: false, description: 'Asset depreciation calculations' },
      { name: 'Loan Interest Statements', required: false, description: 'Business loan interest' }
    ]
  },
  {
    category: 'Investments',
    documents: [
      { name: 'EPF/PPF/NPS Contributions', required: false, description: 'Retirement fund contributions' },
      { name: 'Tax-saving Investments', required: false, description: 'ELSS, FDs, LIC for 80C' }
    ]
  },
  {
    category: 'Health & Insurance',
    documents: [
      { name: 'Health Insurance Premiums', required: false, description: 'Self, employees, dependents' }
    ]
  },
  {
    category: 'Other Income',
    documents: [
      { name: 'Dividend/Capital Gains Proof', required: false, description: 'Investment income' },
      { name: 'Rental Income Proof', required: false, description: 'Property rental income' }
    ]
  },
  {
    category: 'Tax Credits',
    documents: [
      { name: 'Advance Tax Payment Challans', required: false, description: 'Quarterly advance tax payments' },
      { name: 'TDS Certificates', required: false, description: 'Form 16A for professionals/freelancers' },
      { name: 'Form 26AS/AIS', required: true, description: 'Tax deduction summary' }
    ]
  }
]

export default function Onboarding() {
  const { user } = useUser()
  const navigate = useNavigate()
  const { updateUserProfile, setLoading } = useAppStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDocuments, setSelectedDocuments] = useState({})
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      userType: 'salaried',
      basicInfo: {
        maritalStatus: 'single',
        dependents: 0,
        isMetroCity: false
      },
      employmentDetails: {
        employmentType: 'private',
        businessType: 'sole_proprietorship',
        gstRegistered: false
      },
      housingDetails: {
        housingStatus: 'rented',
        monthlyRent: 0,
        homeLoan: false,
        homeLoanAmount: 0
      },
      investmentProfile: {
        riskTolerance: 'moderate',
        investmentExperience: 'beginner',
        currentInvestments: []
      }
    }
  })

  const userType = watch('userType')
  const housingStatus = watch('housingDetails.housingStatus')
  const homeLoan = watch('housingDetails.homeLoan')

  const handleDocumentSelection = (category, docName, selected) => {
    setSelectedDocuments(prev => ({
      ...prev,
      [`${category}-${docName}`]: selected
    }))
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      
      // Create comprehensive user profile
      const userProfile = {
        personalInfo: {
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.emailAddresses?.[0]?.emailAddress || '',
          ...data.basicInfo
        },
        userType: data.userType,
        employmentDetails: data.employmentDetails,
        housingDetails: data.housingDetails,
        investmentProfile: data.investmentProfile,
        requiredDocuments: getRequiredDocuments(data.userType),
        selectedDocuments: Object.keys(selectedDocuments).filter(key => selectedDocuments[key]),
        onboardingCompleted: true,
        createdAt: new Date().toISOString()
      }
      
      // Save to store
      updateUserProfile(userProfile)
      
      // Navigate to dashboard, which will redirect based on completion status
      navigate('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
      alert('There was an error saving your profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRequiredDocuments = (userType) => {
    switch (userType) {
      case 'salaried':
        return SALARIED_DOCUMENTS
      case 'business':
        return BUSINESS_DOCUMENTS
      case 'both':
        return [...SALARIED_DOCUMENTS, ...BUSINESS_DOCUMENTS]
      default:
        return SALARIED_DOCUMENTS
    }
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            currentStep >= step ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 ${currentStep > step ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to LiveTax!</h1>
          <p className="text-gray-600">Let's personalize your tax experience with a quick setup</p>
          
          {/* Quick Setup Button */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 mb-3">Quick start for testing:</p>
            <div className="space-x-2">
              <button
                onClick={() => {
                  const quickProfile = {
                    personalInfo: {
                      firstName: user?.firstName || 'Test',
                      lastName: user?.lastName || 'User',
                      email: user?.emailAddresses?.[0]?.emailAddress || 'test@example.com',
                      annualIncome: 600000,
                      age: 28,
                      maritalStatus: 'single',
                      dependents: 0,
                      city: 'Mumbai',
                      isMetroCity: true
                    },
                    userType: 'salaried',
                    employmentDetails: {
                      companyName: 'Tech Company',
                      designation: 'Software Developer',
                      workLocation: 'Mumbai'
                    },
                    housingDetails: {
                      housingStatus: 'rented',
                      monthlyRent: 30000,
                      cityOfResidence: 'Mumbai'
                    },
                    investmentProfile: {
                      riskTolerance: 'moderate',
                      investmentExperience: 'intermediate'
                    },
                    requiredDocuments: [],
                    selectedDocuments: [],
                    onboardingCompleted: true,
                    createdAt: new Date().toISOString()
                  }
                  
                  updateUserProfile(quickProfile)
                  alert('✅ Profile created! Redirecting to dashboard...')
                  // Navigate to dashboard, which will then redirect to home
                  navigate('/dashboard')
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Skip Setup & Go to Dashboard
              </button>
              

            </div>
          </div>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          {/* Step 1: User Type & Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Tell us about yourself</h2>
              
              {/* User Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">What describes you best?</label>
                <div className="grid md:grid-cols-3 gap-4">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="salaried"
                      {...register('userType')}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Salaried Employee</div>
                      <div className="text-sm text-gray-500">You receive a regular salary</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="business"
                      {...register('userType')}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Business Owner</div>
                      <div className="text-sm text-gray-500">Self-employed or business income</div>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="both"
                      {...register('userType')}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Both</div>
                      <div className="text-sm text-gray-500">Salary + business income</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income (₹)</label>
                  <input
                    type="number"
                    {...register('basicInfo.annualIncome', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="500000"
                  />
                  {errors.basicInfo?.annualIncome && (
                    <p className="text-red-500 text-xs mt-1">{errors.basicInfo.annualIncome.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    {...register('basicInfo.age', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="30"
                  />
                  {errors.basicInfo?.age && (
                    <p className="text-red-500 text-xs mt-1">{errors.basicInfo.age.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                  <select
                    {...register('basicInfo.maritalStatus')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Dependents</label>
                  <input
                    type="number"
                    {...register('basicInfo.dependents', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    {...register('basicInfo.city')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Mumbai"
                  />
                  {errors.basicInfo?.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.basicInfo.city.message}</p>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('basicInfo.isMetroCity')}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">I live in a metro city</label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Employment Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Employment Details</h2>
              
              {(userType === 'salaried' || userType === 'both') && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Salaried Employment</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name</label>
                      <input
                        type="text"
                        {...register('employmentDetails.employerName')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                      <select
                        {...register('employmentDetails.employmentType')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="private">Private Company</option>
                        <option value="government">Government</option>
                        <option value="psu">PSU</option>
                        <option value="ngo">NGO</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {(userType === 'business' || userType === 'both') && (
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Business Details</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                      <input
                        type="text"
                        {...register('employmentDetails.businessName')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Business/Professional Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                      <select
                        {...register('employmentDetails.businessType')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="sole_proprietorship">Sole Proprietorship</option>
                        <option value="partnership">Partnership</option>
                        <option value="company">Private Limited Company</option>
                        <option value="llp">LLP</option>
                        <option value="professional">Professional (CA/Doctor/Lawyer)</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('employmentDetails.gstRegistered')}
                        className="mr-2"
                      />
                      <label className="text-sm text-gray-700">GST Registered</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Housing & Investment Profile */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Housing & Investment Profile</h2>
              
              {/* Housing Details */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Housing Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Housing Status</label>
                    <select
                      {...register('housingDetails.housingStatus')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="rented">Rented</option>
                      <option value="owned">Owned</option>
                      <option value="family">Family Home</option>
                    </select>
                  </div>
                  {housingStatus === 'rented' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹)</label>
                      <input
                        type="number"
                        {...register('housingDetails.monthlyRent', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="25000"
                      />
                    </div>
                  )}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('housingDetails.homeLoan')}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">Do you have a home loan?</label>
                  </div>
                  {homeLoan && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Outstanding Loan Amount (₹)</label>
                      <input
                        type="number"
                        {...register('housingDetails.homeLoanAmount', { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="2000000"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Investment Profile */}
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Profile</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
                    <select
                      {...register('investmentProfile.riskTolerance')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="conservative">Conservative (Low Risk)</option>
                      <option value="moderate">Moderate (Medium Risk)</option>
                      <option value="aggressive">Aggressive (High Risk)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Investment Experience</label>
                    <select
                      {...register('investmentProfile.investmentExperience')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Document Checklist */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Document Checklist</h2>
              <p className="text-gray-600 mb-6">
                Based on your profile, here are the documents you'll need. Check the ones you have ready to upload:
              </p>
              
              <div className="space-y-6">
                {getRequiredDocuments(userType).map((category, categoryIndex) => (
                  <div key={categoryIndex} className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{category.category}</h3>
                    <div className="space-y-3">
                      {category.documents.map((doc, docIndex) => (
                        <label key={docIndex} className="flex items-start gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            className="mt-1"
                            onChange={(e) => handleDocumentSelection(category.category, doc.name, e.target.checked)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{doc.name}</span>
                              {doc.required && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Required</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Setting up...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
