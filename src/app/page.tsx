'use client'

import { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Mic, 
  Users, 
  Trophy, 
  Zap, 
  PlayCircle,
  ArrowRight,
  Star,
  Crown,
  Flame,
  Music
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [user, loading] = useAuthState(auth)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                VIRAL
              </span>
              <br />
              <span className="text-white">VIEWS</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The AI-powered hip-hop competition platform where skills meet technology. 
              Battle, create, and build your legacy in the ultimate rap arena.
            </p>
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="bg-purple-600/20 px-4 py-2 rounded-full border border-purple-500/30">
                <span className="text-purple-300 font-semibold">🎤 BETA VERSION</span>
              </div>
            </div>
          </div>

          {user ? (
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/battles">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg rounded-xl">
                  <Trophy className="w-6 h-6 mr-2" />
                  Enter Battle Arena
                </Button>
              </Link>
              <Link href="/cypher-test">
                <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/20 px-8 py-6 text-lg rounded-xl">
                  <Users className="w-6 h-6 mr-2" />
                  Join Cypher Session
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 mb-6">Ready to showcase your skills?</p>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-6 text-lg rounded-xl">
                <Mic className="w-6 h-6 mr-2" />
                Get Started
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Revolutionary Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Judge */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-6 h-6 text-yellow-400 mr-2" />
                  AI Judge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Get real-time analysis and scoring from our advanced AI judge trained on hip-hop culture and competition standards.
                </p>
              </CardContent>
            </Card>

            {/* Live Battles */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Flame className="w-6 h-6 text-red-400 mr-2" />
                  Live Battles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Compete in real-time battles with rappers worldwide. Multiple formats from freestyle to themed competitions.
                </p>
              </CardContent>
            </Card>

            {/* Cypher Sessions */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-6 h-6 text-blue-400 mr-2" />
                  Cypher Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Join collaborative rap sessions with AI analysis of flow adaptation, energy contribution, and community building.
                </p>
              </CardContent>
            </Card>

            {/* Performance Analytics */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="w-6 h-6 text-purple-400 mr-2" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Track your progress with detailed performance analytics including technical skill, creativity, and audience engagement.
                </p>
              </CardContent>
            </Card>

            {/* Community */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Crown className="w-6 h-6 text-gold-400 mr-2" />
                  Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Climb the leaderboards and earn recognition in the global hip-hop community through skill-based competitions.
                </p>
              </CardContent>
            </Card>

            {/* AI Command Center */}
            <Card className="bg-black/50 border-purple-500/30 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Music className="w-6 h-6 text-green-400 mr-2" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Access comprehensive AI insights dashboard with platform analytics, user trends, and performance metrics.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Beta Call to Action */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500/30 backdrop-blur-lg">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold text-white mb-6">
                Join the Beta Revolution
              </h3>
              <p className="text-xl text-gray-300 mb-8">
                You're experiencing the future of hip-hop competition. Help us shape the platform 
                with your feedback and become part of the founding community.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link href="/feedback">
                  <Button variant="outline" className="border-purple-500 text-purple-300 hover:bg-purple-500/20 px-6 py-3">
                    Give Feedback
                  </Button>
                </Link>
                {user && (
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3">
                      <ArrowRight className="w-5 h-5 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
