// User types
export interface User {
  id: string
  username: string
  displayName: string
  email: string
  avatar: string
  bio?: string
  location?: string
  followers: number
  following: number
  socialLinks?: {
    instagram?: string
    youtube?: string
    soundcloud?: string
    tiktok?: string
  }
  videoStats: {
    totalVideos: number
    totalLikes: number
    totalViews: number
  }
  createdAt: Date
  verified: boolean
}

// Video types for short video platform
export interface Video {
  id: string
  userId: string
  title: string
  description?: string
  url: string
  thumbnailUrl?: string
  duration: number // in seconds, max 60
  category: string
  tags: string[]
  privacy: 'public' | 'private' | 'unlisted'
  likes: number
  comments: number
  views: number
  uploadedAt: Date
  processed: boolean
}

export interface VideoComment {
  id: string
  videoId: string
  userId: string
  username: string
  displayName: string
  avatar: string
  content: string
  likes: number
  parentId?: string // for replies
  createdAt: Date
}

export interface VideoLike {
  id: string
  videoId: string
  userId: string
  createdAt: Date
}

// Chat and Messaging types
export interface Chat {
  id: string
  participants: string[]
  type: 'direct' | 'group'
  name?: string // for group chats
  avatar?: string // for group chats
  lastMessage?: {
    content: string
    senderId: string
    timestamp: Date
    type: 'text' | 'video' | 'image'
  }
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  content: string
  type: 'text' | 'video' | 'image' | 'system'
  mediaUrl?: string
  mediaType?: string
  replyTo?: string // message ID being replied to
  readBy: { [userId: string]: Date }
  editedAt?: Date
  deletedAt?: Date
  createdAt: Date
}

// Livestream types
export interface Livestream {
  id: string
  userId: string
  title: string
  description?: string
  category: string
  tags: string[]
  status: 'scheduled' | 'live' | 'ended'
  viewers: number
  maxViewers: number
  duration?: number // in seconds
  streamKey?: string
  streamUrl?: string
  thumbnailUrl?: string
  scheduledFor?: Date
  startedAt?: Date
  endedAt?: Date
  createdAt: Date
}

export interface LivestreamMessage {
  id: string
  livestreamId: string
  userId: string
  username: string
  displayName: string
  avatar: string
  message: string
  type: 'message' | 'join' | 'leave' | 'donation' | 'system'
  timestamp: Date
}

export interface LivestreamViewer {
  id: string
  livestreamId: string
  userId: string
  joinedAt: Date
  leftAt?: Date
}

// Notification types
export interface Notification {
  id: string
  userId: string
  type: 'video_like' | 'video_comment' | 'new_follower' | 'message' | 'livestream_start' | 'system'
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
}

// Legacy Battle types (keeping for gradual migration)
export interface Battle {
  id: string
  title: string
  participants: string[]
  status: 'waiting' | 'live' | 'judging' | 'finished'
  rounds: Round[]
  spectators: string[]
  winner?: string
  createdAt: Date
  scheduledFor?: Date
}

export interface Round {
  id: string
  battleId: string
  roundNumber: number
  participant1Content: Content
  participant2Content: Content
  judging: Judging
  winner?: string
  createdAt: Date
}

export interface Content {
  userId: string
  type: 'video' | 'audio' | 'text'
  url?: string
  text?: string
  duration?: number
  uploadedAt: Date
}

export interface Judging {
  aiScore: {
    participant1: number
    participant2: number
    criteria: {
      creativity: number
      technical: number
      entertainment: number
      originality: number
    }
  }
  communityVotes: {
    participant1: number
    participant2: number
  }
  expertJudges?: {
    judgeId: string
    score: {
      participant1: number
      participant2: number
    }
    comments?: string
  }[]
}

// Legacy chat type for battles
export interface ChatMessage {
  id: string
  battleId: string
  userId: string
  username: string
  message: string
  timestamp: Date
  type: 'message' | 'reaction' | 'system'
}
