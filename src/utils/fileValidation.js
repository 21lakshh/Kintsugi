// File validation utilities for document uploads

export const ALLOWED_FILE_TYPES = {
  // Document types
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  
  // Image types (for scanned documents)
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/tiff': '.tiff',
  'image/tif': '.tif'
}

export const ALLOWED_EXTENSIONS = Object.values(ALLOWED_FILE_TYPES)

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_FILES_PER_UPLOAD = 5

// Document type categories for validation
export const DOCUMENT_CATEGORIES = {
  salaried: [
    'form16',
    'salary_slip',
    'bank_statement',
    'investment_proof',
    'hra_receipt',
    'medical_insurance',
    'tds_certificate',
    'aadhaar',
    'pan_card'
  ],
  business: [
    'profit_loss',
    'balance_sheet',
    'gst_return',
    'business_expense',
    'advance_tax_receipt',
    'depreciation_schedule',
    'bank_statement',
    'aadhaar',
    'pan_card'
  ],
  common: [
    'bank_statement',
    'investment_proof',
    'medical_insurance',
    'aadhaar',
    'pan_card'
  ]
}

/**
 * Validate a single file
 * @param {File} file - The file to validate
 * @param {string} documentType - Expected document type
 * @returns {Object} Validation result
 */
export const validateFile = (file, documentType = null) => {
  const errors = []
  const warnings = []

  // Check if file exists
  if (!file) {
    errors.push('No file selected')
    return { isValid: false, errors, warnings }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size (${formatFileSize(file.size)}) exceeds maximum allowed size (${formatFileSize(MAX_FILE_SIZE)})`)
  }

  if (file.size === 0) {
    errors.push('File is empty')
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES[file.type] && !isValidExtension(file.name)) {
    errors.push(`File type "${file.type || getFileExtension(file.name)}" is not allowed. Allowed types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, WEBP, TIFF`)
  }

  // Check file name
  if (!file.name || file.name.trim() === '') {
    errors.push('File must have a valid name')
  }

  // Check for suspicious file names
  if (file.name.length > 255) {
    errors.push('File name is too long (maximum 255 characters)')
  }

  if (containsSuspiciousPatterns(file.name)) {
    errors.push('File name contains invalid characters')
  }

  // Document type specific validation
  if (documentType) {
    const typeValidation = validateDocumentType(file, documentType)
    if (!typeValidation.isValid) {
      warnings.push(...typeValidation.warnings)
    }
  }

  // Security checks
  const securityCheck = performSecurityChecks(file)
  if (!securityCheck.isValid) {
    errors.push(...securityCheck.errors)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: getFileExtension(file.name),
      lastModified: new Date(file.lastModified)
    }
  }
}

/**
 * Validate multiple files
 * @param {FileList|Array} files - Files to validate
 * @param {string} userType - User type for document validation
 * @returns {Object} Validation results
 */
export const validateFiles = (files, userType = null) => {
  const results = []
  const globalErrors = []

  // Check file count
  if (files.length > MAX_FILES_PER_UPLOAD) {
    globalErrors.push(`Too many files selected. Maximum allowed: ${MAX_FILES_PER_UPLOAD}`)
  }

  if (files.length === 0) {
    globalErrors.push('No files selected')
  }

  // Validate each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const validation = validateFile(file)
    results.push({
      file,
      index: i,
      validation
    })
  }

  // Check for duplicate files
  const duplicates = findDuplicateFiles(files)
  if (duplicates.length > 0) {
    globalErrors.push(`Duplicate files detected: ${duplicates.join(', ')}`)
  }

  // Calculate total size
  const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0)
  if (totalSize > MAX_FILE_SIZE * 2) { // Allow up to 2x max for multiple files
    globalErrors.push(`Total file size (${formatFileSize(totalSize)}) is too large`)
  }

  const allValid = results.every(r => r.validation.isValid) && globalErrors.length === 0

  return {
    isValid: allValid,
    globalErrors,
    results,
    summary: {
      totalFiles: files.length,
      validFiles: results.filter(r => r.validation.isValid).length,
      totalSize: formatFileSize(totalSize)
    }
  }
}

/**
 * Validate document type appropriateness
 * @param {File} file - The file to check
 * @param {string} documentType - Expected document type
 * @returns {Object} Validation result
 */
export const validateDocumentType = (file, documentType) => {
  const warnings = []
  const fileName = file.name.toLowerCase()

  // Basic document type matching
  const typeHints = {
    form16: ['form16', 'form-16', 'form_16'],
    salary_slip: ['salary', 'payslip', 'pay_slip', 'pay-slip'],
    bank_statement: ['bank', 'statement', 'stmt'],
    investment_proof: ['investment', 'mutual', 'sip', 'elss', 'ppf', 'nsc'],
    hra_receipt: ['hra', 'rent', 'receipt'],
    medical_insurance: ['medical', 'health', 'insurance'],
    profit_loss: ['profit', 'loss', 'p&l', 'pl', 'income'],
    gst_return: ['gst', 'return', 'gstr']
  }

  if (typeHints[documentType]) {
    const hasMatch = typeHints[documentType].some(hint => fileName.includes(hint))
    if (!hasMatch) {
      warnings.push(`File name doesn't seem to match document type "${documentType}". Please verify this is the correct document.`)
    }
  }

  return {
    isValid: true, // We only warn, don't block
    warnings
  }
}

