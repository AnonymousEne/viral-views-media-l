'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { VideoWithAudio } from '@/components/VideoWithAudio'
import { AudioControls } from '@/components/AudioControls'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Play, 
  Pause, 
  Heart, 
  MessageCircle, 
  Share2, 
  Gift, 
  Users, 
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  Crown,
  Sword,
  Volume2,
  VolumeX,
  Maximize,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LiveStream, StreamMessage, StreamViewer, BattleRequest } from '@/types/livestream'

interface LiveStreamPlayerProps {
  stream: LiveStream
  onClose?: () => void
  isFullscreen?: boolean
}

export function LiveStreamPlayer({ stream, onClose, isFullscreen = false }: LiveStreamPlayerProps) {
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [messages, setMessages] = useState<StreamMessage[]>([])
  const [viewers, setViewers] = useState<StreamViewer[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [showGifts, setShowGifts] = useState(false)
  const [showBattleRequest, setShowBattleRequest] = useState(false)
  const [battleRequestMessage, setBattleRequestMessage] = useState('')

  // Mock data for demonstration
  useEffect(() => {
    const mockMessages: StreamMessage[] = [
      {
        id: '1',
        streamId: stream.id,
        userId: 'user1',
        username: 'RapperKing',
        message: '🔥🔥🔥 This beat is fire!',
        type: 'chat',
        timestamp: new Date(Date.now() - 30000)
      },
      {
        id: '2',
        streamId: stream.id,
        userId: 'user2',
        username: 'BeatMaster',
        message: 'Challenge me bro! 💪',
        type: 'chat',
        timestamp: new Date(Date.now() - 20000)
      },
      {
        id: '3',
        streamId: stream.id,
        userId: 'user3',
        username: 'FlowQueen',
        message: 'Your flow is insane! 🎤',
        type: 'chat',
        timestamp: new Date(Date.now() - 10000)
      }
    ]
    setMessages(mockMessages)

    const mockViewers: StreamViewer[] = [
      {
        id: '1',
        username: 'RapperKing',
        joinedAt: new Date(),
        isModerator: false,
        isStreamer: false
      },
      {
        id: '2',
        username: 'BeatMaster',
        joinedAt: new Date(),
        isModerator: true,
        isStreamer: false
      }
    ]
    setViewers(mockViewers)
  }, [stream.id])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim() || !user) return

    const newMessage: StreamMessage = {
      id: Date.now().toString(),
      streamId: stream.id,
      userId: user.uid,
      username: user.displayName || user.username,
      userAvatar: user.avatar,
      message: chatMessage,
      type: 'chat',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setChatMessage('')
    
    // Auto scroll to bottom
    setTimeout(() => {
      chatScrollRef.current?.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }, 100)
  }

  const handleBattleRequest = () => {
    if (!user || !battleRequestMessage.trim()) return

    const request: BattleRequest = {
      id: Date.now().toString(),
      streamId: stream.id,
      challengerId: user.uid,
      challengerName: user.displayName || user.username,
      challengerAvatar: user.avatar,
      message: battleRequestMessage,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    }

    // Add battle request as system message
    const systemMessage: StreamMessage = {
      id: Date.now().toString(),
      streamId: stream.id,
      userId: 'system',
      username: 'System',
      message: `${user.displayName || user.username} wants to battle! "${battleRequestMessage}"`,
      type: 'battle_request',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, systemMessage])
    setBattleRequestMessage('')
    setShowBattleRequest(false)
  }

  const gifts = [
    { id: '1', name: 'Fire', icon: '🔥', value: 1 },
    { id: '2', name: 'Crown', icon: '👑', value: 5 },
    { id: '3', name: 'Diamond', icon: '💎', value: 10 },
    { id: '4', name: 'Mic Drop', icon: '🎤', value: 20 }
  ]

  return (
    <div className={cn(
      "relative bg-black text-white",
      isFullscreen ? "fixed inset-0 z-50" : "w-full h-[600px] rounded-lg overflow-hidden"
    )}>
      {/* Enhanced Video Player with Audio */}
      <VideoWithAudio
        videoSrc={stream.streamUrl || '/api/placeholder-video'}
        isLive={true}
        isStreamer={stream.streamerId === user?.id}
        streamId={stream.id}
        autoPlay={true}
        controls={true}
        enableMicrophone={stream.streamerId === user?.id}
        enableCamera={stream.streamerId === user?.id}
        muted={false}
        poster={stream.thumbnailUrl}
        className="w-full h-full"
      />

      {/* Stream Overlay Content */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 transition-opacity pointer-events-none",
        showControls ? "opacity-100" : "opacity-0"
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      >
        <div className="pointer-events-auto">
          {/* Top Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-red-600 px-2 py-1 rounded-full text-xs font-bold">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
              <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{stream.viewerCount.toLocaleString()}</span>
              </div>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-6 h-6" />
              </Button>
            )}
          </div>

          {/* Center Play/Pause */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="w-16 h-16 rounded-full bg-black/50 hover:bg-black/70"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
            <Button variant="ghost" size="icon">
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Streamer Info Overlay */}
        <div className="absolute bottom-20 left-4 right-80">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={stream.streamerAvatar || '/api/placeholder-avatar'}
              alt={stream.streamerName}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <h3 className="font-bold text-white">{stream.streamerName}</h3>
              <p className="text-sm text-gray-300">{stream.category}</p>
            </div>
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              Follow
            </Button>
          </div>
          <h2 className="text-lg font-bold mb-1">{stream.title}</h2>
          <p className="text-sm text-gray-300">{stream.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {stream.tags.map(tag => (
              <span key={tag} className="text-xs bg-white/20 px-2 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="absolute right-4 bottom-20 flex flex-col gap-4">
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-12 h-12 rounded-full",
                isLiked ? "bg-red-600 text-white" : "bg-black/50"
              )}
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
            </Button>
            <span className="text-xs mt-1">2.1K</span>
          </div>

          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-black/50"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <span className="text-xs mt-1">345</span>
          </div>

          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-black/50"
              onClick={() => setShowGifts(!showGifts)}
            >
              <Gift className="w-6 h-6" />
            </Button>
            <span className="text-xs mt-1">Gift</span>
          </div>

          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700"
              onClick={() => setShowBattleRequest(true)}
            >
              <Sword className="w-6 h-6" />
            </Button>
            <span className="text-xs mt-1">Battle</span>
          </div>

          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 rounded-full bg-black/50"
            >
              <Share2 className="w-6 h-6" />
            </Button>
            <span className="text-xs mt-1">Share</span>
          </div>
        </div>
      </div>

      {/* Chat Overlay */}
      <div className="absolute right-4 top-16 bottom-32 w-72 bg-black/70 rounded-lg backdrop-blur-sm">
        <div className="p-3 border-b border-white/20">
          <h3 className="font-semibold">Live Chat</h3>
        </div>
        
        <ScrollArea ref={chatScrollRef} className="flex-1 p-3 h-[400px]">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                  {message.username.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-purple-400">
                      {message.username}
                    </span>
                    {message.type === 'battle_request' && (
                      <Crown className="w-3 h-3 text-yellow-400" />
                    )}
                  </div>
                  <p className="text-sm text-white">{message.message}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-3 border-t border-white/20">
          <div className="flex gap-2">
            <Input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Say something..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button type="submit" size="icon" disabled={!chatMessage.trim()}>
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Gift Overlay */}
      {showGifts && (
        <div className="absolute bottom-32 right-20 w-64 bg-black/90 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Send a Gift</h3>
          <div className="grid grid-cols-2 gap-2">
            {gifts.map((gift) => (
              <Button
                key={gift.id}
                variant="outline"
                className="flex flex-col items-center gap-1 h-16 bg-white/10 border-white/20 hover:bg-white/20"
              >
                <span className="text-2xl">{gift.icon}</span>
                <span className="text-xs">{gift.value} coins</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Battle Request Modal */}
      {showBattleRequest && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
            <h3 className="text-lg font-bold mb-4">Challenge to Battle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your message</label>
                <Input
                  value={battleRequestMessage}
                  onChange={(e) => setBattleRequestMessage(e.target.value)}
                  placeholder="I challenge you to a rap battle!"
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleBattleRequest}
                  disabled={!battleRequestMessage.trim()}
                  className="flex-1"
                >
                  Send Challenge
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowBattleRequest(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
