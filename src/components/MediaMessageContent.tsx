'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Play, Download, Maximize2 } from 'lucide-react'
import type { MediaMessage } from '@/types/messages'

interface MediaMessageContentProps {
  media: MediaMessage
  isOutgoing: boolean
}

export function MediaMessageContent({ media, isOutgoing }: MediaMessageContentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(media.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = media.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading media:', error)
    }
    setIsLoading(false)
  }

  if (media.type === 'image') {
    return (
      <>
        <div className="relative group">
          <img
            src={media.url}
            alt={media.filename}
            className="max-w-[240px] max-h-[320px] rounded-lg cursor-pointer object-cover"
            onClick={() => setIsOpen(true)}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-lg">
            <Button variant="ghost" size="icon" className="text-white" onClick={() => setIsOpen(true)}>
              <Maximize2 className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white" onClick={handleDownload}>
              <Download className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 text-white"
                onClick={() => setIsOpen(false)}
              >
                <Maximize2 className="w-6 h-6" />
              </Button>
              <img
                src={media.url}
                alt={media.filename}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        </Dialog>
      </>
    )
  }

  if (media.type === 'video') {
    return (
      <>
        <div className="relative group">
          <div className="w-[240px] h-[180px] bg-muted rounded-lg overflow-hidden">
            {media.thumbnailUrl && (
              <img
                src={media.thumbnailUrl}
                alt={media.filename}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setIsOpen(true)}
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute inset-0 m-auto text-white w-12 h-12 rounded-full bg-black/50"
              onClick={() => setIsOpen(true)}
            >
              <Play className="w-6 h-6" />
            </Button>
          </div>
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent rounded-b-lg">
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={handleDownload}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 text-white"
                onClick={() => setIsOpen(false)}
              >
                <Maximize2 className="w-6 h-6" />
              </Button>
              <video
                src={media.url}
                controls
                className="max-w-full max-h-full"
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </Dialog>
      </>
    )
  }

  return null
}
