'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import BattleRoomSystem from '@/components/BattleRoomSystem'
import LiveBattleInterface from '@/components/LiveBattleInterface'
import { Home, Swords, Trophy, Clock, Play } from 'lucide-react'
import Link from 'next/link'

interface Battle {
  id: string
  title: string
  description: string
  format: 'freestyle' | 'written' | 'cypher'
  timeLimit: number
  maxParticipants: number
  status: 'waiting' | 'active' | 'voting' | 'completed'
  createdBy: string
  createdAt: any
  participants: any[]
  votes: any[]
  winner?: string
}

export default function BattlesPage() {
  const [user] = useAuthState(auth)
  const [battles, setBattles] = useState<Battle[]>([])
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null)
  const [showLiveBattle, setShowLiveBattle] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load battles
  useEffect(() => {
    const battlesQuery = query(
      collection(db, 'battles'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(battlesQuery, (snapshot) => {
      const battleList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Battle[]
      
      setBattles(battleList)
      setLoading(false)
    }, (error) => {
      console.log('Battles query error (this is normal if no battles exist yet):', error)
      setBattles([])
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Join battle and enter live interface
  const joinBattleAndEnter = async (battle: Battle) => {
    if (!user) {
      alert('Please sign in to join battles!')
      return
    }

    // Check if user already joined
    const alreadyJoined = battle.participants.some(p => p.userId === user.uid)
    
    if (!alreadyJoined) {
      // Join battle first
      try {
        const battleRef = doc(db, 'battles', battle.id)
        const newParticipant = {
          userId: user.uid,
          displayName: user.displayName || 'Anonymous',
          photoURL: user.photoURL || '',
          joinedAt: serverTimestamp()
        }

        const updatedParticipants = [...battle.participants, newParticipant]
        
        await updateDoc(battleRef, {
          participants: updatedParticipants,
          status: updatedParticipants.length >= battle.maxParticipants ? 'active' : 'waiting'
        })

        // Update local state
        const updatedBattle = {
          ...battle,
          participants: updatedParticipants,
          status: updatedParticipants.length >= battle.maxParticipants ? 'active' as const : 'waiting' as const
        }
        
        setActiveBattle(updatedBattle)
        setShowLiveBattle(true)
      } catch (error) {
        console.error('Error joining battle:', error)
        alert('Failed to join battle. Please try again.')
      }
    } else {
      // Already joined, just enter
      setActiveBattle(battle)
      setShowLiveBattle(true)
    }
  }

  const enterBattle = (battle: Battle) => {
    setActiveBattle(battle)
    setShowLiveBattle(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-400'
      case 'active': return 'text-red-400'
      case 'voting': return 'text-blue-400'
      case 'completed': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="w-4 h-4" />
      case 'active': return <Play className="w-4 h-4" />
      case 'voting': return <Trophy className="w-4 h-4" />
      case 'completed': return <Trophy className="w-4 h-4" />
      default: return <Swords className="w-4 h-4" />
    }
  }

  // Filter battles by status
  const activeBattles = battles.filter(b => ['waiting', 'active'].includes(b.status))
  const votingBattles = battles.filter(b => b.status === 'voting')
  const completedBattles = battles.filter(b => b.status === 'completed').slice(0, 6)
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Home className="w-6 h-6 text-pink-400" />
              <span className="text-white font-bold text-xl">Viral Views</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Swords className="w-6 h-6 text-pink-400" />
              <span className="text-white font-semibold">Battle Arena</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Battle Arena ⚔️
            </h1>
            <p className="text-gray-300 text-lg">
              Join epic rap battles, showcase your skills, and climb the leaderboards
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-pink-400">{battles.length}</div>
              <div className="text-gray-300 text-sm">Total Battles</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{activeBattles.length}</div>
              <div className="text-gray-300 text-sm">Active Now</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{votingBattles.length}</div>
              <div className="text-gray-300 text-sm">In Voting</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{completedBattles.length}</div>
              <div className="text-gray-300 text-sm">Completed</div>
            </div>
          </div>

          {/* Active & Waiting Battles */}
          {activeBattles.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">🔥 Live & Waiting Battles</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBattles.map((battle) => (
                  <div
                    key={battle.id}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
                  >
                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 flex items-center space-x-1 ${getStatusColor(battle.status)}`}>
                      {getStatusIcon(battle.status)}
                      <span className="text-xs font-semibold uppercase">{battle.status}</span>
                    </div>

                    {/* Battle Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white mb-2 pr-16">{battle.title}</h3>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{battle.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Format:</span>
                          <span className="text-white font-semibold capitalize">{battle.format}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time Limit:</span>
                          <span className="text-white font-semibold">{battle.timeLimit}s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Participants:</span>
                          <span className="text-white font-semibold">
                            {battle.participants.length}/{battle.maxParticipants}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Participants Preview */}
                    {battle.participants.length > 0 && (
                      <div className="mb-4">
                        <div className="flex -space-x-2 mb-2">
                          {battle.participants.slice(0, 3).map((participant, index) => (
                            <div
                              key={participant.userId}
                              className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold border-2 border-white/20"
                              title={participant.displayName}
                            >
                              {participant.displayName.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {battle.participants.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white/20">
                              +{battle.participants.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="space-y-2">
                      {battle.status === 'waiting' && (
                        <button
                          onClick={() => joinBattleAndEnter(battle)}
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 rounded-lg font-semibold transition-all"
                        >
                          Join Battle
                        </button>
                      )}
                      
                      {battle.status === 'active' && (
                        <button
                          onClick={() => enterBattle(battle)}
                          className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-2 rounded-lg font-semibold transition-all animate-pulse"
                        >
                          🔴 Enter Live Battle
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Battle Creation System */}
          <BattleRoomSystem />

          {/* Phase 3 Development Status */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
              <h3 className="text-blue-200 font-semibold mb-2 text-xl">🚧 Phase 3: Live Battle System Complete!</h3>
              <div className="space-y-3 text-blue-100">
                <p><strong>✅ Real-time Battle Interface:</strong> Complete live battle UI with recording, chat, reactions</p>
                <p><strong>✅ Timer System:</strong> Countdown timers for battle rounds with auto-submission</p>
                <p><strong>✅ Live Chat:</strong> Real-time messaging during battles with participant info</p>
                <p><strong>✅ Reaction System:</strong> Live emoji reactions with animations</p>
                <p><strong>✅ Voice Recording:</strong> Microphone integration for audio battles</p>
                <p><strong>✅ Voting Interface:</strong> Community voting system with anti-cheat safeguards</p>
                <p><strong>✅ Battle Management:</strong> Join, create, and manage battles with real-time updates</p>
                <div className="mt-4 p-3 bg-blue-600/20 rounded-lg">
                  <p className="font-semibold text-blue-200">🎮 Ready to Experience:</p>
                  <ol className="list-decimal list-inside text-sm space-y-1 mt-2">
                    <li>Create a new battle with custom settings</li>
                    <li>Join the battle and enter the live interface</li>
                    <li>Experience real-time recording, chat, and reactions</li>
                    <li>Submit your performance and vote for winners</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Live Battle Interface Modal */}
      {showLiveBattle && activeBattle && (
        <LiveBattleInterface
          battleId={activeBattle.id}
          battle={activeBattle}
          onClose={() => {
            setShowLiveBattle(false)
            setActiveBattle(null)
          }}
        />
      )}
    </div>
  )
}
