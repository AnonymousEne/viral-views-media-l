'use client'

import { useState, useRef } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, storage, db } from '@/lib/firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { Upload, Video, X, Play, Pause, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MediaUploadProps {
  onUploadComplete?: (videoId: string, videoData: any) => void
  category?: string
}

export default function MediaUpload({ 
  onUploadComplete,
  category = 'general'
}: MediaUploadProps) {
  const [user] = useAuthState(auth)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoDuration, setVideoDuration] = useState<number | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: '',
    category: category,
    privacy: 'public' as 'public' | 'private' | 'unlisted'
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Enhanced file validation for short videos
  const validateFile = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      setValidationError(null)
      
      // Size validation (max 50MB for short videos)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        setValidationError('File must be less than 50MB')
        resolve(false)
        return
      }

      // Type validation - only video files
      if (!file.type.startsWith('video/')) {
        setValidationError('Please select a video file (MP4, WebM, MOV)')
        resolve(false)
        return
      }

      // Supported formats
      const supportedFormats = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime']
      if (!supportedFormats.includes(file.type)) {
        setValidationError('Supported formats: MP4, WebM, MOV')
        resolve(false)
        return
      }

      // Duration validation - create temporary video element
      const tempVideo = document.createElement('video')
      const tempUrl = URL.createObjectURL(file)
      
      tempVideo.addEventListener('loadedmetadata', () => {
        const duration = tempVideo.duration
        setVideoDuration(duration)
        
        URL.revokeObjectURL(tempUrl)
        
        if (duration > 60) {
          setValidationError('Video must be 60 seconds or less for short videos')
          resolve(false)
          return
        }
        
        if (duration < 1) {
          setValidationError('Video must be at least 1 second long')
          resolve(false)
          return
        }
        
        resolve(true)
      })

      tempVideo.addEventListener('error', () => {
        URL.revokeObjectURL(tempUrl)
        setValidationError('Unable to process video file')
        resolve(false)
      })

      tempVideo.src = tempUrl
    })
  }

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    const isValid = await validateFile(selectedFile)
    if (!isValid) return

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

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Handle upload
  const handleUpload = async () => {
    if (!file || !user) return

    if (!metadata.title.trim()) {
      setValidationError('Please enter a title')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create storage reference - save under videos/userId/
      const timestamp = Date.now()
      const sanitizedTitle = metadata.title.replace(/[^a-zA-Z0-9]/g, '_')
      const fileExtension = file.name.split('.').pop()
      const fileName = `${sanitizedTitle}_${timestamp}.${fileExtension}`
      
      const storageRef = ref(storage, `videos/${user.uid}/${fileName}`)

      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error('Upload error:', error)
          setValidationError('Upload failed. Please try again.')
          setIsUploading(false)
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

          // Create video document in Firestore
          const videoData = {
            userId: user.uid,
            title: metadata.title.trim(),
            description: metadata.description.trim(),
            url: downloadURL,
            duration: videoDuration || 0,
            category: metadata.category,
            tags: metadata.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
            privacy: metadata.privacy,
            likes: 0,
            comments: 0,
            views: 0,
            processed: true, // In a real app, this would be false until video processing is complete
            uploadedAt: serverTimestamp(),
          }

          const docRef = await addDoc(collection(db, 'videos'), videoData)

          // Clean up
          if (preview) {
            URL.revokeObjectURL(preview)
          }
          setFile(null)
          setPreview(null)
          setIsUploading(false)
          setUploadProgress(0)
          setValidationError(null)
          setMetadata({
            title: '',
            description: '',
            tags: '',
            category: category,
            privacy: 'public'
          })

          onUploadComplete?.(docRef.id, { ...videoData, id: docRef.id })
        }
      )
    } catch (error) {
      console.error('Error uploading video:', error)
      setValidationError('Failed to upload video. Please try again.')
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setPreview(null)
    setValidationError(null)
    setVideoDuration(null)
    setMetadata({
      title: '',
      description: '',
      tags: '',
      category: category,
      privacy: 'public'
    })
  }

  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">Please sign in to upload videos</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Upload Short Video</h2>
        <p className="text-gray-600">Share your creativity with videos up to 60 seconds</p>
      </div>

      {/* Upload Area */}
      {!file && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/mov,video/quicktime"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload your video</h3>
          <p className="text-gray-600 mb-4">
            MP4, WebM, or MOV files up to 50MB and 60 seconds
          </p>
          
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Choose Video
          </Button>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{validationError}</p>
        </div>
      )}

      {/* File Preview */}
      {file && preview && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={preview}
              className="w-full h-64 object-contain"
              muted
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onClick={handlePlayPause}
            />
            
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 h-12 w-12"
                  onClick={handlePlayPause}
                >
                  <Play className="h-6 w-6" />
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Video Info */}
          {videoDuration && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Duration: {Math.round(videoDuration)}s
              {videoDuration <= 60 && <span className="text-green-600">(✓ Valid for short videos)</span>}
            </div>
          )}

          {/* Metadata Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Give your video a catchy title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your video..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <input
                type="text"
                value={metadata.tags}
                onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="dance, music, art (comma separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Privacy</label>
              <select
                value={metadata.privacy}
                onChange={(e) => setMetadata(prev => ({ ...prev, privacy: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleUpload}
              disabled={isUploading || !metadata.title.trim()}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <span className="mr-2">Uploading... {Math.round(uploadProgress)}%</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
              Cancel
            </Button>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
      
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
