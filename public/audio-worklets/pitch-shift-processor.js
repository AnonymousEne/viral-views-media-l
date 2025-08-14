// Pitch shift audio worklet processor
class PitchShiftProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    
    this.enabled = false
    this.semitones = 0
    
    // Circular buffer for pitch shifting
    this.bufferSize = 4096
    this.buffer = new Float32Array(this.bufferSize)
    this.writeIndex = 0
    this.readIndex = 0
    
    // Crossfade variables
    this.crossfadeLength = 512
    this.grainSize = 2048
    
    this.port.onmessage = (event) => {
      const { type, ...params } = event.data
      if (type === 'pitchShift') {
        Object.assign(this, params)
        this.updatePitchShift()
      }
    }
  }
  
  updatePitchShift() {
    if (this.semitones !== 0) {
      // Calculate playback rate for pitch shifting
      const pitchRatio = Math.pow(2, this.semitones / 12)
      this.playbackRate = pitchRatio
    } else {
      this.playbackRate = 1
    }
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0]
    const output = outputs[0]
    
    if (!input || !input[0] || !this.enabled || this.semitones === 0) {
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
      // Write to circular buffer
      this.buffer[this.writeIndex] = inputChannel[i]
      this.writeIndex = (this.writeIndex + 1) % this.bufferSize
      
      // Read with pitch shift
      outputChannel[i] = this.readWithPitchShift()
    }
    
    return true
  }
  
  readWithPitchShift() {
    if (!this.playbackRate || this.playbackRate === 1) {
      const sample = this.buffer[this.readIndex]
      this.readIndex = (this.readIndex + 1) % this.bufferSize
      return sample
    }
    
    // Simple linear interpolation for pitch shifting
    const floatIndex = this.readIndex
    const intIndex = Math.floor(floatIndex)
    const fraction = floatIndex - intIndex
    
    const sample1 = this.buffer[intIndex % this.bufferSize]
    const sample2 = this.buffer[(intIndex + 1) % this.bufferSize]
    
    const interpolated = sample1 + fraction * (sample2 - sample1)
    
    // Advance read position by playback rate
    this.readIndex += this.playbackRate
    if (this.readIndex >= this.bufferSize) {
      this.readIndex -= this.bufferSize
    }
    
    return interpolated
  }
}

registerProcessor('pitch-shift-processor', PitchShiftProcessor)
