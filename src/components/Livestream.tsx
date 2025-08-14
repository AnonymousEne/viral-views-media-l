'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore'
import { Livestream, LivestreamMessage, User } from '@/types/firebase'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  Send, 
  Settings,
  Share,
  Heart,
  Gift,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LivestreamProps {
  streamId?: string
  isStreamer?: boolean
}

export default function Livestream({ streamId, isStreamer = false }: LivestreamProps) {
  const [user] = useAuthState(auth)
  const [isLive, setIsLive] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const [messages, setMessages] = useState<LivestreamMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [streamData, setStreamData] = useState<Livestream | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  // Mock stream data for demonstration
  const generateMockStream = (): Livestream => ({
    id: streamId || 'stream-1',
    userId: isStreamer ? (user?.uid || 'current-user') : 'streamer-user',
    title: isStreamer ? 'My Live Stream' : 'Amazing Dance Performance Live!',
    description: isStreamer ? 'Going live now!' : 'Join me for an incredible dance session with live music!',
    category: 'dance',
    tags: ['live', 'dance', 'music', 'performance'],
    status: 'live' as const,
    viewers: Math.floor(Math.random() * 500) + 50,
    maxViewers: Math.floor(Math.random() * 800) + 200,
    streamKey: isStreamer ? 'sk_live_123456789' : undefined,
    streamUrl: 'https://stream.example.com/live/stream-1',
    thumbnailUrl: 'https://picsum.photos/800/450?random=1',
    startedAt: new Date(Date.now() - 15 * 60 * 1000), // Started 15 minutes ago
    createdAt: new Date()
  })

  const generateMockMessages = (): LivestreamMessage[] => [
    {
      id: 'msg-1',
      livestreamId: streamId || 'stream-1',
      userId: 'viewer-1',
      username: 'dancefan123',
      displayName: 'Sarah Johnson',
      avatar: 'https://picsum.photos/32/32?random=1',
      message: 'Amazing moves! 🔥',
      type: 'message',
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: 'msg-2',
      livestreamId: streamId || 'stream-1',
      userId: 'viewer-2',
      username: 'musiclover',
      displayName: 'Mike Chen',
      avatar: 'https://picsum.photos/32/32?random=2',
      message: 'What song is this?',
      type: 'message',
      timestamp: new Date(Date.now() - 3 * 60 * 1000)
    },
    {
      id: 'msg-3',
      livestreamId: streamId || 'stream-1',
      userId: 'viewer-3',
      username: 'artlover',
      displayName: 'Emma Davis',
      avatar: 'https://picsum.photos/32/32?random=3',
      message: 'Can you teach us this routine?',
      type: 'message',
      timestamp: new Date(Date.now() - 1 * 60 * 1000)
    }
  ]

  // Initialize stream data and mock data
  useEffect(() => {
    setStreamData(generateMockStream())
    setMessages(generateMockMessages())
    setViewerCount(Math.floor(Math.random() * 500) + 50)
    
    // Simulate real-time viewer count changes
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 10) - 5
        return Math.max(1, prev + change)
      })
    }, 5000)

    return () => clearInterval(viewerInterval)
  }, [streamId, isStreamer])

  // Request camera/microphone access for streamers
  const initializeMedia = async () => {
    if (!isStreamer) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      
      mediaStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
      alert('Unable to access camera/microphone. Please check permissions.')
    }
  }

  // Start streaming
  const startStream = async () => {
    if (!user || !isStreamer) return

    try {
      await initializeMedia()
      setIsLive(true)

      // In a real app, this would create the stream in Firestore
      // and integrate with WebRTC streaming service (LiveKit, Mux, etc.)
      
      console.log('Stream started!')
    } catch (error) {
      console.error('Error starting stream:', error)
    }
  }

  // Stop streaming
  const stopStream = () => {
    setIsLive(false)
    
    // Stop media tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    // In a real app, this would update the stream status in Firestore
    console.log('Stream stopped!')
  }

  // Toggle camera
  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsCameraOn(videoTrack.enabled)
      }
    }
  }

  // Toggle microphone
  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMicOn(audioTrack.enabled)
      }
    }
  }

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return

    const message: LivestreamMessage = {
      id: `msg-${Date.now()}`,
      livestreamId: streamId || 'stream-1',
      userId: user.uid,
      username: user.displayName || 'Anonymous',
      displayName: user.displayName || 'Anonymous',
      avatar: user.photoURL || '/default-avatar.png',
      message: newMessage.trim(),
      type: 'message',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // In a real app, this would add to Firestore
    // await addDoc(collection(db, 'livestream_messages'), {
    //   ...message,
    //   timestamp: serverTimestamp()
    // })
  }

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle message input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please sign in to access livestreams</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
          {/* Main Video Area */}
          <div className="lg:col-span-3">
            <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
              {isStreamer ? (
                <>
                  {/* Streamer's camera feed */}
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`}
                  />
                  
                  {!isCameraOn && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <VideoOff className="h-20 w-20 text-gray-400" />
                    </div>
                  )}

                  {/* Stream controls overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {!isLive ? (
                          <Button onClick={startStream} className="bg-red-600 hover:bg-red-700">
                            <Video className="h-4 w-4 mr-2" />
                            Go Live
                          </Button>
                        ) : (
                          <Button onClick={stopStream} variant="destructive">
                            Stop Stream
                          </Button>
                        )}
                      </div>

                      {isLive && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleCamera}
                            className={`${!isCameraOn ? 'bg-red-600' : 'bg-gray-800'}`}
                          >
                            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMic}
                            className={`${!isMicOn ? 'bg-red-600' : 'bg-gray-800'}`}
                          >
                            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowSettings(!showSettings)}
                            className="bg-gray-800"
                          >
                            <Settings className="h-5 w-5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Viewer's stream display */}
                  <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-20 w-20 mx-auto mb-4 text-white/70" />
                      <p className="text-lg">Live Stream</p>
                      <p className="text-sm text-white/70">Video would be displayed here</p>
                    </div>
                  </div>

                  {/* Viewer controls */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="bg-black/50">
                          <Heart className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="bg-black/50">
                          <Share className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="bg-black/50">
                          <Gift className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Live indicator */}
              {(isLive || !isStreamer) && (
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm font-medium">LIVE</span>
                  </div>
                </div>
              )}

              {/* Viewer count */}
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{viewerCount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Stream Info */}
            <div className="mt-4">
              <h1 className="text-2xl font-bold">{streamData?.title}</h1>
              <p className="text-gray-400 mt-2">{streamData?.description}</p>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{viewerCount} viewers</span>
                </div>
                {streamData?.startedAt && (
                  <div className="text-gray-400">
                    Started {formatTime(streamData.startedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1 bg-gray-900 rounded-lg flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-semibold">Live Chat</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start gap-2">
                  <img
                    src={message.avatar}
                    alt={message.displayName}
                    className="w-6 h-6 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-400">
                        {message.username}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{message.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Say something..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={200}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && isStreamer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Stream Settings</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stream Title</label>
                <input
                  type="text"
                  defaultValue={streamData?.title}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  defaultValue={streamData?.description}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                />
              </div>
              
              <div className="flex gap-3">
                <Button onClick={() => setShowSettings(false)} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowSettings(false)} className="flex-1">
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