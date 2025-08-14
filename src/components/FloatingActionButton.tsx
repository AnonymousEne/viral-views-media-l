'use client'

import { Button } from '@/components/ui/button'
import { Camera, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingActionButtonProps {
  onClick: () => void
  className?: string
  variant?: 'create' | 'live'
}

export function FloatingActionButton({ 
  onClick, 
  className,
  variant = 'create'
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
        "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
        "text-white border-0 transition-all duration-200",
        "hover:scale-110 active:scale-95",
        "md:bottom-8 md:right-8",
        className
      )}
      size="icon"
    >
      {variant === 'live' ? (
        <Camera className="w-6 h-6" />
      ) : (
        <Plus className="w-6 h-6" />
      )}
    </Button>
  )
}
