'use client'

import { useState, useRef } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { Heart, MessageCircle, Share, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Video, VideoComment, User } from '@/types/firebase'
import { Button } from '@/components/ui/button'

interface VideoPostProps {
  video: Video
  user: User
  isVisible?: boolean
  onLike?: (videoId: string, liked: boolean) => void
  onComment?: (videoId: string, comment: string) => void
  onShare?: (videoId: string) => void
}

export default function VideoPost({ 
  video, 
  user, 
  isVisible = true,
  onLike,
  onComment,
  onShare 
}: VideoPostProps) {
  const [firebaseUser] = useAuthState(auth)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [likeCount, setLikeCount] = useState(video.likes)
  const [commentCount, setCommentCount] = useState(video.comments)
  
  const videoRef = useRef<HTMLVideoElement>(null)

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

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleLike = async () => {
    if (!firebaseUser) return

    try {
      const newLiked = !isLiked
      setIsLiked(newLiked)
      setLikeCount(prev => newLiked ? prev + 1 : prev - 1)

      // Update video likes count
      const videoRef = doc(db, 'videos', video.id)
      await updateDoc(videoRef, {
        likes: increment(newLiked ? 1 : -1)
      })

      // Add or remove like document
      if (newLiked) {
        await addDoc(collection(db, 'video_likes'), {
          videoId: video.id,
          userId: firebaseUser.uid,
          createdAt: serverTimestamp()
        })
      }
      // TODO: Remove like document if unliked

      onLike?.(video.id, newLiked)
    } catch (error) {
      console.error('Error handling like:', error)
      // Revert optimistic update
      setIsLiked(!isLiked)
      setLikeCount(prev => isLiked ? prev + 1 : prev - 1)
    }
  }

  const handleComment = async () => {
    if (!firebaseUser || !newComment.trim()) return

    try {
      await addDoc(collection(db, 'video_comments'), {
        videoId: video.id,
        userId: firebaseUser.uid,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        content: newComment.trim(),
        likes: 0,
        createdAt: serverTimestamp()
      })

      // Update video comments count
      const videoRefDoc = doc(db, 'videos', video.id)
      await updateDoc(videoRefDoc, {
        comments: increment(1)
      })

      setCommentCount(prev => prev + 1)
      setNewComment('')
      onComment?.(video.id, newComment.trim())
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: `${window.location.origin}/video/${video.id}`,
      })
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/video/${video.id}`)
    }
    onShare?.(video.id)
  }

  return (
    <div className="relative w-full max-w-md mx-auto bg-black rounded-lg overflow-hidden">
      {/* Video */}
      <div className="relative aspect-[9/16] bg-gray-900">
        <video
          ref={videoRef}
          src={video.url}
          className="w-full h-full object-cover"
          muted={isMuted}
          loop
          playsInline
          onClick={handlePlayPause}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Play/Pause overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/30 hover:bg-black/50 text-white rounded-full p-4 h-16 w-16"
              onClick={handlePlayPause}
            >
              <Play className="h-8 w-8" />
            </Button>
          </div>
        )}

        {/* Video controls */}
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={handleMute}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>

        {/* Video info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-start gap-3">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.displayName}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">@{user.username}</h3>
              <p className="text-white text-sm mt-1 line-clamp-2">{video.title}</p>
              {video.description && (
                <p className="text-gray-300 text-sm mt-1 line-clamp-2">{video.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute right-4 bottom-20 flex flex-col gap-4">
        {/* Like */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className={`bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors ${
              isLiked ? 'text-red-500' : 'text-white'
            }`}
            onClick={handleLike}
          >
            <Heart className={`h-6 w-6 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
          <span className="text-white text-xs mt-1">{likeCount}</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
          <span className="text-white text-xs mt-1">{commentCount}</span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={handleShare}
          >
            <Share className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Comments panel */}
      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg max-h-64 overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Comments</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-32">
            {/* TODO: Load and display actual comments */}
            <div className="text-gray-500 text-sm text-center">
              No comments yet. Be the first to comment!
            </div>
          </div>

          {/* Add comment */}
          {firebaseUser && (
            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                />
                <Button
                  onClick={handleComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 text-sm"
                >
                  Post
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}