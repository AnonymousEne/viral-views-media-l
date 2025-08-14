'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic, Users, Trophy, Clock } from 'lucide-react'

interface BattleRoomProps {
  id: string
  title: string
  participants: string[]
  spectators: number
  status: 'waiting' | 'live' | 'finished'
  round: number
  timeLeft?: number
}

export function BattleRoom({ title, participants, spectators, status, round, timeLeft }: BattleRoomProps) {
  const [isJoined, setIsJoined] = useState(false)

  const statusColors = {
    waiting: 'bg-yellow-600',
    live: 'bg-red-600',
    finished: 'bg-gray-600'
  }

  const statusLabels = {
    waiting: 'Waiting for participants',
    live: 'LIVE NOW',
    finished: 'Battle finished'
  }

  return (
    <Card className="border-2 hover:border-primary/50 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 text-xs text-white rounded-full ${statusColors[status]}`}>
                {statusLabels[status]}
              </span>
              {status === 'live' && (
                <span className="text-sm text-muted-foreground">Round {round}</span>
              )}
            </div>
          </div>
          
          {timeLeft && status === 'live' && (
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Participants */}
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Participants ({participants.length}/2)
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {participants.map((participant, index) => (
                <div key={index} className="bg-muted rounded-lg p-3 text-center">
                  <div className="font-medium">{participant}</div>
                  {status === 'live' && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {index === round % 2 ? 'Current turn' : 'Waiting'}
                    </div>
                  )}
                </div>
              ))}
              {participants.length < 2 && (
                <div className="bg-muted/50 border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center">
                  <div className="text-muted-foreground">Waiting for opponent</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Spectators and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {spectators.toLocaleString()} watching
            </div>
            
            <div className="flex gap-2">
              {status === 'waiting' && participants.length < 2 && (
                <Button 
                  onClick={() => setIsJoined(!isJoined)}
                  variant={isJoined ? "outline" : "default"}
                >
                  {isJoined ? 'Leave Battle' : 'Join Battle'}
                </Button>
              )}
              
              {status === 'live' && (
                <Button variant="outline">
                  Watch Live
                </Button>
              )}
              
              {status === 'finished' && (
                <Button variant="outline">
                  <Trophy className="w-4 h-4 mr-2" />
                  View Results
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
