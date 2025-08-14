'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { ErrorHandler } from '@/lib/error-handler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Log error
    const appError = ErrorHandler.createError(
      'react/component-error',
      error.message,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      }
    )
    ErrorHandler.logError(appError)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white/10 backdrop-blur-md border-red-500/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-red-400" />
              </div>
              <CardTitle className="text-white text-xl">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-center">
                We encountered an unexpected error. This has been reported to our team.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-red-900/20 p-3 rounded border border-red-500/30">
                  <summary className="text-red-300 cursor-pointer text-sm font-medium mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-red-200 overflow-auto max-h-40">
                    {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <p className="text-gray-400 text-xs text-center">
                Error ID: {Date.now().toString(36)}
              </p>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components
export const withErrorBoundary = <T extends object>(
  Component: React.ComponentType<T>,
  errorFallback?: ReactNode
) => {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary fallback={errorFallback}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}
