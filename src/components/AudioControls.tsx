'use client'

import * as React from 'react'
const { useState, useEffect, useRef } = React
import { useAudio } from '@/contexts/AudioContext'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff,
  Settings,
  Headphones
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioControlsProps {
  className?: string
  showAdvanced?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function AudioControls({ className, showAdvanced = false, size = 'md' }: AudioControlsProps) {
  const { 
    audioState, 
    togglePlay, 
    setVolume, 
    toggleMute,
    startMicrophone,
    stopMicrophone,
    getMicrophoneStream,
    audioEffects,
    setAudioEffects
  } = useAudio()

  const [isMicActive, setIsMicActive] = useState<boolean>(false)
  const [showEffects, setShowEffects] = useState<boolean>(false)

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100)
  }

  const toggleMicrophone = async () => {
    if (isMicActive) {
      stopMicrophone()
      setIsMicActive(false)
    } else {
      const stream = await startMicrophone()
      setIsMicActive(!!stream)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
  const buttonSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'

  return (
    <div className={cn('flex items-center gap-2 bg-black/50 rounded-lg p-2', className)}>
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className={cn('text-white hover:bg-white/20', buttonSize)}
      >
        {audioState.isPlaying ? (
          <Pause className={iconSize} />
        ) : (
          <Play className={iconSize} />
        )}
      </Button>

      {/* Time Display */}
      {size !== 'sm' && (
        <div className="text-white text-sm font-mono min-w-[80px]">
          {formatTime(audioState.currentTime)} / {formatTime(audioState.duration)}
        </div>
      )}

      {/* Volume Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className={cn('text-white hover:bg-white/20', buttonSize)}
        >
          {audioState.isMuted ? (
            <VolumeX className={iconSize} />
          ) : (
            <Volume2 className={iconSize} />
          )}
        </Button>
        
        {size !== 'sm' && (
          <Slider
            value={[audioState.isMuted ? 0 : audioState.volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-20"
          />
        )}
      </div>

      {/* Microphone Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMicrophone}
        className={cn(
          'text-white hover:bg-white/20',
          buttonSize,
          isMicActive && 'bg-red-600 hover:bg-red-700'
        )}
      >
        {isMicActive ? (
          <Mic className={iconSize} />
        ) : (
          <MicOff className={iconSize} />
        )}
      </Button>

      {/* Advanced Controls */}
      {showAdvanced && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEffects(!showEffects)}
            className={cn('text-white hover:bg-white/20', buttonSize)}
          >
            <Settings className={iconSize} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={cn('text-white hover:bg-white/20', buttonSize)}
          >
            <Headphones className={iconSize} />
          </Button>
        </>
      )}

      {/* Audio Effects Panel */}
      {showEffects && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-black/90 rounded-lg border border-white/20 min-w-[300px] z-50">
          <h3 className="text-white font-semibold mb-3">Audio Effects</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-white text-sm mb-1 block">Reverb</label>
              <Slider
                value={[audioEffects.reverb]}
                onValueChange={(value) => setAudioEffects({ ...audioEffects, reverb: value[0] })}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white text-sm mb-1 block">Echo</label>
              <Slider
                value={[audioEffects.echo]}
                onValueChange={(value) => setAudioEffects({ ...audioEffects, echo: value[0] })}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white text-sm mb-1 block">Bass Boost</label>
              <Slider
                value={[audioEffects.bassBoost]}
                onValueChange={(value) => setAudioEffects({ ...audioEffects, bassBoost: value[0] })}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-white text-sm mb-1 block">Treble Boost</label>
              <Slider
                value={[audioEffects.trebleBoost]}
                onValueChange={(value) => setAudioEffects({ ...audioEffects, trebleBoost: value[0] })}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoTune"
                checked={audioEffects.autoTune}
                onChange={(e) => setAudioEffects({ ...audioEffects, autoTune: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="autoTune" className="text-white text-sm">Auto-Tune</label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="noiseReduction"
                checked={audioEffects.noiseReduction}
                onChange={(e) => setAudioEffects({ ...audioEffects, noiseReduction: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="noiseReduction" className="text-white text-sm">Noise Reduction</label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
