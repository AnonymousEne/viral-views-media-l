// src/app/feedback/page.tsx
'use client'

import React, { useState } from 'react'
import { MessageSquare, Star, Bug, Lightbulb, Heart, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState('')
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const categories = [
    { id: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-500' },
    { id: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-500' },
    { id: 'ui', label: 'UI/UX Feedback', icon: Heart, color: 'text-pink-500' },
    { id: 'ai', label: 'AI Performance', icon: MessageSquare, color: 'text-blue-500' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Here you would typically send to your backend
    console.log('Feedback submitted:', { feedback, rating, category })
    
    // Simulate submission
    setTimeout(() => {
      setSubmitted(true)
    }, 1000)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Thank You!
          </h1>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted and will help make Viral Views even better. 
            Keep testing and sharing your thoughts!
          </p>
          <Button 
            onClick={() => window.close()}
            className="w-full"
          >
            Close
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎤 Beta Feedback
          </h1>
          <p className="text-lg text-gray-600">
            Help us improve Viral Views with your insights and suggestions
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Experience Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 border rounded-lg transition-all ${
                        category === cat.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-5 w-5 ${cat.color}`} />
                        <span className="text-sm font-medium">{cat.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts, suggestions, or report any issues..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={6}
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!feedback || !category || !rating}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span>Submit Feedback</span>
            </Button>
          </form>
        </Card>

        {/* Beta Testing Guidelines */}
        <Card className="mt-8 p-6 bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            🧪 Beta Testing Focus Areas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Core Features</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• User registration & profiles</li>
                <li>• Battle creation & participation</li>
                <li>• Cypher sessions</li>
                <li>• AI judging accuracy</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Performance</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Real-time responsiveness</li>
                <li>• Mobile experience</li>
                <li>• AI analysis speed</li>
                <li>• Audio/video quality</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
