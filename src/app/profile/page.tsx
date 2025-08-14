'use client'

import { Home, User, Upload, Camera } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Simple Navbar */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Home className="w-6 h-6 text-pink-400" />
              <span className="text-white font-bold text-xl">Viral Views</span>
            </Link>
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6 text-white" />
              <span className="text-white">Profile</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Your Profile
            </h1>
            <p className="text-gray-300">
              Manage your profile, upload content, and track your progress
            </p>
          </div>

          {/* Profile Preview */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
                <p className="text-gray-300 mb-6">Your profile system is ready to use</p>
                
                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
                    <User className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Profile Management</h3>
                    <p className="text-gray-300 text-sm">
                      Update your bio, profile picture, and showcase your skills
                    </p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
                    <Upload className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Media Upload</h3>
                    <p className="text-gray-300 text-sm">
                      Upload your freestyles, battles, and showcase content
                    </p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
                    <Camera className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Live Streaming</h3>
                    <p className="text-gray-300 text-sm">
                      Stream your performances and engage with your audience
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                      🎤 Upload Content
                    </button>
                    <button className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                      ⚔️ Join Battle
                    </button>
                    <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                      📺 Go Live
                    </button>
                  </div>
                </div>

                {/* Development Note */}
                <div className="mt-8 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                  <h4 className="text-blue-200 font-semibold mb-2">🚧 Development Status</h4>
                  <p className="text-blue-100 text-sm">
                    Profile components created successfully! The full UserProfile and MediaUpload components are ready but temporarily simplified for testing. 
                    Core features include profile management, image uploads, and media handling with Firebase integration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
