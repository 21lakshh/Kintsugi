import { z } from 'zod'
import { TransactionTypes, TransactionCategories } from '../types/index.js'

// Transaction Schema
export const transactionSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  amount: z.number().min(0.01, 'Amount must be greater than 0').max(10000000, 'Amount too large'),
  type: z.enum([TransactionTypes.INCOME, TransactionTypes.DEDUCTION, TransactionTypes.EXPENSE]),
  category: z.enum(Object.values(TransactionCategories)),
  hasReceipt: z.boolean().default(false),
  receiptUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(500, 'Notes too long').optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

// User Profile Schema
export const userProfileSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format'),
    aadhaar: z.string().regex(/^[0-9]{12}$/, 'Invalid Aadhaar format').optional(),
    address: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      pincode: z.string().regex(/^[0-9]{6}$/, 'Invalid pincode format'),
      country: z.string().default('India')
    })
  }),
  taxInfo: z.object({
    assessmentYear: z.string().min(1, 'Assessment year is required'),
    preferredRegime: z.enum(['old', 'new']),
    employerDetails: z.array(z.object({
      name: z.string().min(1, 'Employer name is required'),
      tan: z.string().regex(/^[A-Z]{4}[0-9]{5}[A-Z]{1}$/, 'Invalid TAN format'),
      address: z.string().min(1, 'Employer address is required')
    })).optional(),
    previousYearReturns: z.boolean().default(false)
  }),
  bankDetails: z.object({
    accountNumber: z.string().min(9, 'Account number must be at least 9 digits'),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format'),
    bankName: z.string().min(1, 'Bank name is required'),
    branchName: z.string().min(1, 'Branch name is required'),
    accountType: z.enum(['savings', 'current', 'other'])
  }),
  preferences: z.object({
    currency: z.string().default('INR'),
    dateFormat: z.string().default('DD/MM/YYYY'),
    notifications: z.object({
      email: z.boolean().default(true),
      sms: z.boolean().default(false),
      push: z.boolean().default(true)
    }),
    reminders: z.object({
      taxDueDates: z.boolean().default(true),
      investmentDeadlines: z.boolean().default(true),
      documentExpiry: z.boolean().default(true)
    })
  })
})

// File Upload Schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File, 'Please select a file'),
  category: z.enum(Object.values(TransactionCategories)),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0').optional(),
  date: z.string().min(1, 'Date is required')
})

// Tax Settings Schema
export const taxSettingsSchema = z.object({
  regime: z.enum(['old', 'new']),
  autoCalculate: z.boolean().default(true),
  includeProjections: z.boolean().default(true),
  reminderDays: z.number().min(1).max(90).default(30)
})

// Investment Planning Schema
export const investmentPlanSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  category: z.enum([
    TransactionCategories.SECTION_80C,
    TransactionCategories.SECTION_80D,
    'ELSS',
    'PPF',
    'NSC',
    'LIC',
    'FD'
  ]),
  frequency: z.enum(['one-time', 'monthly', 'quarterly', 'yearly']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  autoInvest: z.boolean().default(false)
})

// Export validation functions
export const validateTransaction = (data) => {
  try {
    return { success: true, data: transactionSchema.parse(data) }
  } catch (error) {
    return { success: false, errors: error.errors }
  }
}

export const validateUserProfile = (data) => {
  try {
    return { success: true, data: userProfileSchema.parse(data) }
  } catch (error) {
    return { success: false, errors: error.errors }
  }
}

export const validateFileUpload = (data) => {
  try {
    return { success: true, data: fileUploadSchema.parse(data) }
  } catch (error) {
    return { success: false, errors: error.errors }
  }
}
