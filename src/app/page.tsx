'use client'

import { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Video, 
  Upload, 
  MessageCircle, 
  Users, 
  Zap, 
  PlayCircle,
  ArrowRight,
  Star,
  Heart,
  Flame,
  Camera,
  Share,
  TrendingUp
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
              Create, share, and discover amazing short videos. Connect with creators, 
              go live, and build your community in the ultimate video platform.
            </p>
            <div className="flex items-center justify-center space-x-2 mb-8">
              <Star className="text-yellow-400 h-6 w-6" />
              <span className="text-gray-300">Join millions of creators worldwide</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            {user ? (
              <>
                <Link href="/feed">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 text-lg">
                    <Video className="mr-2 h-5 w-5" />
                    Watch Videos
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black py-4 px-8 text-lg">
                    <Upload className="mr-2 h-5 w-5" />
                    Create Content
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/feed">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 text-lg">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Explore Videos
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black py-4 px-8 text-lg">
                  <Users className="mr-2 h-5 w-5" />
                  Join Community
                </Button>
              </>
            )}
          </div>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-bold text-white mb-2">Short Videos</h3>
              <p className="text-gray-400">Create and share 60-second videos with our powerful tools</p>
            </div>
            <div className="text-center">
              <Camera className="h-12 w-12 mx-auto mb-4 text-pink-400" />
              <h3 className="text-xl font-bold text-white mb-2">Live Streaming</h3>
              <p className="text-gray-400">Connect with your audience in real-time with live broadcasts</p>
            </div>
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-bold text-white mb-2">Messaging</h3>
              <p className="text-gray-400">Chat directly with creators and build meaningful connections</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
            Everything You Need to 
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"> Go Viral</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Video Feed */}
            <Card className="bg-gray-900/50 border-purple-500/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <TrendingUp className="mr-3 h-6 w-6 text-purple-400" />
                  Smart Feed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Discover trending content tailored to your interests with our AI-powered feed algorithm.
                </p>
              </CardContent>
            </Card>

            {/* Upload Tools */}
            <Card className="bg-gray-900/50 border-purple-500/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Upload className="mr-3 h-6 w-6 text-pink-400" />
                  Easy Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Upload videos up to 60 seconds with automatic optimization and validation.
                </p>
              </CardContent>
            </Card>

            {/* Live Streaming */}
            <Card className="bg-gray-900/50 border-purple-500/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Video className="mr-3 h-6 w-6 text-red-400" />
                  Live Streaming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Broadcast live to your audience with interactive chat and real-time engagement.
                </p>
              </CardContent>
            </Card>

            {/* Social Features */}
            <Card className="bg-gray-900/50 border-purple-500/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Heart className="mr-3 h-6 w-6 text-pink-400" />
                  Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Like, comment, and share videos. Build connections with creators and fans.
                </p>
              </CardContent>
            </Card>

            {/* Messaging */}
            <Card className="bg-gray-900/50 border-purple-500/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <MessageCircle className="mr-3 h-6 w-6 text-purple-400" />
                  Direct Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Connect privately with other creators through our integrated messaging system.
                </p>
              </CardContent>
            </Card>

            {/* Community */}
            <Card className="bg-gray-900/50 border-purple-500/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Users className="mr-3 h-6 w-6 text-red-400" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Join a vibrant community of creators and discover new talent from around the world.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-black/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">
            Join the Creative Revolution
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-purple-400 mb-2">1M+</div>
              <div className="text-gray-300">Videos Created</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-pink-400 mb-2">500K+</div>
              <div className="text-gray-300">Active Creators</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-red-400 mb-2">10M+</div>
              <div className="text-gray-300">Video Views</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Share Your Story?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join millions of creators and start building your audience today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href="/upload">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 text-lg">
                  <Upload className="mr-2 h-5 w-5" />
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 text-lg">
                <Users className="mr-2 h-5 w-5" />
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
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
