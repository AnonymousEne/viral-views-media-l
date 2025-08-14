'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Settings, 
  Users,
  Play,
  Square,
  Camera,
  CameraOff,
  Monitor
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LiveStream } from '@/types/livestream'

interface StreamCreatorProps {
  onStreamStart?: (stream: LiveStream) => void
  onStreamEnd?: () => void
}

export function StreamCreator({ onStreamStart, onStreamEnd }: StreamCreatorProps) {
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [isStreaming, setIsStreaming] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [streamTitle, setStreamTitle] = useState('')
  const [streamDescription, setStreamDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'battle' | 'cypher' | 'freestyle' | 'general'>('freestyle')
  const [streamTags, setStreamTags] = useState('')
  const [currentViewers, setCurrentViewers] = useState(0)

  const categories = [
    { value: 'battle', label: '⚔️ Rap Battle', description: 'Live rap battles and competitions' },
    { value: 'cypher', label: '🎤 Cypher Session', description: 'Group freestyle sessions' },
    { value: 'freestyle', label: '🎵 Freestyle', description: 'Solo freestyle performances' },
    { value: 'general', label: '💬 General', description: 'Casual streaming and chat' }
  ]

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setIsPreviewing(true)
    } catch (error) {
      console.error('Failed to start preview:', error)
      alert('Failed to access camera/microphone. Please check permissions.')
    }
  }

  const stopPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsPreviewing(false)
  }

  const toggleVideo = async () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled
        setIsVideoEnabled(!isVideoEnabled)
      }
    }
  }

  const toggleAudio = async () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled
        setIsAudioEnabled(!isAudioEnabled)
      }
    }
  }

  const startStream = async () => {
    if (!streamTitle.trim()) {
      alert('Please enter a stream title')
      return
    }

    if (!isPreviewing) {
      await startPreview()
    }

    const newStream: LiveStream = {
      id: Date.now().toString(),
      streamerId: user?.uid || '',
      streamerName: user?.displayName || user?.username || 'Unknown',
      streamerAvatar: user?.avatar,
      title: streamTitle,
      description: streamDescription,
      category: selectedCategory,
      tags: streamTags.split(',').map(tag => tag.trim()).filter(Boolean),
      isLive: true,
      startedAt: new Date(),
      viewerCount: 0,
      maxViewers: 0,
      streamUrl: 'mock-stream-url',
      settings: {
        allowComments: true,
        allowGifts: true,
        isPublic: true,
        moderatorsOnly: false
      }
    }

    setIsStreaming(true)
    onStreamStart?.(newStream)

    // Simulate viewer count updates
    const viewerInterval = setInterval(() => {
      setCurrentViewers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1
        return Math.max(0, prev + change)
      })
    }, 5000)

    // Store interval for cleanup
    return () => clearInterval(viewerInterval)
  }

  const endStream = () => {
    setIsStreaming(false)
    stopPreview()
    onStreamEnd?.()
    setCurrentViewers(0)
  }

  if (isStreaming) {
    return (
      <div className="bg-black text-white rounded-lg overflow-hidden">
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-[400px] object-cover"
          />
          
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <CameraOff className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {/* Stream Controls Overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-sm font-bold">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
              <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                <Users className="w-4 h-4" />
                <span className="text-sm">{currentViewers}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVideo}
                className={cn(
                  "bg-black/50",
                  !isVideoEnabled && "bg-red-600"
                )}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleAudio}
                className={cn(
                  "bg-black/50",
                  !isAudioEnabled && "bg-red-600"
                )}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="bg-black/50"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{streamTitle}</h3>
              <p className="text-sm text-gray-300">{streamDescription}</p>
            </div>
            
            <Button
              onClick={endStream}
              className="bg-red-600 hover:bg-red-700"
            >
              <Square className="w-4 h-4 mr-2" />
              End Stream
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Start Your Live Stream</h2>
      
      <div className="space-y-6">
        {/* Preview Area */}
        <div className="relative bg-black rounded-lg overflow-hidden h-[300px]">
          {isPreviewing ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <CameraOff className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Camera className="w-16 h-16" />
            </div>
          )}
          
          {/* Preview Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleVideo}
                className={cn(
                  "bg-black/50 text-white",
                  !isVideoEnabled && "bg-red-600"
                )}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleAudio}
                className={cn(
                  "bg-black/50 text-white",
                  !isAudioEnabled && "bg-red-600"
                )}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Button>
            </div>
            
            <Button
              onClick={isPreviewing ? stopPreview : startPreview}
              variant={isPreviewing ? "destructive" : "default"}
            >
              {isPreviewing ? 'Stop Preview' : 'Start Preview'}
            </Button>
          </div>
        </div>

        {/* Stream Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Stream Title *</label>
            <Input
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              placeholder="Enter your stream title..."
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input
              value={streamDescription}
              onChange={(e) => setStreamDescription(e.target.value)}
              placeholder="Tell viewers what your stream is about..."
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.value as any)}
                  className="flex flex-col items-start p-4 h-auto"
                >
                  <span className="font-medium">{category.label}</span>
                  <span className="text-xs opacity-70">{category.description}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
            <Input
              value={streamTags}
              onChange={(e) => setStreamTags(e.target.value)}
              placeholder="hiphop, freestyle, battle, cypher..."
              className="w-full"
            />
          </div>
        </div>

        {/* Start Stream Button */}
        <Button
          onClick={startStream}
          disabled={!streamTitle.trim()}
          className="w-full bg-red-600 hover:bg-red-700 text-lg py-3"
        >
          <Play className="w-5 h-5 mr-2" />
          Go Live
        </Button>
      </div>
    </div>
  )
}
