'use client'

import { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { User } from 'lucide-react'

export default function ProfilePage() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to user's profile page
        router.replace(`/profile/${user.uid}`)
      } else {
        // Redirect to home if not logged in
        router.replace('/')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-gray-600">Taking you to your profile</p>
      </div>
    </div>
  )
}
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
