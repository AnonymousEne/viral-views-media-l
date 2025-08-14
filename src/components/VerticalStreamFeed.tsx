'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { LiveStreamPlayer } from '@/components/LiveStreamPlayer'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LiveStream } from '@/types/livestream'

interface VerticalStreamFeedProps {
  streams: LiveStream[]
  initialIndex?: number
  onClose?: () => void
}

export function VerticalStreamFeed({ streams, initialIndex = 0, onClose }: VerticalStreamFeedProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Minimum swipe distance to trigger action
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientY)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isUpSwipe = distance > minSwipeDistance
    const isDownSwipe = distance < -minSwipeDistance

    if (isUpSwipe && currentIndex < streams.length - 1) {
      setCurrentIndex((prev: number) => prev + 1)
    }
    if (isDownSwipe && currentIndex > 0) {
      setCurrentIndex((prev: number) => prev - 1)
    }
  }

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' && currentIndex > 0) {
      setCurrentIndex((prev: number) => prev - 1)
    } else if (e.key === 'ArrowDown' && currentIndex < streams.length - 1) {
      setCurrentIndex((prev: number) => prev + 1)
    } else if (e.key === 'Escape') {
      onClose?.()
    }
  }, [currentIndex, streams.length, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Prevent scroll on body when component is active
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev: number) => prev - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < streams.length - 1) {
      setCurrentIndex((prev: number) => prev + 1)
    }
  }

  if (streams.length === 0) {
    return null
  }

  const currentStream = streams[currentIndex]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-60 text-white hover:bg-white/20"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Stream Counter */}
      <div className="absolute top-4 left-4 z-60 bg-black/50 rounded-full px-3 py-1 text-white text-sm">
        {currentIndex + 1} / {streams.length}
      </div>

      {/* Navigation Arrows (Desktop) */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex-col gap-4 z-60">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className={cn(
            "w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70",
            currentIndex === 0 && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronUp className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNext}
          disabled={currentIndex === streams.length - 1}
          className={cn(
            "w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70",
            currentIndex === streams.length - 1 && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronDown className="w-6 h-6" />
        </Button>
      </div>

      {/* Current Stream */}
      <div className="w-full h-full">
        <LiveStreamPlayer
          stream={currentStream}
          isFullscreen={true}
        />
      </div>

      {/* Stream Indicators */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1 z-60">
        {streams.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-2 h-8 rounded-full transition-all",
              index === currentIndex 
                ? "bg-white" 
                : "bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>

      {/* Mobile Swipe Hint */}
      <div className="md:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 z-60">
        <div className="flex flex-col items-center text-white/70 text-xs">
          <ChevronUp className="w-4 h-4 animate-bounce" />
          <span>Swipe to browse</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>
    </div>
  )
}
