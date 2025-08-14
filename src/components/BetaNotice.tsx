// src/components/BetaNotice.tsx
'use client'

import React, { useState } from 'react'
import { AlertTriangle, X, ExternalLink, MessageSquare } from 'lucide-react'

interface BetaNoticeProps {
  onDismiss?: () => void
}

export default function BetaNotice({ onDismiss }: BetaNoticeProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
    localStorage.setItem('betaNoticeDismissed', 'true')
  }

  // Check if already dismissed
  React.useEffect(() => {
    const dismissed = localStorage.getItem('betaNoticeDismissed')
    if (dismissed === 'true') {
      setIsVisible(false)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-300" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              🎤 Welcome to <strong>Viral Views Beta</strong>! 
              You're testing the future of hip-hop competition.
            </p>
            <p className="text-xs mt-1 opacity-90">
              Experience AI-powered battles, cypher analysis, and community features. 
              Your feedback shapes the platform!
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open('/feedback', '_blank')}
            className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs transition-colors"
          >
            <MessageSquare className="h-3 w-3" />
            <span>Feedback</span>
          </button>
          
          <button
            onClick={() => window.open('https://github.com/AnonymousEne/Viral-Views', '_blank')}
            className="flex items-center space-x-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            <span>GitHub</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss beta notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
