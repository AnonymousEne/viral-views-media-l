'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { ErrorHandler } from '@/lib/error-handler'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error
    const appError = ErrorHandler.createError(
      'app/page-error',
      error.message,
      {
        digest: error.digest,
        stack: error.stack
      }
    )
    ErrorHandler.logError(appError)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/10 backdrop-blur-md border-red-500/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-red-400" />
          </div>
          <CardTitle className="text-white text-xl">
            Oops! Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-center">
            We're sorry, but something unexpected happened. Our team has been notified.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="bg-red-900/20 p-3 rounded border border-red-500/30">
              <summary className="text-red-300 cursor-pointer text-sm font-medium mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs text-red-200 overflow-auto max-h-40">
                {error.message}
                {error.stack}
              </pre>
            </details>
          )}

          <div className="flex flex-col gap-2">
            <Button 
              onClick={reset}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>

          <p className="text-gray-400 text-xs text-center">
            Error ID: {error.digest || Date.now().toString(36)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
