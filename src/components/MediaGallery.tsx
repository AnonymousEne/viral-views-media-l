'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { Play, Heart, Eye, Calendar, Music, Video } from 'lucide-react'

interface MediaItem {
  id: string
  title: string
  description: string
  type: 'video' | 'audio'
  category: string
  url: string
  thumbnail?: string
  views: number
  likes: number
  createdAt: any
  userDisplayName: string
  userPhotoURL: string
}

export default function MediaGallery() {
  const [user] = useAuthState(auth)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'video' | 'audio'>('all')

  // Load user's media
  const loadMedia = async () => {
    if (!user) return

    try {
      setLoading(true)
      const mediaQuery = query(
        collection(db, 'media'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(20)
      )

      const snapshot = await getDocs(mediaQuery)
      const mediaItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MediaItem[]

      setMedia(mediaItems)
    } catch (error) {
      console.error('Error loading media:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadMedia()
    }
  }, [user])

  const filteredMedia = filter === 'all' ? media : media.filter(item => item.type === filter)

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-white">Please sign in to view your media</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Your Content</h2>
        
        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          {[
            { key: 'all', label: 'All Content', icon: '📁' },
            { key: 'video', label: 'Videos', icon: '📹' },
            { key: 'audio', label: 'Audio', icon: '🎵' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === key
                  ? 'bg-pink-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center p-12 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-bold text-white mb-2">No content yet</h3>
          <p className="text-gray-300 mb-6">
            Upload your first {filter === 'all' ? 'video or audio' : filter} to get started!
          </p>
          <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
            Upload Content
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
            >
              {/* Thumbnail/Preview */}
              <div className="aspect-video bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center relative">
                {item.type === 'video' ? (
                  <div className="relative w-full h-full">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-16 h-16 text-white/80" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
                    <Music className="w-16 h-16 text-white/80" />
                  </div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-semibold">
                  {item.type === 'video' ? '📹' : '🎵'} {item.category}
                </div>
              </div>

              {/* Content Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                  {item.title}
                </h3>
                
                {item.description && (
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-gray-400 text-sm mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{item.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{item.likes.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white py-2 rounded-lg font-semibold transition-colors">
                    View
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors">
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
