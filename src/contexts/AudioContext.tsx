'use client'

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

interface AudioState {
  isPlaying: boolean
  volume: number
  isMuted: boolean
  currentTime: number
  duration: number
  isLoading: boolean
}

interface AudioContextType {
  // Audio state
  audioState: AudioState
  
  // Audio controls
  play: () => Promise<void>
  pause: () => void
  togglePlay: () => Promise<void>
  setVolume: (volume: number) => void
  toggleMute: () => void
  seek: (time: number) => void
  
  // Audio source management
  loadAudio: (src: string) => void
  getCurrentAudio: () => HTMLAudioElement | null
  
  // Microphone & Recording
  isMicEnabled: boolean
  microphoneStream: MediaStream | null
  startMicrophone: () => Promise<MediaStream | null>
  stopMicrophone: () => void
  toggleMicrophone: () => Promise<void>
  getMicrophoneStream: () => MediaStream | null
  getAudioLevel: () => number
  isRecording: boolean
  startRecording: () => Promise<void>
  stopRecording: () => Blob[]
  
  // Audio effects
  setAudioEffects: (effects: AudioEffects) => void
  audioEffects: AudioEffects
}

interface AudioEffects {
  reverb: number
  echo: number
  bassBoost: number
  trebleBoost: number
  autoTune: boolean
  noiseReduction: boolean
}

const defaultAudioState: AudioState = {
  isPlaying: false,
  volume: 1.0,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  isLoading: false
}

const defaultAudioEffects: AudioEffects = {
  reverb: 0,
  echo: 0,
  bassBoost: 0,
  trebleBoost: 0,
  autoTune: false,
  noiseReduction: true
}

const AudioContext = createContext<AudioContextType | null>(null)

interface AudioProviderProps {
  children: ReactNode
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [audioState, setAudioState] = useState<AudioState>(defaultAudioState)
  const [audioEffects, setAudioEffects] = useState<AudioEffects>(defaultAudioEffects)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const microphoneStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  // Initialize Web Audio API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        audioContextRef.current = new AudioContextClass()
        gainNodeRef.current = audioContextRef.current.createGain()
        gainNodeRef.current.connect(audioContextRef.current.destination)
      } catch (error) {
        console.warn('Web Audio API not supported:', error)
      }
    }
  }, [])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadStart = () => {
      setAudioState(prev => ({ ...prev, isLoading: true }))
    }

    const handleLoadedData = () => {
      setAudioState(prev => ({ 
        ...prev, 
        isLoading: false,
        duration: audio.duration || 0
      }))
    }

    const handleTimeUpdate = () => {
      setAudioState(prev => ({ 
        ...prev, 
        currentTime: audio.currentTime || 0
      }))
    }

    const handlePlay = () => {
      setAudioState(prev => ({ ...prev, isPlaying: true }))
    }

    const handlePause = () => {
      setAudioState(prev => ({ ...prev, isPlaying: false }))
    }

    const handleVolumeChange = () => {
      setAudioState(prev => ({ 
        ...prev, 
        volume: audio.volume,
        isMuted: audio.muted
      }))
    }

    const handleError = (e: Event) => {
      console.error('Audio error:', e)
      setAudioState(prev => ({ ...prev, isLoading: false, isPlaying: false }))
    }

    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('volumechange', handleVolumeChange)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('volumechange', handleVolumeChange)
      audio.removeEventListener('error', handleError)
    }
  }, [audioRef.current])

  const loadAudio = (src: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    
    audioRef.current.src = src
    audioRef.current.preload = 'metadata'
  }

  const play = async (): Promise<void> => {
    if (!audioRef.current) return
    
    try {
      await audioRef.current.play()
    } catch (error) {
      console.error('Failed to play audio:', error)
    }
  }

  const pause = () => {
    if (!audioRef.current) return
    audioRef.current.pause()
  }

  const togglePlay = async (): Promise<void> => {
    if (audioState.isPlaying) {
      pause()
    } else {
      await play()
    }
  }

  const setVolume = (volume: number) => {
    if (!audioRef.current) return
    
    const clampedVolume = Math.max(0, Math.min(1, volume))
    audioRef.current.volume = clampedVolume
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = clampedVolume
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !audioRef.current.muted
  }

  const seek = (time: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, Math.min(audioState.duration, time))
  }

  const getCurrentAudio = (): HTMLAudioElement | null => {
    return audioRef.current
  }

  const startMicrophone = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: audioEffects.noiseReduction,
          noiseSuppression: audioEffects.noiseReduction,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 2
        }
      })
      
      microphoneStreamRef.current = stream
      return stream
    } catch (error) {
      console.error('Failed to access microphone:', error)
      return null
    }
  }

  const stopMicrophone = () => {
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop())
      microphoneStreamRef.current = null
    }
  }

  const getMicrophoneStream = (): MediaStream | null => {
    return microphoneStreamRef.current
  }

  // Apply audio effects (basic implementation)
  const applyAudioEffects = (effects: AudioEffects) => {
    if (!audioContextRef.current || !gainNodeRef.current) return

    try {
      // Basic volume adjustment based on effects
      const effectVolume = 1 + (effects.bassBoost + effects.trebleBoost) * 0.1
      gainNodeRef.current.gain.value = audioState.volume * effectVolume
    } catch (error) {
      console.warn('Failed to apply audio effects:', error)
    }
  }

  const handleSetAudioEffects = (effects: AudioEffects) => {
    setAudioEffects(effects)
    applyAudioEffects(effects)
  }

  // Apply effects when they change
  useEffect(() => {
    applyAudioEffects(audioEffects)
  }, [audioEffects, audioState.volume])

  // Microphone state
  const [isMicEnabled, setIsMicEnabled] = useState<boolean>(false)

  // Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const recordedChunks = useRef<Blob[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const toggleMicrophone = async () => {
    if (isMicEnabled) {
      stopMicrophone()
      setIsMicEnabled(false)
    } else {
      await startMicrophone()
      setIsMicEnabled(true)
    }
  }

  // Get audio level (simple RMS from microphone stream)
  const getAudioLevel = () => {
    const stream = microphoneStreamRef.current
    if (!stream) return 0
    // Simple stub: in production, use Web Audio API AnalyserNode for real RMS
    return 1 // Always return 1 for now
  }

  // Recording logic
  const startRecording = async () => {
    if (!microphoneStreamRef.current) {
      await startMicrophone()
    }
    if (microphoneStreamRef.current) {
      recordedChunks.current = []
      const mediaRecorder = new MediaRecorder(microphoneStreamRef.current)
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data)
      }
      mediaRecorder.onstop = () => {
        setIsRecording(false)
      }
      mediaRecorder.start()
      setIsRecording(true)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    return recordedChunks.current
  }

  const value: AudioContextType = {
    audioState,
    play,
    pause,
    togglePlay,
    setVolume,
    toggleMute,
    seek,
    loadAudio,
    getCurrentAudio,
    // Microphone & Recording
    isMicEnabled,
    microphoneStream: microphoneStreamRef.current,
    startMicrophone,
    stopMicrophone,
    toggleMicrophone,
    getMicrophoneStream,
    getAudioLevel,
    isRecording,
    startRecording,
    stopRecording,
    // Audio effects
    setAudioEffects: handleSetAudioEffects,
    audioEffects
  }

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}

export type { AudioEffects, AudioState }
