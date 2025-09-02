import { useState, useRef } from 'react'
import { validateFiles, formatValidationErrors, formatFileSize, getRecommendedDocuments, ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from '../utils/fileValidation.js'
import { useAppStore } from '../store/useAppStore.js'
import { processDocumentWithAI } from '../services/aiService.js'

export default function FileUpload({ 
  documentType = null, 
  onUploadComplete = null, 
  multiple = true,
  acceptedTypes = null 
}) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationErrors, setValidationErrors] = useState([])
  const [uploadedFiles, setUploadedFiles] = useState([])
  
  const fileInputRef = useRef(null)
  const { 
    userProfile, 
    addUploadedFile, 
    setTempExtractedData,
    setLoading,
    addNotification 
  } = useAppStore()

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = async (files) => {
    setValidationErrors([])
    setUploadProgress(0)

    // Validate files
    const validation = validateFiles(files, userProfile?.userType)
    
    if (!validation.isValid) {
      const errorMessage = formatValidationErrors(validation)
      setValidationErrors(errorMessage.split('\n').filter(msg => msg.trim()))
      return
    }

    // Show warnings if any
    const warnings = []
    validation.results.forEach(result => {
      if (result.validation.warnings.length > 0) {
        warnings.push(`${result.file.name}: ${result.validation.warnings.join(', ')}`)
      }
    })

    if (warnings.length > 0) {
      const proceed = window.confirm(
        `Warning:\n${warnings.join('\n')}\n\nDo you want to continue with the upload?`
      )
      if (!proceed) return
    }

    // Process files with AI
    setUploading(true)
    setLoading(true)
    
    try {
      const processedFiles = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Update progress for upload simulation
        setUploadProgress(Math.round(((i * 100) + 25) / files.length))
        
        // Process with AI
        const aiResult = await processDocumentWithAI(file, documentType, userProfile)
        
        console.log('🔄 AI Processing Result:', aiResult);
        
        setUploadProgress(Math.round(((i * 100) + 75) / files.length))
        
        const processedFile = {
          id: `file_${Date.now()}_${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          documentType: aiResult.metadata.documentType || documentType || 'general',
          uploadDate: new Date().toISOString(),
          status: aiResult.success ? 'processed' : 'failed',
          url: URL.createObjectURL(file),
          validationResult: validation.results[i].validation,
          aiResult: aiResult
        }

        processedFiles.push(processedFile)
        
        // Add to store
        addUploadedFile(processedFile)
        
        // If AI extraction was successful, set temporary data for user confirmation
        if (aiResult.success && aiResult.extractedData.transactions.length > 0) {
          console.log('💾 Setting temp extracted data:', aiResult.extractedData);
          setTempExtractedData(aiResult.extractedData)
          
          addNotification({
            type: 'success',
            title: 'Document Processed Successfully',
            message: `Extracted ${aiResult.extractedData.transactions.length} transactions from ${file.name}. Please review and confirm.`,
            duration: 5000
          })
        } else if (!aiResult.success) {
          addNotification({
            type: 'error',
            title: 'Processing Failed',
            message: `Failed to process ${file.name}: ${aiResult.error || 'Unknown error'}`,
            duration: 5000
          })
        }
        
        setUploadProgress(Math.round(((i + 1) * 100) / files.length))
      }

      setUploadedFiles(processedFiles)
      
      // Call completion callback
      if (onUploadComplete) {
        onUploadComplete(processedFiles)
      }

      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('File processing error:', error)
      setValidationErrors([`Processing failed: ${error.message}`])
      addNotification({
        type: 'error',
        title: 'Upload Failed',
        message: error.message,
        duration: 5000
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
      setLoading(false)
    }
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const acceptString = acceptedTypes || ALLOWED_EXTENSIONS.join(',')

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-emerald-400 bg-emerald-50' 
            : validationErrors.length > 0
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptString}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="text-center">
          {uploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <div>
                <p className="text-emerald-600 font-medium">Uploading files...</p>
              </div>
            </div>
          ) : (
            <>
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-900">
                  Drop files here or click to browse
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {documentType ? `Upload your ${documentType.replace('_', ' ')} documents` : 'Upload your documents'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* File Requirements */}
      <div className="mt-4 text-sm text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-gray-700 mb-1">Accepted formats:</p>
            <p>PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, WEBP, TIFF</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">File requirements:</p>
            <p>Max size: {formatFileSize(MAX_FILE_SIZE)} per file</p>
            <p>Max files: 5 per upload</p>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Upload validation failed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-600">{formatFileSize(file.size)} • {file.documentType}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Documents */}
      {userProfile?.userType && !documentType && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">
            Recommended documents for {userProfile.userType} users:
          </h4>
          <div className="text-sm text-blue-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getRecommendedDocuments(userProfile.userType).slice(0, 8).map((docType) => (
                <div key={docType} className="flex items-center space-x-1">
                  <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="capitalize">{docType.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
