'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAudio } from '@/contexts/AudioContext'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Settings,
  Circle,
  Square
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MicrophoneInputProps {
  onStartRecording?: () => void
  onStopRecording?: (audioBlob: Blob) => void
  showVisualizer?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function MicrophoneInput({
  onStartRecording,
  onStopRecording,
  showVisualizer = true,
  className,
  size = 'md'
}: MicrophoneInputProps) {
  const {
    isMicEnabled,
    toggleMicrophone,
    getAudioLevel,
    isRecording,
    startRecording,
    stopRecording,
    microphoneStream
  } = useAudio()

  const [audioLevel, setAudioLevel] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [showSettings, setShowSettings] = useState(false)

  const animationFrameRef = useRef<number>()
  const recordingIntervalRef = useRef<number>()

  // Get available audio input devices
  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = devices.filter(device => device.kind === 'audioinput')
        setAudioDevices(audioInputs)
        
        if (audioInputs.length > 0 && !selectedDevice) {
          setSelectedDevice(audioInputs[0].deviceId)
        }
      } catch (error) {
        console.error('Error getting audio devices:', error)
      }
    }

    getAudioDevices()
  }, [selectedDevice])

  // Audio level monitoring
  useEffect(() => {
    if (isMicEnabled && showVisualizer) {
      const updateAudioLevel = () => {
        const level = getAudioLevel()
        setAudioLevel(level)
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
      }
      updateAudioLevel()
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isMicEnabled, showVisualizer, getAudioLevel])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0)
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  const handleToggleMicrophone = useCallback(async () => {
    setIsProcessing(true)
    try {
      await toggleMicrophone()
    } finally {
      setIsProcessing(false)
    }
  }, [toggleMicrophone])

  const handleStartRecording = useCallback(async () => {
    if (!isMicEnabled) {
      await handleToggleMicrophone()
    }
    
    try {
      await startRecording()
      onStartRecording?.()
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }, [isMicEnabled, startRecording, onStartRecording, handleToggleMicrophone])

  const handleStopRecording = useCallback(() => {
    const audioBlobs = stopRecording()
    if (audioBlobs.length > 0 && onStopRecording) {
      const audioBlob = new Blob(audioBlobs, { type: 'audio/webm' })
      onStopRecording(audioBlob)
    }
  }, [stopRecording, onStopRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Microphone Toggle Button */}
      <Button
        variant={isMicEnabled ? "default" : "outline"}
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
        onClick={handleToggleMicrophone}
        disabled={isProcessing}
        className={cn(
          "relative transition-all",
          sizeClasses[size],
          isMicEnabled && "bg-green-600 hover:bg-green-700"
        )}
      >
        {isMicEnabled ? (
          <Mic className={cn("w-4 h-4", size === 'lg' && "w-6 h-6")} />
        ) : (
          <MicOff className={cn("w-4 h-4", size === 'lg' && "w-6 h-6")} />
        )}
        
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-spin" />
        )}
      </Button>

      {/* Audio Level Visualizer */}
      {showVisualizer && isMicEnabled && (
        <div className="flex items-center gap-1">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-1 rounded-full transition-all duration-100",
                size === 'sm' ? 'h-4' : size === 'lg' ? 'h-8' : 'h-6',
                audioLevel * 8 > i 
                  ? audioLevel > 0.7 
                    ? "bg-red-500" 
                    : audioLevel > 0.4 
                    ? "bg-yellow-500" 
                    : "bg-green-500"
                  : "bg-gray-300 dark:bg-gray-600"
              )}
              style={{
                height: audioLevel * 8 > i 
                  ? `${Math.max(4, audioLevel * (size === 'lg' ? 32 : size === 'sm' ? 16 : 24))}px`
                  : undefined
              }}
            />
          ))}
        </div>
      )}

      {/* Recording Controls */}
      {isMicEnabled && (
        <div className="flex items-center gap-2">
          <Button
            variant={isRecording ? "destructive" : "default"}
            size="sm"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className="flex items-center gap-1"
          >
            {isRecording ? (
              <>
                <Square className="w-3 h-3" />
                Stop
              </>
            ) : (
              <>
                <Circle className="w-3 h-3 fill-current" />
                Record
              </>
            )}
          </Button>

          {/* Recording Timer */}
          {isRecording && (
            <div className="text-sm font-mono text-red-500 flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {formatTime(recordingTime)}
            </div>
          )}
        </div>
      )}

      {/* Settings Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSettings(!showSettings)}
        className="opacity-50 hover:opacity-100"
      >
        <Settings className="w-4 h-4" />
      </Button>

      {/* Audio Device Settings */}
      {showSettings && audioDevices.length > 1 && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-background border rounded-lg shadow-lg z-10 min-w-[200px]">
          <div className="text-sm font-medium mb-2">Audio Input Device</div>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full p-2 border rounded text-sm"
          >
            {audioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
