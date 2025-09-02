// Transaction Types
export const TransactionTypes = {
  INCOME: 'Income',
  DEDUCTION: 'Deduction',
  EXPENSE: 'Expense'
}

export const TransactionCategories = {
  // Income Categories
  SALARY_INCOME: 'Salary Income',
  BUSINESS_INCOME: 'Business Income',
  CAPITAL_GAINS: 'Capital Gains',
  OTHER_INCOME: 'Other Income',
  
  // Deduction Categories
  SECTION_80C: '80C Deduction',
  SECTION_80D: '80D Medical',
  HRA: 'HRA',
  
  // Expense Categories
  BUSINESS_EXPENSE: 'Business Expense',
  PROFESSIONAL_TAX: 'Professional Tax',
  TAX_PAID: 'Tax Paid (TDS)',
  OTHER_EXPENSE: 'Other Expense'
}

// Tax Regimes
export const TaxRegimes = {
  OLD: 'old',
  NEW: 'new'
}

// Transaction Status
export const TransactionStatus = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
}

// File Upload Status
export const FileUploadStatus = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
}

// Deduction Sections with Limits
export const DeductionLimits = {
  SECTION_80C: 150000,
  SECTION_80D_INDIVIDUAL: 25000,
  SECTION_80D_SENIOR: 50000,
  SECTION_80CCD_1B: 50000,
  STANDARD_DEDUCTION: 50000
}

// Tax Slabs for FY 2023-24
export const TaxSlabs = {
  OLD_REGIME: [
    { min: 0, max: 250000, rate: 0 },
    { min: 250001, max: 500000, rate: 5 },
    { min: 500001, max: 1000000, rate: 20 },
    { min: 1000001, max: Infinity, rate: 30 }
  ],
  NEW_REGIME: [
    { min: 0, max: 300000, rate: 0 },
    { min: 300001, max: 600000, rate: 5 },
    { min: 600001, max: 900000, rate: 10 },
    { min: 900001, max: 1200000, rate: 15 },
    { min: 1200001, max: 1500000, rate: 20 },
    { min: 1500001, max: Infinity, rate: 30 }
  ]
}

// User Profile Fields
export const UserProfileFields = {
  PERSONAL_INFO: 'personalInfo',
  TAX_INFO: 'taxInfo',
  BANK_DETAILS: 'bankDetails',
  PREFERENCES: 'preferences'
}

// ITR Forms
export const ITRForms = {
  ITR1: 'ITR-1 (Sahaj)',
  ITR2: 'ITR-2',
  ITR3: 'ITR-3',
  ITR4: 'ITR-4 (Sugam)'
}

// Assessment Years
export const AssessmentYears = {
  AY_2024_25: '2024-25',
  AY_2023_24: '2023-24',
  AY_2022_23: '2022-23'
}
