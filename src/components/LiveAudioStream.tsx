'use client'

import { useState, useEffect, useRef } from 'react'
import { useAudio } from '@/contexts/AudioContext'
import { AudioControls } from '@/components/AudioControls'
import { Button } from '@/components/ui/button'
import { 
  Mic, 
  MicOff, 
  Radio,
  Headphones,
  Users,
  Volume2,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LiveAudioStreamProps {
  streamId: string
  isStreamer?: boolean
  className?: string
}

interface AudioMetrics {
  volume: number
  frequency: number
  quality: string
  listeners: number
}

export function LiveAudioStream({ streamId, isStreamer = false, className }: LiveAudioStreamProps) {
  const { 
    startMicrophone, 
    stopMicrophone, 
    getMicrophoneStream,
    audioEffects,
    setAudioEffects
  } = useAudio()

  const [isLive, setIsLive] = useState<boolean>(false)
  const [audioMetrics, setAudioMetrics] = useState<AudioMetrics>({
    volume: 0,
    frequency: 0,
    quality: 'HD',
    listeners: 0
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationRef = useRef<number | null>(null)

  // Initialize audio analysis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioContextClass()
      } catch (error) {
        console.warn('Web Audio API not supported:', error)
      }
    }
  }, [])

  // Start live streaming
  const startLiveStream = async () => {
    try {
      const stream = await startMicrophone()
      if (!stream || !audioContextRef.current) return

      // Create audio analysis
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      
      const bufferLength = analyserRef.current.frequencyBinCount
      dataArrayRef.current = new Uint8Array(bufferLength)
      
      source.connect(analyserRef.current)
      
      setIsLive(true)
      startAudioAnalysis()
      
      console.log('Live audio stream started for:', streamId)
    } catch (error) {
      console.error('Failed to start live stream:', error)
    }
  }

  // Stop live streaming
  const stopLiveStream = () => {
    stopMicrophone()
    setIsLive(false)
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    
    console.log('Live audio stream stopped for:', streamId)
  }

  // Analyze audio in real-time
  const startAudioAnalysis = () => {
    if (!analyserRef.current || !dataArrayRef.current) return

    const analyze = () => {
      analyserRef.current!.getByteFrequencyData(dataArrayRef.current!)
      
      // Calculate volume (RMS)
      let sum = 0
      for (let i = 0; i < dataArrayRef.current!.length; i++) {
        sum += dataArrayRef.current![i] * dataArrayRef.current![i]
      }
      const volume = Math.sqrt(sum / dataArrayRef.current!.length) / 255

      // Find dominant frequency
      let maxIndex = 0
      let maxValue = 0
      for (let i = 0; i < dataArrayRef.current!.length; i++) {
        if (dataArrayRef.current![i] > maxValue) {
          maxValue = dataArrayRef.current![i]
          maxIndex = i
        }
      }
      const frequency = (maxIndex * audioContextRef.current!.sampleRate) / (2 * dataArrayRef.current!.length)

      setAudioMetrics(prev => ({
        ...prev,
        volume: volume * 100,
        frequency: Math.round(frequency),
        listeners: prev.listeners + Math.random() * 2 - 1 // Simulate listener changes
      }))

      animationRef.current = requestAnimationFrame(analyze)
    }

    analyze()
  }

  // Audio visualizer bars
  const renderVisualizer = () => {
    if (!dataArrayRef.current) return null

    const bars = []
    const barCount = 20
    const step = Math.floor(dataArrayRef.current.length / barCount)

    for (let i = 0; i < barCount; i++) {
      const value = dataArrayRef.current[i * step] || 0
      const height = (value / 255) * 100

      bars.push(
        <div
          key={i}
          className="bg-gradient-to-t from-green-500 to-green-300 w-2 transition-all duration-75"
          style={{ height: `${Math.max(height, 2)}%` }}
        />
      )
    }

    return bars
  }

  return (
    <div className={cn('bg-gray-900 rounded-lg p-4 space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className={cn('w-5 h-5', isLive ? 'text-red-500' : 'text-gray-400')} />
          <span className="text-white font-semibold">
            {isStreamer ? 'Live Audio Stream' : 'Listening'}
          </span>
          {isLive && (
            <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
              LIVE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Users className="w-4 h-4" />
          <span>{Math.round(audioMetrics.listeners)}</span>
        </div>
      </div>

      {/* Audio Visualizer */}
      <div className="bg-black rounded-lg p-4">
        <div className="flex items-end justify-center gap-1 h-20">
          {isLive ? renderVisualizer() : (
            <div className="text-gray-500 text-center">
              {isStreamer ? 'Start streaming to see audio levels' : 'No audio stream'}
            </div>
          )}
        </div>
      </div>

      {/* Audio Metrics */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-black/50 rounded-lg p-2">
          <div className="text-white font-bold">{Math.round(audioMetrics.volume)}%</div>
          <div className="text-gray-400 text-xs">Volume</div>
        </div>
        <div className="bg-black/50 rounded-lg p-2">
          <div className="text-white font-bold">{audioMetrics.frequency}Hz</div>
          <div className="text-gray-400 text-xs">Frequency</div>
        </div>
        <div className="bg-black/50 rounded-lg p-2">
          <div className="text-white font-bold">{audioMetrics.quality}</div>
          <div className="text-gray-400 text-xs">Quality</div>
        </div>
      </div>

      {/* Controls */}
      {isStreamer && (
        <div className="flex items-center justify-between">
          <Button
            onClick={isLive ? stopLiveStream : startLiveStream}
            className={cn(
              'flex items-center gap-2',
              isLive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            )}
          >
            {isLive ? (
              <>
                <MicOff className="w-4 h-4" />
                Stop Stream
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Go Live
              </>
            )}
          </Button>

          <AudioControls size="sm" showAdvanced={true} />
        </div>
      )}

      {/* Listener Controls */}
      {!isStreamer && (
        <AudioControls size="md" className="justify-center" />
      )}
    </div>
  )
}
