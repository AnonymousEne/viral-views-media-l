'use client'

import { useState, useRef } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, storage, db } from '@/lib/firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { Upload, Video, Music, X, Play, Pause } from 'lucide-react'

interface MediaUploadProps {
  onUploadComplete?: (url: string, metadata: any) => void
  type?: 'video' | 'audio'
  category?: 'battle' | 'freestyle' | 'cypher' | 'showcase'
}

export default function MediaUpload({ 
  onUploadComplete, 
  type = 'video', 
  category = 'freestyle' 
}: MediaUploadProps) {
  const [user] = useAuthState(auth)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: '',
    category: category,
    isPublic: true
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // File validation
  const validateFile = (file: File): boolean => {
    const maxSize = 100 * 1024 * 1024 // 100MB
    
    if (file.size > maxSize) {
      alert('File must be less than 100MB')
      return false
    }

    if (type === 'video' && !file.type.startsWith('video/')) {
      alert('Please select a video file')
      return false
    }

    if (type === 'audio' && !file.type.startsWith('audio/')) {
      alert('Please select an audio file')
      return false
    }

    return true
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!validateFile(selectedFile)) return

    setFile(selectedFile)
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(selectedFile)
    setPreview(previewUrl)

    // Auto-fill title from filename
    const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '')
    setMetadata(prev => ({
      ...prev,
      title: prev.title || nameWithoutExtension
    }))
  }

  // Handle upload
  const handleUpload = async () => {
    if (!file || !user) return

    if (!metadata.title.trim()) {
      alert('Please enter a title')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create storage reference
      const timestamp = Date.now()
      const sanitizedTitle = metadata.title.replace(/[^a-zA-Z0-9]/g, '_')
      const fileExtension = file.name.split('.').pop()
      const fileName = `${sanitizedTitle}_${timestamp}.${fileExtension}`
      
      const storageRef = ref(storage, `media/${type}s/${user.uid}/${fileName}`)
      
      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          alert('Upload failed. Please try again.')
          setIsUploading(false)
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            
            // Save metadata to Firestore
            const mediaDoc = {
              title: metadata.title,
              description: metadata.description,
              tags: metadata.tags.split(',').map(tag => tag.trim()).filter(Boolean),
              category: metadata.category,
              type: type,
              url: downloadURL,
              fileName: fileName,
              fileSize: file.size,
              mimeType: file.type,
              duration: 0, // TODO: Extract actual duration
              userId: user.uid,
              userDisplayName: user.displayName || 'Anonymous',
              userPhotoURL: user.photoURL || '',
              isPublic: metadata.isPublic,
              views: 0,
              likes: 0,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            }

            const docRef = await addDoc(collection(db, 'media'), mediaDoc)
            
            console.log('Media uploaded successfully:', docRef.id)
            
            // Reset form
            setFile(null)
            setPreview(null)
            setMetadata({
              title: '',
              description: '',
              tags: '',
              category: category,
              isPublic: true
            })
            setIsUploading(false)
            setUploadProgress(0)

            // Call completion callback
            onUploadComplete?.(downloadURL, { ...mediaDoc, id: docRef.id })

            alert('Upload successful! 🎉')
          } catch (error) {
            console.error('Error saving metadata:', error)
            alert('Upload completed but failed to save details. Please try again.')
            setIsUploading(false)
          }
        }
      )
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
      setIsUploading(false)
    }
  }

  // Handle preview play/pause
  const togglePreview = () => {
    if (type === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    } else if (type === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Clear selection
  const clearSelection = () => {
    setFile(null)
    setPreview(null)
    setIsPlaying(false)
    if (preview) {
      URL.revokeObjectURL(preview)
    }
  }

  if (!user) {
    return (
      <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
        <p className="text-white">Please sign in to upload media</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Upload {type === 'video' ? 'Video' : 'Audio'}
      </h2>

      {/* File Selection */}
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/30 rounded-xl p-12 text-center cursor-pointer hover:border-pink-400 hover:bg-white/5 transition-all"
        >
          {type === 'video' ? (
            <Video className="w-16 h-16 text-white/50 mx-auto mb-4" />
          ) : (
            <Music className="w-16 h-16 text-white/50 mx-auto mb-4" />
          )}
          <p className="text-white text-lg mb-2">
            Click to select {type === 'video' ? 'video' : 'audio'} file
          </p>
          <p className="text-gray-400 text-sm">
            Max size: 100MB • Formats: {type === 'video' ? 'MP4, MOV, AVI' : 'MP3, WAV, M4A'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Preview */}
          <div className="relative">
            {type === 'video' ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  src={preview || undefined}
                  className="w-full max-h-64 rounded-lg bg-black"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  controls
                />
                <button
                  onClick={togglePreview}
                  className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-center">
                <Music className="w-16 h-16 text-white mx-auto mb-4" />
                <p className="text-white font-semibold">{file.name}</p>
                <audio
                  ref={audioRef}
                  src={preview || undefined}
                  className="w-full mt-4"
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            )}
            
            <button
              onClick={clearSelection}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metadata Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Title *</label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a catchy title..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Description</label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your content..."
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 resize-none"
                disabled={isUploading}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Category</label>
                <select
                  value={metadata.category}
                  onChange={(e) => setMetadata(prev => ({ 
                    ...prev, 
                    category: e.target.value as 'battle' | 'freestyle' | 'cypher' | 'showcase'
                  }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  disabled={isUploading}
                >
                  <option value="freestyle">Freestyle</option>
                  <option value="battle">Battle</option>
                  <option value="cypher">Cypher</option>
                  <option value="showcase">Showcase</option>
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Tags</label>
                <input
                  type="text"
                  value={metadata.tags}
                  onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="hip-hop, rap, freestyle..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                  disabled={isUploading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={metadata.isPublic}
                onChange={(e) => setMetadata(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded border-white/20"
                disabled={isUploading}
              />
              <label htmlFor="isPublic" className="text-white">
                Make this content public
              </label>
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || !metadata.title.trim()}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:scale-100"
          >
            {isUploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Uploading... {Math.round(uploadProgress)}%</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Upload {type === 'video' ? 'Video' : 'Audio'}</span>
              </div>
            )}
          </button>

          {/* Progress Bar */}
          {isUploading && (
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={type === 'video' ? 'video/*' : 'audio/*'}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
