'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useMessaging } from '@/hooks/useMessaging'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, ChevronLeft, Image as ImageIcon, Film, X } from 'lucide-react'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { MediaMessageContent } from '@/components/MediaMessageContent'
import type { MediaMessage } from '@/types/messages'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Message, Conversation } from '@/types/messages'

export function MessengerWindow() {
  const { user } = useAuth()
  const {
    conversations,
    messages,
    loading,
    activeConversation,
    setActiveConversation,
    sendMessage,
    markAsRead
  } = useMessaging()
  const [mediaToUpload, setMediaToUpload] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.match(/^(image|video)\//)) {
      alert('Please select an image or video file')
      return
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      alert('File size must be less than 100MB')
      return
    }

    setMediaToUpload(file)
    e.target.value = '' // Reset input
  }
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  // Auto scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (activeConversation) {
      markAsRead(activeConversation)
    }
  }, [activeConversation, markAsRead])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || (!newMessage.trim() && !mediaToUpload)) return

    try {
      let media: MediaMessage | undefined

      if (mediaToUpload) {
        const storageRef = ref(storage, `messages/${activeConversation || 'new'}/${Date.now()}_${mediaToUpload.name}`)
        
        // Upload the file with progress tracking
        const uploadTask = uploadBytesResumable(storageRef, mediaToUpload)
        
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            setUploadProgress(progress)
          },
          (error) => {
            console.error('Upload failed:', error)
            throw error
          }
        )

        // Wait for the upload to complete
        await uploadTask
        const downloadURL = await getDownloadURL(storageRef)

        // Create media metadata
        media = {
          url: downloadURL,
          type: mediaToUpload.type.startsWith('image/') ? 'image' : 'video',
          filename: mediaToUpload.name,
          size: mediaToUpload.size
        }

        // Generate thumbnail for videos
        if (mediaToUpload.type.startsWith('video/')) {
          const video = document.createElement('video')
          video.src = URL.createObjectURL(mediaToUpload)
          await new Promise((resolve) => { video.onloadedmetadata = resolve })
          
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(video, 0, 0)
          
          const thumbnailUrl = canvas.toDataURL('image/jpeg')
          media.thumbnailUrl = thumbnailUrl
          media.dimensions = { width: video.videoWidth, height: video.videoHeight }
          media.duration = video.duration
        }

        setMediaToUpload(null)
        setUploadProgress(0)
      }

      const conversationId = await sendMessage(
        selectedUser,
        newMessage.trim() || media ? 'Sent a ' + (media?.type || 'media') : '',
        media ? 'media' : 'text',
        media
      )
      
      if (conversationId) {
        setActiveConversation(conversationId)
        setNewMessage('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p !== user?.uid) || ''
  }

  const formatMessageTime = (date: Date) => {
    return format(date, 'HH:mm')
  }

  if (loading) {
    return <div className="p-4">Loading conversations...</div>
  }

  return (
    <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-background rounded-lg shadow-lg border flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Messages
        </h2>
        {activeConversation && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setActiveConversation(null)
              setSelectedUser(null)
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
      </div>

      {!activeConversation ? (
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {conversations.map((conversation: Conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  setActiveConversation(conversation.id)
                  setSelectedUser(getOtherParticipant(conversation))
                }}
                className="w-full p-3 flex items-center gap-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">User {getOtherParticipant(conversation)}</div>
                  {conversation.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage.content}
                    </p>
                  )}
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs text-primary-foreground">{conversation.unreadCount}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message: Message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.senderId === user?.uid ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.senderId === user?.uid
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.type === 'media' && message.media ? (
                      <>
                        <MediaMessageContent
                          media={message.media}
                          isOutgoing={message.senderId === user?.uid}
                        />
                        <div
                          className={cn(
                            "text-xs mt-1",
                            message.senderId === user?.uid
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatMessageTime(message.createdAt)}
                        </div>
                      </>
                    ) : (
                      <>
                        <p>{message.content}</p>
                        <div
                          className={cn(
                            "text-xs mt-1",
                            message.senderId === user?.uid
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatMessageTime(message.createdAt)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <Separator />

          <form onSubmit={handleSend} className="p-4 flex gap-2">
            <Input
              value={newMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              id="media-upload"
              onChange={handleMediaUpload}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => document.getElementById('media-upload')?.click()}
            >
              <ImageIcon className="w-4 h-4" />
            </Button>
            <Button type="submit" size="icon" disabled={!newMessage.trim() && !mediaToUpload}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
          {mediaToUpload && (
            <div className="px-4 pb-4 flex items-center gap-2">
              <div className="relative">
                {mediaToUpload.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(mediaToUpload)}
                    alt="Upload preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                    <Film className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-6 h-6"
                  onClick={() => setMediaToUpload(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 text-sm text-muted-foreground">
                {mediaToUpload.name}
                <br />
                {(mediaToUpload.size / (1024 * 1024)).toFixed(1)} MB
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
