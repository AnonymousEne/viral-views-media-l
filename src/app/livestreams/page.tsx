'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { Livestream, User } from '@/types/firebase'
import { Button } from '@/components/ui/button'
import { Video, Users, TrendingUp, Clock, Plus } from 'lucide-react'
import Link from 'next/link'

export default function LivestreamsPage() {
  const [user] = useAuthState(auth)
  const [livestreams, setLivestreams] = useState<(Livestream & { streamer: User })[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'live' | 'trending' | 'recent'>('live')

  // Mock livestreams data
  const generateMockLivestreams = () => {
    const streamers = [
      { id: '1', username: 'dancepro', displayName: 'Alex Dance Pro', avatar: 'https://picsum.photos/64/64?random=1', verified: true },
      { id: '2', username: 'musicmaker', displayName: 'Jamie Beats', avatar: 'https://picsum.photos/64/64?random=2', verified: false },
      { id: '3', username: 'artcreator', displayName: 'Sam Creative', avatar: 'https://picsum.photos/64/64?random=3', verified: true },
    ]

    return streamers.map((streamer, index) => ({
      id: `stream-${index + 1}`,
      userId: streamer.id,
      title: [
        'Live Dance Battle Championship',
        'Making Beats Live - Come Join!',
        'Art Creation Session & Q&A'
      ][index],
      description: [
        'Join me for an epic dance battle session with amazing moves and music!',
        'Creating fresh beats live, taking requests from chat',
        'Creating digital art while chatting with viewers'
      ][index],
      category: ['dance', 'music', 'art'][index],
      tags: [
        ['dance', 'battle', 'live', 'hiphop'],
        ['music', 'beats', 'production', 'live'],
        ['art', 'digital', 'drawing', 'creative']
      ][index],
      status: 'live' as const,
      viewers: Math.floor(Math.random() * 1000) + 100,
      maxViewers: Math.floor(Math.random() * 1500) + 500,
      thumbnailUrl: `https://picsum.photos/800/450?random=${index + 10}`,
      startedAt: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000), // Started 0-2 hours ago
      createdAt: new Date(),
      streamer: {
        ...streamer,
        email: `${streamer.username}@example.com`,
        bio: `Creative content creator`,
        followers: Math.floor(Math.random() * 10000) + 1000,
        following: Math.floor(Math.random() * 1000) + 100,
        videoStats: {
          totalVideos: Math.floor(Math.random() * 100) + 20,
          totalLikes: Math.floor(Math.random() * 50000) + 5000,
          totalViews: Math.floor(Math.random() * 500000) + 50000,
        },
        createdAt: new Date(),
      }
    }))
  }

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLivestreams(generateMockLivestreams())
      setLoading(false)
    }, 1000)
  }, [filter])

  const formatDuration = (startedAt: Date) => {
    const now = new Date()
    const diff = now.getTime() - startedAt.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Video className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to watch livestreams</h2>
          <p className="text-gray-600">Join the community to discover amazing live content</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Live Streams</h1>
            <p className="text-gray-600 mt-2">Discover amazing live content from creators around the world</p>
          </div>
          
          <Link href="/live?mode=stream">
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Go Live
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={filter === 'live' ? 'default' : 'outline'}
            onClick={() => setFilter('live')}
          >
            <Video className="h-4 w-4 mr-2" />
            Live Now
          </Button>
          <Button
            variant={filter === 'trending' ? 'default' : 'outline'}
            onClick={() => setFilter('trending')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </Button>
          <Button
            variant={filter === 'recent' ? 'default' : 'outline'}
            onClick={() => setFilter('recent')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Recent
          </Button>
        </div>

        {/* Livestreams Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="aspect-video bg-gray-300" />
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2" />
                  <div className="h-3 bg-gray-300 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : livestreams.length === 0 ? (
          <div className="text-center py-16">
            <Video className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No live streams right now</h2>
            <p className="text-gray-600 mb-6">Be the first to go live and start streaming!</p>
            <Link href="/live?mode=stream">
              <Button className="bg-red-600 hover:bg-red-700">
                <Video className="h-4 w-4 mr-2" />
                Start Streaming
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {livestreams.map((stream) => (
              <Link key={stream.id} href={`/live?streamId=${stream.id}`}>
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  {/* Thumbnail */}
                  <div className="relative aspect-video">
                    <img
                      src={stream.thumbnailUrl}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Live indicator */}
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="absolute top-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {formatDuration(stream.startedAt)}
                    </div>

                    {/* Viewer count */}
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {stream.viewers.toLocaleString()}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={stream.streamer.avatar}
                        alt={stream.streamer.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                          {stream.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {stream.streamer.displayName}
                          {stream.streamer.verified && (
                            <span className="text-blue-500 ml-1">✓</span>
                          )}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            {stream.category}
                          </span>
                          <span>{stream.viewers.toLocaleString()} viewers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}