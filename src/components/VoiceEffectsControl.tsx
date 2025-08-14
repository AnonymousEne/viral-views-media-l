import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

// Utility: Simple pitch detection using autocorrelation (for demo, not pro-grade)
function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  let bestOffset = -1
  let bestCorrelation = 0
  let rms = 0
  let foundGoodCorrelation = false
  let correlations = new Array(1024).fill(0)
  for (let i = 0; i < buffer.length; i++) {
    rms += buffer[i] * buffer[i]
  }
  rms = Math.sqrt(rms / buffer.length)
  if (rms < 0.01) return null // too quiet
  let lastCorrelation = 1
  for (let offset = 32; offset < 1024; offset++) {
    let correlation = 0
    for (let i = 0; i < 1024; i++) {
      correlation += Math.abs(buffer[i] - buffer[i + offset] || 0)
    }
    correlation = 1 - correlation / 1024
    correlations[offset] = correlation
    if (correlation > 0.9 && correlation > lastCorrelation) {
      foundGoodCorrelation = true
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation
        bestOffset = offset
      }
    } else if (foundGoodCorrelation) {
      break
    }
    lastCorrelation = correlation
  }
  if (bestCorrelation > 0.01) {
    return sampleRate / bestOffset
  }
  return null
}

// Utility: Map frequency to musical note
function freqToNote(freq: number): { note: string, cents: number } {
  const noteStrings = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const A4 = 440
  const n = 12 * Math.log2(freq / A4)
  const noteIndex = Math.round(n) + 57 // 57 = A4
  const note = noteStrings[(noteIndex + 12) % 12]
  const cents = Math.floor((n - Math.round(n)) * 100)
  return { note, cents }
}

// Simple pitch correction (snap to nearest note)
function pitchCorrect(freq: number): number {
  const A4 = 440
  const n = Math.round(12 * Math.log2(freq / A4))
  return A4 * Math.pow(2, n / 12)
}

export function VoiceEffectsControl() {
  const [enabled, setEnabled] = useState(false)
  const [detectedNote, setDetectedNote] = useState<string>('')
  const [detectedFreq, setDetectedFreq] = useState<number | null>(null)
  const [correctionStrength, setCorrectionStrength] = useState(1)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!enabled) {
      // Cleanup
      processorRef.current?.disconnect()
      sourceRef.current?.disconnect()
      audioContextRef.current?.close()
  streamRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      setDetectedNote('')
      setDetectedFreq(null)
      return
    }
    let cancelled = false
    async function setup() {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const audioCtx = new window.AudioContext()
      audioContextRef.current = audioCtx
      const source = audioCtx.createMediaStreamSource(stream)
      sourceRef.current = source
      const processor = audioCtx.createScriptProcessor(2048, 1, 1)
      processorRef.current = processor
      source.connect(processor)
      processor.connect(audioCtx.destination)
      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0)
        const freq = detectPitch(input, audioCtx.sampleRate)
        if (freq) {
          const { note, cents } = freqToNote(freq)
          setDetectedNote(`${note} ${cents >= 0 ? '+' : ''}${cents}c`)
          setDetectedFreq(freq)
        } else {
          setDetectedNote('')
          setDetectedFreq(null)
        }
        // Simple pitch correction (demo only)
        if (correctionStrength > 0 && freq) {
          // In a real app, use a WASM DSP or AudioWorklet for real-time pitch shifting
          // Here, we just display the correction target
        }
      }
    }
    setup()
    return () => {
      cancelled = true
      processorRef.current?.disconnect()
      sourceRef.current?.disconnect()
      audioContextRef.current?.close()
  streamRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop())
    }
  }, [enabled, correctionStrength])

  return (
    <div className="p-4 bg-card rounded-lg shadow-md max-w-md mx-auto mt-6">
      <h2 className="text-lg font-bold mb-2">Voice Effects (Auto-Tune & Key Detector)</h2>
      <div className="flex items-center gap-4 mb-4">
        <Button onClick={() => setEnabled((prev: boolean) => !prev)} variant={enabled ? 'default' : 'outline'}>
          {enabled ? 'Disable' : 'Enable'}
        </Button>
        <span className="text-sm text-muted-foreground">{enabled ? 'Mic Active' : 'Mic Off'}</span>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Pitch Correction Strength</label>
        <Slider min={0} max={1} step={0.1} value={[correctionStrength]} onValueChange={([v]) => setCorrectionStrength(v)} />
        <div className="text-xs text-muted-foreground mt-1">{Math.round(correctionStrength * 100)}% correction</div>
      </div>
      <div className="mb-2">
        <span className="font-semibold">Detected Key:</span>{' '}
        <span className="text-primary font-mono">{detectedNote || '—'}</span>
        {detectedFreq && (
          <span className="ml-2 text-xs text-muted-foreground">({detectedFreq.toFixed(1)} Hz)</span>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        * This is a demo. For pro-grade auto-tune, use a WASM DSP or AudioWorklet.
      </div>
    </div>
  )
}
