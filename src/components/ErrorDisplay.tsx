'use client'

import { AlertTriangle, X, RefreshCw, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { AppError } from '@/lib/error-handler'

interface ErrorDisplayProps {
  error: AppError | null
  onRetry?: () => void
  onDismiss?: () => void
  variant?: 'inline' | 'toast' | 'modal'
  className?: string
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  variant = 'inline',
  className = '' 
}: ErrorDisplayProps) {
  if (!error) return null

  const getErrorIcon = () => {
    if (error.code.includes('warning') || error.code.includes('validation')) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
    return <AlertTriangle className="h-4 w-4 text-red-500" />
  }

  const getErrorColor = () => {
    if (error.code.includes('warning') || error.code.includes('validation')) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
    return 'bg-red-50 border-red-200 text-red-800'
  }

  const ErrorContent = () => (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        {getErrorIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {error.message}
        </p>
        {process.env.NODE_ENV === 'development' && error.details && (
          <details className="mt-2">
            <summary className="text-xs text-gray-500 cursor-pointer">
              Debug info
            </summary>
            <pre className="text-xs text-gray-400 mt-1 whitespace-pre-wrap">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          </details>
        )}
      </div>
      <div className="flex-shrink-0 flex space-x-1">
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )

  if (variant === 'toast') {
    return (
      <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${className}`}>
        <Card className={`${getErrorColor()} border shadow-lg`}>
          <CardContent className="p-4">
            <ErrorContent />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full bg-white shadow-xl">
          <CardContent className="p-6">
            <ErrorContent />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Inline variant (default)
  return (
    <div className={`rounded-md border p-4 ${getErrorColor()} ${className}`}>
      <ErrorContent />
    </div>
  )
}

// Specialized components for common use cases
export function ValidationError({ 
  message, 
  onDismiss 
}: { 
  message: string
  onDismiss?: () => void 
}) {
  const error = {
    code: 'validation/error',
    message,
    timestamp: new Date()
  }

  return (
    <ErrorDisplay 
      error={error} 
      onDismiss={onDismiss} 
      variant="inline"
      className="mt-2"
    />
  )
}

export function NetworkError({ 
  onRetry, 
  onDismiss 
}: { 
  onRetry?: () => void
  onDismiss?: () => void 
}) {
  const error = {
    code: 'network/error',
    message: 'Network connection failed. Please check your internet connection.',
    timestamp: new Date()
  }

  return (
    <ErrorDisplay 
      error={error} 
      onRetry={onRetry}
      onDismiss={onDismiss} 
      variant="toast"
    />
  )
}

export function PermissionError({ 
  action, 
  onDismiss 
}: { 
  action?: string
  onDismiss?: () => void 
}) {
  const error = {
    code: 'permission/denied',
    message: action 
      ? `You don't have permission to ${action}.`
      : 'You don\'t have permission to perform this action.',
    timestamp: new Date()
  }

  return (
    <ErrorDisplay 
      error={error} 
      onDismiss={onDismiss} 
      variant="inline"
    />
  )
}

// Info message component (not an error, but uses similar styling)
export function InfoMessage({ 
  message, 
  onDismiss 
}: { 
  message: string
  onDismiss?: () => void 
}) {
  return (
    <div className="rounded-md border p-4 bg-blue-50 border-blue-200 text-blue-800">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Info className="h-4 w-4 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
