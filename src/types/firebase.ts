// User types
export interface User {
  id: string
  username: string
  displayName: string
  email: string
  avatar: string
  followers: number
  following: number
  battleStats: {
    wins: number
    losses: number
    draws: number
    totalBattles: number
  }
  createdAt: Date
  verified: boolean
}

// Battle types
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

// Notification types
export interface Notification {
  id: string
  userId: string
  type: 'battle_invite' | 'battle_start' | 'battle_result' | 'new_follower' | 'system'
  title: string
  message: string
  data?: any
  read: boolean
  createdAt: Date
}

// Chat types
export interface ChatMessage {
  id: string
  battleId: string
  userId: string
  username: string
  message: string
  timestamp: Date
  type: 'message' | 'reaction' | 'system'
}
