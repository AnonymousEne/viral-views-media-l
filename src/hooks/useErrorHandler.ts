'use client'

import { useState, useCallback } from 'react'
import { FirebaseError } from 'firebase/app'
import { ErrorHandler, AppError } from '@/lib/error-handler'

interface UseErrorHandlerReturn {
  error: AppError | null
  isError: boolean
  clearError: () => void
  handleError: (error: unknown, context?: string) => void
  handleAsyncError: <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ) => Promise<T | null>
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<AppError | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const handleError = useCallback((error: unknown, context?: string) => {
    let appError: AppError

    if (error instanceof FirebaseError) {
      appError = ErrorHandler.handleFirebaseError(error, context)
    } else if (error instanceof Error) {
      if (error.name === 'NetworkError' || error.message.includes('network')) {
        appError = ErrorHandler.handleNetworkError(error, context)
      } else {
        appError = ErrorHandler.handleGenericError(error, context)
      }
    } else if (typeof error === 'string') {
      appError = ErrorHandler.createError(
        'app/string-error',
        error,
        { context }
      )
    } else {
      appError = ErrorHandler.createError(
        'app/unknown-error',
        'An unknown error occurred',
        { error, context }
      )
    }

    setError(appError)
    ErrorHandler.logError(appError)
  }, [])

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      clearError()
      return await asyncFn()
    } catch (error) {
      handleError(error, context)
      return null
    }
  }, [handleError, clearError])

  return {
    error,
    isError: error !== null,
    clearError,
    handleError,
    handleAsyncError
  }
}

// Specialized hook for Firebase operations
export function useFirebaseErrorHandler() {
  const { error, isError, clearError, handleError, handleAsyncError } = useErrorHandler()

  const handleFirebaseOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    return handleAsyncError(operation, context)
  }, [handleAsyncError])

  return {
    error,
    isError,
    clearError,
    handleError,
    handleFirebaseOperation
  }
}

// Hook for form validation errors
export function useValidationErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  const hasErrors = Object.keys(errors).length > 0

  return {
    errors,
    hasErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors
  }
}