/**
 * Perform security checks on file
 * @param {File} file - File to check
 * @returns {Object} Security check result
 */
export const performSecurityChecks = (file) => {
  const errors = []

  // Check for executable files
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js', '.jar', '.app', '.dmg']
  const extension = getFileExtension(file.name).toLowerCase()
  
  if (dangerousExtensions.includes(extension)) {
    errors.push(`File type "${extension}" is not allowed for security reasons`)
  }

  // Check for double extensions (potential disguised executables)
  const doubleExtensions = file.name.match(/\.[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/i)
  if (doubleExtensions && !isValidDoubleExtension(doubleExtensions[0])) {
    errors.push('File has suspicious double extension')
  }

  // Check file name for script injection attempts
  if (file.name.includes('<script>') || file.name.includes('javascript:')) {
    errors.push('File name contains potentially malicious content')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Helper Functions
 */

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const isValidExtension = (filename) => {
  const extension = getFileExtension(filename).toLowerCase()
  return ALLOWED_EXTENSIONS.some(allowed => allowed.toLowerCase() === `.${extension}`)
}

export const containsSuspiciousPatterns = (filename) => {
  const suspiciousPatterns = [
    /[<>:"|?*\x00-\x1f]/,  // Invalid filename characters
    /^\./,                  // Hidden files
    /\.\./,                // Directory traversal
    /__MACOSX/,            // System files
    /thumbs\.db/i,         // System files
    /desktop\.ini/i        // System files
  ]
  
  return suspiciousPatterns.some(pattern => pattern.test(filename))
}

export const isValidDoubleExtension = (extension) => {
  const validDoubleExtensions = ['.tar.gz', '.tar.bz2', '.tar.xz']
  return validDoubleExtensions.includes(extension.toLowerCase())
}

export const findDuplicateFiles = (files) => {
  const fileNames = Array.from(files).map(file => file.name)
  const duplicates = fileNames.filter((name, index) => fileNames.indexOf(name) !== index)
  return [...new Set(duplicates)]
}

/**
 * Generate user-friendly error messages
 * @param {Object} validationResult - Result from validateFiles
 * @returns {string} Formatted error message
 */
export const formatValidationErrors = (validationResult) => {
  let message = ''

  if (validationResult.globalErrors.length > 0) {
    message += 'General Issues:\n' + validationResult.globalErrors.join('\n') + '\n\n'
  }

  validationResult.results.forEach((result, index) => {
    if (!result.validation.isValid) {
      message += `File ${index + 1} (${result.file.name}):\n`
      message += result.validation.errors.join('\n') + '\n\n'
    }
  })

  return message.trim()
}

/**
 * Get recommended document types for user
 * @param {string} userType - User type (salaried, business, both)
 * @returns {Array} List of recommended document types
 */
export const getRecommendedDocuments = (userType) => {
  if (!userType) return DOCUMENT_CATEGORIES.common

  const categories = []
  if (userType === 'salaried' || userType === 'both') {
    categories.push(...DOCUMENT_CATEGORIES.salaried)
  }
  if (userType === 'business' || userType === 'both') {
    categories.push(...DOCUMENT_CATEGORIES.business)
  }

  // Remove duplicates and return
  return [...new Set(categories)]
}

export default {
  validateFile,
  validateFiles,
  validateDocumentType,
  performSecurityChecks,
  formatFileSize,
  formatValidationErrors,
  getRecommendedDocuments,
  ALLOWED_FILE_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_FILES_PER_UPLOAD
}
