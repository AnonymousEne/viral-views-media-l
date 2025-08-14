'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { User, Video } from '@/types/firebase'
import { Button } from '@/components/ui/button'
import { 
  User as UserIcon, 
  Video as VideoIcon, 
  MessageCircle, 
  Heart, 
  Users, 
  Settings, 
  Upload,
  Play,
  Eye,
  Calendar,
  MapPin,
  Instagram,
  Youtube,
  Music,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface ProfilePageProps {
  params: { userId: string }
}

export default function UserProfilePage({ params }: ProfilePageProps) {
  const [currentUser] = useAuthState(auth)
  const [user, setUser] = useState<User | null>(null)
  const [userVideos, setUserVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'videos' | 'liked'>('videos')
  const [isFollowing, setIsFollowing] = useState(false)

  const isOwnProfile = currentUser?.uid === params.userId

  // Mock user data for demonstration
  const generateMockUser = (userId: string): User => ({
    id: userId,
    username: userId === 'user-1' ? 'creativedancer' : 'musicmaker',
    displayName: userId === 'user-1' ? 'Alex Rivera' : 'Jordan Kim',
    email: userId === 'user-1' ? 'alex@example.com' : 'jordan@example.com',
    avatar: `https://picsum.photos/150/150?random=${userId === 'user-1' ? 1 : 2}`,
    bio: userId === 'user-1' 
      ? 'Professional dancer and choreographer. Sharing my passion for movement and creativity! 💃✨' 
      : 'Music producer and beat maker. Creating the sounds that move your soul 🎵🔥',
    location: userId === 'user-1' ? 'New York, NY' : 'Atlanta, GA',
    followers: userId === 'user-1' ? 25000 : 18500,
    following: userId === 'user-1' ? 1200 : 890,
    socialLinks: userId === 'user-1' ? {
      instagram: '@alexdanceofficial',
      youtube: 'AlexRiveraChoreography',
    } : {
      instagram: '@jordanbeats',
      soundcloud: 'jordan-kim-beats'
    },
    videoStats: {
      totalVideos: userId === 'user-1' ? 67 : 43,
      totalLikes: userId === 'user-1' ? 250000 : 180000,
      totalViews: userId === 'user-1' ? 1200000 : 950000,
    },
    createdAt: new Date(Date.now() - (userId === 'user-1' ? 2 : 1.5) * 365 * 24 * 60 * 60 * 1000),
    verified: userId === 'user-1'
  })

  const generateMockVideos = (userId: string): Video[] => {
    const videoTitles = userId === 'user-1' 
      ? ['Contemporary Dance Fusion', 'Hip Hop Tutorial', 'Freestyle Friday', 'Dance Battle Prep', 'Choreography Breakdown', 'Studio Session']
      : ['Beat Making Process', 'New Track Preview', 'Producer Tips', 'Studio Tour', 'Remix Session', 'Beat Challenge']
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: `${userId}-video-${i + 1}`,
      userId: userId,
      title: videoTitles[i % videoTitles.length] + ` ${i + 1}`,
      description: `Amazing ${userId === 'user-1' ? 'dance' : 'music'} content`,
      url: `https://sample-videos.com/video-${i + 1}.mp4`,
      thumbnailUrl: `https://picsum.photos/400/600?random=${userId === 'user-1' ? i + 20 : i + 30}`,
      duration: Math.floor(Math.random() * 50) + 10,
      category: userId === 'user-1' ? 'dance' : 'music',
      tags: ['creative', 'viral', 'trending'],
      privacy: 'public' as const,
      likes: Math.floor(Math.random() * 10000) + 500,
      comments: Math.floor(Math.random() * 500) + 20,
      views: Math.floor(Math.random() * 100000) + 2000,
      uploadedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      processed: true,
    }))
  }

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUser(generateMockUser(params.userId))
      setUserVideos(generateMockVideos(params.userId))
      setIsFollowing(Math.random() > 0.5) // Random following status
      setLoading(false)
    }, 1000)
  }, [params.userId])

  const handleFollow = async () => {
    setIsFollowing(!isFollowing)
    // In a real app, this would update Firestore
  }

  const handleMessage = () => {
    // Navigate to messages with this user
    window.location.href = '/messages'
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long'
    }).format(date)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-100"
              />
              {user.verified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">
                    {user.displayName}
                    {user.verified && <span className="text-blue-500 ml-2">✓</span>}
                  </h1>
                  <p className="text-gray-600 text-lg">@{user.username}</p>
                </div>
                
                {!isOwnProfile && currentUser && (
                  <div className="flex gap-3 mt-4 sm:mt-0">
                    <Button
                      onClick={handleFollow}
                      variant={isFollowing ? "outline" : "default"}
                      className={isFollowing ? "border-purple-500 text-purple-600" : "bg-purple-600 hover:bg-purple-700"}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Button variant="outline" onClick={handleMessage}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                )}

                {isOwnProfile && (
                  <div className="flex gap-3 mt-4 sm:mt-0">
                    <Link href="/profile/edit">
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>
              )}

              {/* Location & Join Date */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {user.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDate(user.createdAt)}
                </div>
              </div>

              {/* Social Links */}
              {user.socialLinks && (
                <div className="flex gap-3 mb-4">
                  {user.socialLinks.instagram && (
                    <a
                      href={`https://instagram.com/${user.socialLinks.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-pink-600 hover:text-pink-700"
                    >
                      <Instagram className="h-4 w-4" />
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {user.socialLinks.youtube && (
                    <a
                      href={`https://youtube.com/c/${user.socialLinks.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Youtube className="h-4 w-4" />
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {user.socialLinks.soundcloud && (
                    <a
                      href={`https://soundcloud.com/${user.socialLinks.soundcloud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
                    >
                      <Music className="h-4 w-4" />
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(user.videoStats.totalVideos)}</div>
                  <div className="text-sm text-gray-600">Videos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(user.followers)}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(user.following)}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(user.videoStats.totalLikes)}</div>
                  <div className="text-sm text-gray-600">Likes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          {/* Tab Navigation */}
          <div className="border-b">
            <nav className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('videos')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'videos'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <VideoIcon className="inline h-4 w-4 mr-1" />
                Videos ({user.videoStats.totalVideos})
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => setActiveTab('liked')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'liked'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Heart className="inline h-4 w-4 mr-1" />
                  Liked
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'videos' && (
              <div>
                {userVideos.length === 0 ? (
                  <div className="text-center py-16">
                    <VideoIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
                    <p className="text-gray-600">{isOwnProfile ? 'Start creating content to share with your audience' : 'This user hasn\'t posted any videos yet'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userVideos.map((video) => (
                      <div key={video.id} className="relative group cursor-pointer">
                        <div className="aspect-[9/16] bg-gray-900 rounded-lg overflow-hidden">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          
                          {/* Play button overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="h-12 w-12 text-white" />
                          </div>

                          {/* Video stats */}
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="flex items-center justify-between text-white text-sm">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {formatNumber(video.views)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {formatNumber(video.likes)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <h4 className="mt-2 text-sm font-medium text-gray-900 line-clamp-2">
                          {video.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'liked' && isOwnProfile && (
              <div className="text-center py-16">
                <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No liked videos</h3>
                <p className="text-gray-600">Videos you like will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}