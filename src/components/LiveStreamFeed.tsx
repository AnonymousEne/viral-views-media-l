'use client'

import React, { useState, useEffect } from 'react'
import { VoiceEffectsControl } from './VoiceEffectsControl'
import { LiveStreamPlayer } from '@/components/LiveStreamPlayer'
import { StreamCreator } from '@/components/StreamCreator'
import { VerticalStreamFeed } from '@/components/VerticalStreamFeed'
import { FloatingActionButton } from '@/components/FloatingActionButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  Eye,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LiveStream } from '@/types/livestream'

export function LiveStreamFeed() {
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null)
  const [showCreator, setShowCreator] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'viewers' | 'recent' | 'trending'>('viewers')
  const [verticalFeedIndex, setVerticalFeedIndex] = useState<number | null>(null)

  const categories = [
    { value: 'all', label: 'All', icon: '🎵' },
    { value: 'battle', label: 'Battles', icon: '⚔️' },
    { value: 'cypher', label: 'Cyphers', icon: '🎤' },
    { value: 'freestyle', label: 'Freestyle', icon: '🎶' },
    { value: 'general', label: 'General', icon: '💬' }
  ]

  // Mock data for demonstration
  useEffect(() => {
    const mockStreams: LiveStream[] = [
      {
        id: '1',
        streamerId: 'user1',
        streamerName: 'MC FlowMaster',
        streamerAvatar: '/api/placeholder-avatar',
        title: 'Live Rap Battle Tournament - Round 1 🔥',
        description: 'Epic rap battles happening now! Come watch and vote for your favorite!',
        category: 'battle',
        tags: ['battle', 'tournament', 'live', 'hiphop'],
        isLive: true,
        startedAt: new Date(Date.now() - 30 * 60 * 1000),
        viewerCount: 2847,
        maxViewers: 3200,
        streamUrl: '/api/placeholder-stream',
        thumbnailUrl: '/api/placeholder-thumbnail',
        settings: {
          allowComments: true,
          allowGifts: true,
          isPublic: true,
          moderatorsOnly: false
        }
      },
      {
        id: '2',
        streamerId: 'user2',
        streamerName: 'BeatQueen',
        streamerAvatar: '/api/placeholder-avatar',
        title: 'Freestyle Friday - Open Mic 🎤',
        description: 'Join our weekly freestyle session! Everyone welcome to participate',
        category: 'freestyle',
        tags: ['freestyle', 'openmic', 'friday', 'community'],
        isLive: true,
        startedAt: new Date(Date.now() - 15 * 60 * 1000),
        viewerCount: 1523,
        maxViewers: 1800,
        streamUrl: '/api/placeholder-stream',
        thumbnailUrl: '/api/placeholder-thumbnail',
        settings: {
          allowComments: true,
          allowGifts: true,
          isPublic: true,
          moderatorsOnly: false
        }
      },
      {
        id: '3',
        streamerId: 'user3',
        streamerName: 'CypherKing',
        streamerAvatar: '/api/placeholder-avatar',
        title: 'Underground Cypher Session 🌃',
        description: 'Raw underground vibes with the best MCs in the city',
        category: 'cypher',
        tags: ['cypher', 'underground', 'raw', 'street'],
        isLive: true,
        startedAt: new Date(Date.now() - 45 * 60 * 1000),
        viewerCount: 892,
        maxViewers: 1100,
        streamUrl: '/api/placeholder-stream',
        thumbnailUrl: '/api/placeholder-thumbnail',
        settings: {
          allowComments: true,
          allowGifts: true,
          isPublic: true,
          moderatorsOnly: false
        }
      }
    ]
    setStreams(mockStreams)
  }, [])

  const filteredStreams = streams.filter((stream: LiveStream) => {
    const matchesSearch = stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.streamerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || stream.category === selectedCategory

    return matchesSearch && matchesCategory && stream.isLive
  }).sort((a: LiveStream, b: LiveStream) => {
    switch (sortBy) {
      case 'viewers':
        return b.viewerCount - a.viewerCount
      case 'recent':
        return new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      case 'trending':
        return (b.viewerCount / Math.max(1, (Date.now() - new Date(b.startedAt).getTime()) / 60000)) -
          (a.viewerCount / Math.max(1, (Date.now() - new Date(a.startedAt).getTime()) / 60000))
      default:
        return 0
    }
  })

  const handleStreamStart = (newStream: LiveStream) => {
    setStreams((prev: LiveStream[]) => [...prev, newStream])
    setSelectedStream(newStream)
    setShowCreator(false)
  }

  const handleStreamEnd = () => {
    setSelectedStream(null)
    // Remove ended stream from list
    if (selectedStream) {
      setStreams((prev: LiveStream[]) => prev.filter((s: LiveStream) => s.id !== selectedStream.id))
    }
  }

  const formatDuration = (startTime: Date) => {
    const minutes = Math.floor((Date.now() - startTime.getTime()) / 60000)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  if (verticalFeedIndex !== null) {
    return (
      <VerticalStreamFeed
        streams={filteredStreams}
        initialIndex={verticalFeedIndex}
        onClose={() => setVerticalFeedIndex(null)}
      />
    )
  }

  if (selectedStream) {
    return (
      <LiveStreamPlayer 
        stream={selectedStream} 
        onClose={() => setSelectedStream(null)}
        isFullscreen={true}
      />
    )
  }

  if (showCreator) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowCreator(false)}
            >
              ← Back to Streams
            </Button>
            <h1 className="text-2xl font-bold">Create Live Stream</h1>
          </div>
          {/* Optional Voice Effects for Livestreams */}
          <VoiceEffectsControl />
          <StreamCreator
            onStreamStart={handleStreamStart}
            onStreamEnd={handleStreamEnd}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Live Streams
            </h1>
            <Button onClick={() => setShowCreator(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Go Live
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Search streams, creators, or tags..."
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'viewers' | 'recent' | 'trending')}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="viewers">Most Viewers</option>
                <option value="recent">Recently Started</option>
                <option value="trending">Trending</option>
              </select>
              
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="whitespace-nowrap"
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Streams Grid */}
      <div className="container mx-auto px-4 py-6">
        {filteredStreams.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No streams found matching your criteria' 
                : 'No live streams right now'
              }
            </div>
            <Button onClick={() => setShowCreator(true)} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Be the first to go live!
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStreams.map((stream: LiveStream) => (
              <div
                key={stream.id}
                className="group cursor-pointer bg-card rounded-lg overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all"
                onClick={() => {
                  // On mobile, open vertical feed for swipe through
                  if (window.innerWidth < 768) {
                    setVerticalFeedIndex(filteredStreams.findIndex((s: LiveStream) => s.id === stream.id))
                  } else {
                    setSelectedStream(stream)
                  }
                }}
              >
                <div className="relative">
                  <img
                    src={stream.thumbnailUrl}
                    alt={stream.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Live Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-2 bg-red-600 px-2 py-1 rounded-full text-xs font-bold text-white">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                  
                  {/* Duration */}
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                    {formatDuration(stream.startedAt)}
                  </div>
                  
                  {/* Viewer Count */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded text-xs text-white">
                    <Eye className="w-3 h-3" />
                    {stream.viewerCount.toLocaleString()}
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute bottom-2 left-2 bg-purple-600 px-2 py-1 rounded text-xs text-white font-medium">
                    {categories.find(c => c.value === stream.category)?.icon} {stream.category}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={stream.streamerAvatar || '/api/placeholder-avatar'}
                      alt={stream.streamerName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{stream.streamerName}</h3>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold mb-1 line-clamp-2">{stream.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{stream.description}</p>
                  
                  <div className="flex flex-wrap gap-1">
                    {stream.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                    {stream.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{stream.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button for quick stream creation */}
      <FloatingActionButton 
        onClick={() => setShowCreator(true)}
        variant="live"
      />
    </div>
  )
}
