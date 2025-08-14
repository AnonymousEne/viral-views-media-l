// Auto-tune audio worklet processor
class AutotuneProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    
    this.enabled = false
    this.strength = 0.5
    this.key = 'C'
    this.scale = 'major'
    this.speed = 0.5
    
    // Pitch tracking variables
    this.pitchBuffer = new Float32Array(4096)
    this.bufferIndex = 0
    this.lastPitch = 440
    this.targetPitch = 440
    
    // Note frequencies (A4 = 440Hz)
    this.noteFreqs = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
      'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    }
    
    // Scale patterns
    this.scalePatterns = {
      major: [0, 2, 4, 5, 7, 9, 11],
      minor: [0, 2, 3, 5, 7, 8, 10]
    }
    
    // Listen for parameter changes
    this.port.onmessage = (event) => {
      const { type, ...params } = event.data
      if (type === 'autotune') {
        Object.assign(this, params)
      }
    }
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0]
    const output = outputs[0]
    
    if (!input || !input[0] || !this.enabled) {
      // Pass through if no input or disabled
      if (input && output) {
        for (let channel = 0; channel < Math.min(input.length, output.length); channel++) {
          output[channel].set(input[channel])
        }
      }
      return true
    }
    
    const inputChannel = input[0]
    const outputChannel = output[0]
    
    for (let i = 0; i < inputChannel.length; i++) {
      // Store sample in circular buffer for pitch detection
      this.pitchBuffer[this.bufferIndex] = inputChannel[i]
      this.bufferIndex = (this.bufferIndex + 1) % this.pitchBuffer.length
      
      // Detect pitch every 256 samples
      if (this.bufferIndex % 256 === 0) {
        this.detectPitch()
      }
      
      // Apply auto-tune correction
      outputChannel[i] = this.autoTunesample(inputChannel[i])
    }
    
    return true
  }
  
  detectPitch() {
    // Simple autocorrelation-based pitch detection
    const buffer = this.pitchBuffer
    const sampleRate = 44100 // Assume standard sample rate
    const minPeriod = Math.floor(sampleRate / 800) // Max 800Hz
    const maxPeriod = Math.floor(sampleRate / 80)  // Min 80Hz
    
    let bestCorrelation = 0
    let bestPeriod = 0
    
    for (let period = minPeriod; period < maxPeriod && period < buffer.length / 2; period++) {
      let correlation = 0
      for (let i = 0; i < buffer.length - period; i++) {
        correlation += buffer[i] * buffer[i + period]
      }
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation
        bestPeriod = period
      }
    }
    
    if (bestPeriod > 0) {
      const detectedFreq = sampleRate / bestPeriod
      this.lastPitch = detectedFreq
      this.targetPitch = this.getTargetPitch(detectedFreq)
    }
  }
  
  getTargetPitch(frequency) {
    // Find the closest note in the current key/scale
    const keyIndex = Object.keys(this.noteFreqs).indexOf(this.key)
    const pattern = this.scalePatterns[this.scale]
    
    let closestFreq = frequency
    let minDistance = Infinity
    
    // Check notes in multiple octaves
    for (let octave = 2; octave <= 6; octave++) {
      for (const interval of pattern) {
        const noteIndex = (keyIndex + interval) % 12
        const noteName = Object.keys(this.noteFreqs)[noteIndex]
        const baseFreq = this.noteFreqs[noteName]
        const octaveFreq = baseFreq * Math.pow(2, octave - 4)
        
        const distance = Math.abs(frequency - octaveFreq)
        if (distance < minDistance) {
          minDistance = distance
          closestFreq = octaveFreq
        }
      }
    }
    
    return closestFreq
  }
  
  autoTunesample(sample) {
    if (!this.enabled || this.lastPitch === 0) {
      return sample
    }
    
    // Calculate pitch correction ratio
    const pitchRatio = this.targetPitch / this.lastPitch
    const correctionAmount = (pitchRatio - 1) * this.strength
    
    // Apply smooth correction based on speed setting
    const smoothing = 1 - this.speed
    const finalRatio = 1 + correctionAmount * (1 - smoothing)
    
    // Simple pitch shifting by sample manipulation
    // In a real implementation, you'd use more sophisticated algorithms
    return sample * finalRatio
  }
}

registerProcessor('autotune-processor', AutotuneProcessor)
