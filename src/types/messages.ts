export type MediaType = 'image' | 'video'

export interface MediaMessage {
  url: string
  type: MediaType
  thumbnailUrl?: string
  filename: string
  size: number
  duration?: number // For videos
  dimensions?: {
    width: number
    height: number
  }
}

export interface Message {
  id: string
  senderId: string
  recipientId: string
  content: string
  createdAt: Date
  read: boolean
  type: 'text' | 'battle_invite' | 'collab_request' | 'feedback' | 'media'
  media?: MediaMessage
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage?: Message
  updatedAt: Date
  unreadCount: number
}

export interface MessageNotification {
  id: string
  type: 'message' | 'battle_invite' | 'collab_request'
  senderId: string
  message: string
  createdAt: Date
  read: boolean
}
