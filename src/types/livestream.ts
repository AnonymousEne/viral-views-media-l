export interface LiveStream {
  id: string
  streamerId: string
  streamerName: string
  streamerAvatar?: string
  title: string
  description: string
  category: 'battle' | 'cypher' | 'freestyle' | 'general'
  tags: string[]
  isLive: boolean
  startedAt: Date
  endedAt?: Date
  viewerCount: number
  maxViewers: number
  streamKey?: string
  streamUrl?: string
  thumbnailUrl?: string
  settings: {
    allowComments: boolean
    allowGifts: boolean
    isPublic: boolean
    moderatorsOnly: boolean
  }
}

export interface StreamMessage {
  id: string
  streamId: string
  userId: string
  username: string
  userAvatar?: string
  message: string
  type: 'chat' | 'gift' | 'join' | 'leave' | 'battle_request' | 'system'
  timestamp: Date
  giftData?: {
    giftId: string
    giftName: string
    giftValue: number
    giftIcon: string
  }
}

export interface StreamViewer {
  id: string
  username: string
  avatar?: string
  joinedAt: Date
  isModerator: boolean
  isStreamer: boolean
}

export interface BattleRequest {
  id: string
  streamId: string
  challengerId: string
  challengerName: string
  challengerAvatar?: string
  message: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  createdAt: Date
  expiresAt: Date
}

export interface StreamGift {
  id: string
  name: string
  icon: string
  animation: string
  value: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}
