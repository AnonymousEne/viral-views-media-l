'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  startAfter, 
  onSnapshot, 
  where,
  DocumentSnapshot
} from 'firebase/firestore'
import { Video, User } from '@/types/firebase'
import VideoPost from './VideoPost'
import { Loader2, RefreshCw, TrendingUp, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

type FeedFilter = 'trending' | 'recent' | 'following'

export default function VideoFeed() {
  const [user] = useAuthState(auth)
  const [videos, setVideos] = useState<(Video & { user: User })[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filter, setFilter] = useState<FeedFilter>('trending')
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const loadVideos = async (isInitial = false, feedFilter = filter) => {
    try {
      if (isInitial) {
        setLoading(true)
        setVideos([])
        setLastDoc(null)
        setHasMore(true)
      } else {
        setLoadingMore(true)
      }

      let q = query(
        collection(db, 'videos'),
        where('privacy', '==', 'public'),
        where('processed', '==', true)
      )

      // Apply filter
      switch (feedFilter) {
        case 'trending':
          q = query(q, orderBy('likes', 'desc'), orderBy('views', 'desc'))
          break
        case 'recent':
          q = query(q, orderBy('uploadedAt', 'desc'))
          break
        case 'following':
          if (user) {
            // TODO: Add following logic when user following is implemented
            q = query(q, orderBy('uploadedAt', 'desc'))
          }
          break
      }

      q = query(q, limit(10))

      if (!isInitial && lastDoc) {
        q = query(q, startAfter(lastDoc))
      }

      // For now, we'll simulate data since we're transitioning
      // In a real implementation, this would fetch from Firestore
      const mockVideos = generateMockVideos(isInitial ? 0 : videos.length)
      
      if (isInitial) {
        setVideos(mockVideos)
      } else {
        setVideos(prev => [...prev, ...mockVideos])
      }

      setHasMore(mockVideos.length === 10)
      
    } catch (error) {
      console.error('Error loading videos:', error)
      setError('Failed to load videos')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Mock data generator for transition period
  const generateMockVideos = (startIndex: number) => {
    const mockUsers = [
      { id: '1', username: 'artist1', displayName: 'Creative Artist', avatar: 'https://picsum.photos/40/40?random=1' },
      { id: '2', username: 'dancer2', displayName: 'Dance Master', avatar: 'https://picsum.photos/40/40?random=2' },
      { id: '3', username: 'musician3', displayName: 'Beat Maker', avatar: 'https://picsum.photos/40/40?random=3' },
    ]

    return Array.from({ length: 10 }, (_, i) => {
      const index = startIndex + i
      const mockUser = mockUsers[index % mockUsers.length]
      
      return {
        id: `video-${index}`,
        userId: mockUser.id,
        title: `Creative Video ${index + 1}`,
        description: `This is an amazing short video showcasing creativity and talent. Video number ${index + 1}`,
        url: `https://sample-videos.com/zip/10/mp4/360/small_video_${(index % 3) + 1}.mp4`,
        thumbnailUrl: `https://picsum.photos/400/600?random=${index}`,
        duration: Math.floor(Math.random() * 50) + 10, // 10-60 seconds
        category: ['dance', 'music', 'art', 'comedy', 'lifestyle'][index % 5],
        tags: ['creative', 'viral', 'trending'],
        privacy: 'public' as const,
        likes: Math.floor(Math.random() * 1000) + 50,
        comments: Math.floor(Math.random() * 100) + 5,
        views: Math.floor(Math.random() * 10000) + 100,
        uploadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        processed: true,
        user: {
          ...mockUser,
          email: `${mockUser.username}@example.com`,
          bio: `Creative content creator passionate about ${['dance', 'music', 'art'][index % 3]}`,
          followers: Math.floor(Math.random() * 10000) + 100,
          following: Math.floor(Math.random() * 1000) + 50,
          videoStats: {
            totalVideos: Math.floor(Math.random() * 100) + 10,
            totalLikes: Math.floor(Math.random() * 50000) + 1000,
            totalViews: Math.floor(Math.random() * 500000) + 10000,
          },
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          verified: Math.random() > 0.7,
        }
      }
    })
  }

  // Load initial videos
  useEffect(() => {
    loadVideos(true)
  }, [filter])

  // Infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadVideos(false)
        }
      },
      { threshold: 0.1 }
    )

    const lastVideoElement = containerRef.current?.lastElementChild
    if (lastVideoElement) {
      observer.observe(lastVideoElement)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [videos, hasMore, loadingMore])

  const handleRefresh = () => {
    loadVideos(true)
  }

  const handleVideoLike = (videoId: string, liked: boolean) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, likes: video.likes + (liked ? 1 : -1) }
        : video
    ))
  }

  const handleVideoComment = (videoId: string, comment: string) => {
    setVideos(prev => prev.map(video => 
      video.id === videoId 
        ? { ...video, comments: video.comments + 1 }
        : video
    ))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Feed filters */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-white">Feed</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex gap-1 px-4 pb-3">
          <Button
            variant={filter === 'trending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('trending')}
            className={filter === 'trending' ? '' : 'text-gray-400 hover:text-white'}
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Trending
          </Button>
          <Button
            variant={filter === 'recent' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('recent')}
            className={filter === 'recent' ? '' : 'text-gray-400 hover:text-white'}
          >
            <Clock className="h-4 w-4 mr-1" />
            Recent
          </Button>
          {user && (
            <Button
              variant={filter === 'following' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter('following')}
              className={filter === 'following' ? '' : 'text-gray-400 hover:text-white'}
            >
              <Users className="h-4 w-4 mr-1" />
              Following
            </Button>
          )}
        </div>
      </div>

      {/* Video feed */}
      <div 
        ref={containerRef}
        className="pb-20"
      >
        {videos.map((video, index) => (
          <div key={video.id} className="min-h-screen flex items-center justify-center p-4">
            <VideoPost
              video={video}
              user={video.user}
              onLike={handleVideoLike}
              onComment={handleVideoComment}
            />
          </div>
        ))}

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}

        {/* End of feed */}
        {!hasMore && videos.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            You've reached the end of the feed
          </div>
        )}

        {/* Empty state */}
        {videos.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-white">
            <TrendingUp className="h-12 w-12 text-gray-500" />
            <h2 className="text-xl font-semibold">No videos yet</h2>
            <p className="text-gray-400 text-center max-w-sm">
              Be the first to share a video and start the conversation!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}