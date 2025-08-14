'use client'

import { useState, useEffect, useRef } from 'react'
import { useAudio } from '@/contexts/AudioContext'
import { AudioControls } from '@/components/AudioControls'
import { LiveAudioStream } from '@/components/LiveAudioStream'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Mic,
  Camera,
  Radio
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoWithAudioProps {
  videoSrc?: string
  audioSrc?: string
  isLive?: boolean
  isStreamer?: boolean
  streamId?: string
  className?: string
  autoPlay?: boolean
  controls?: boolean
  enableMicrophone?: boolean
  enableCamera?: boolean
  muted?: boolean
  poster?: string
}

export function VideoWithAudio({ 
  videoSrc, 
  audioSrc, 
  isLive = false,
  isStreamer = false,
  streamId = '',
  className,
  autoPlay = false,
  controls = true,
  enableMicrophone = false,
  enableCamera = false,
  muted = false,
  poster
}: VideoWithAudioProps) {
  const { 
    loadAudio, 
    audioState, 
    isMicEnabled, 
    toggleMicrophone, 
    getAudioLevel,
    microphoneStream,
    startMicrophone,
    stopMicrophone 
  } = useAudio()
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [showControls, setShowControls] = useState<boolean>(true)
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [isCameraEnabled, setIsCameraEnabled] = useState<boolean>(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [volume, setVolume] = useState<number>(1)
  const [isMutedState, setIsMutedState] = useState<boolean>(muted)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<number | ReturnType<typeof setTimeout> | null>(null)

  // Camera control functions
  const startCamera = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        }
      }

      if (enableMicrophone) {
        constraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setCameraStream(stream)
      setIsCameraEnabled(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        if (autoPlay) {
          videoRef.current.play()
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setVideoError('Failed to access camera')
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      setCameraStream(null)
    }
    setIsCameraEnabled(false)
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
      if (videoSrc) {
        videoRef.current.src = videoSrc
      }
    }
  }

  const toggleCamera = () => {
    if (isCameraEnabled) {
      stopCamera()
    } else {
      startCamera()
    }
  }

  // Load audio when sources change
  useEffect(() => {
    if (audioSrc) {
      loadAudio(audioSrc)
    }
  }, [audioSrc, loadAudio])

  // Auto-hide controls in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      const hideControls = () => {
        setShowControls(false)
      }

      const showControlsTemporary = () => {
        setShowControls(true)
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current)
        }
        controlsTimeoutRef.current = setTimeout(hideControls, 3000)
      }

      const container = containerRef.current
      if (container) {
        container.addEventListener('mousemove', showControlsTemporary)
        container.addEventListener('touchstart', showControlsTemporary)
        
        return () => {
          container.removeEventListener('mousemove', showControlsTemporary)
          container.removeEventListener('touchstart', showControlsTemporary)
          if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
          }
        }
      }
    }
  }, [isFullscreen])

  // Video event handlers
  const handleVideoPlay = () => {
    setIsPlaying(true)
  }

  const handleVideoPause = () => {
    setIsPlaying(false)
  }

  const handleVideoLoadedData = () => {
    setIsVideoReady(true)
    setVideoError(null)
  }

  const handleVideoError = () => {
    setVideoError('Failed to load video')
    setIsVideoReady(false)
  }

  // Playback controls
  const togglePlayPause = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (isPlaying) {
        video.pause()
      } else {
        await video.play()
      }
    } catch (error) {
      console.error('Playback error:', error)
      setVideoError('Playback failed')
    }
  }

  // Fullscreen controls
  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen()
      } else if ((container as any).msRequestFullscreen) {
        (container as any).msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen()
      }
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-lg overflow-hidden',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay={autoPlay}
        onPlay={handleVideoPlay}
        onPause={handleVideoPause}
        onLoadedData={handleVideoLoadedData}
        onError={handleVideoError}
        className="w-full h-full object-cover"
        playsInline
      />

      {/* Live Audio Stream Overlay */}
      {isLive && (
        <div className="absolute top-4 right-4 z-10">
          <LiveAudioStream 
            streamId={streamId}
            isStreamer={isStreamer}
            className="w-80"
          />
        </div>
      )}

      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-lg">
            <Radio className="w-4 h-4 text-white animate-pulse" />
            <span className="text-white font-bold text-sm">LIVE</span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center text-white">
            <div className="text-xl font-semibold mb-2">Video Error</div>
            <div className="text-gray-300">{videoError}</div>
            <Button 
              onClick={() => {
                setVideoError(null)
                if (videoRef.current) {
                  videoRef.current.load()
                }
              }}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isVideoReady && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div>Loading video...</div>
          </div>
        </div>
      )}

      {/* Video Controls Overlay */}
      {controls && showControls && isVideoReady && (
        <div className="absolute inset-0 z-10">
          {/* Play/Pause Overlay */}
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer"
            onClick={togglePlayPause}
          >
            {!isPlaying && (
              <div className="bg-black/50 rounded-full p-4">
                <Play className="w-12 h-12 text-white" />
              </div>
            )}
          </div>

          {/* Bottom Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

                {/* Audio Controls */}
                <AudioControls size="sm" />
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                {isStreamer && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                    >
                      <Camera className="w-5 h-5" />
                    </Button>
                  </>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
