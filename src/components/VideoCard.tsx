'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, Users, Heart, MessageCircle, Share } from 'lucide-react'

interface VideoCardProps {
  id: string
  title: string
  creator: string
  thumbnail: string
  views: number
  likes: number
  duration: string
  type: 'battle' | 'cypher' | 'freestyle'
}

export function VideoCard({ title, creator, thumbnail, views, likes, duration, type }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const typeColors = {
    battle: 'bg-red-600',
    cypher: 'bg-blue-600', 
    freestyle: 'bg-green-600'
  }

  return (
    <Card className="overflow-hidden hover:scale-[1.02] transition-transform duration-200">
      <div className="relative group">
        <img 
          src={thumbnail} 
          alt={title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            variant="secondary"
            size="icon"
            className="w-16 h-16 rounded-full"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </Button>
        </div>
        
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 text-xs text-white rounded ${typeColors[type]}`}>
            {type.toUpperCase()}
          </span>
        </div>
        
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 text-xs rounded">
          {duration}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">by {creator}</p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              {likes.toLocaleString()}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
