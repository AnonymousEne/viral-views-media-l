'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { 
  Swords, 
  Users, 
  Clock, 
  Trophy, 
  Vote, 
  Mic,
  Crown,
  Timer,
  Play,
  Pause
} from 'lucide-react'

interface Battle {
  id: string
  title: string
  description: string
  format: 'freestyle' | 'written' | 'cypher'
  timeLimit: number // seconds
  maxParticipants: number
  status: 'waiting' | 'active' | 'voting' | 'completed'
  createdBy: string
  createdAt: any
  participants: {
    userId: string
    displayName: string
    photoURL: string
    joinedAt: any
    performance?: {
      content: string
      submittedAt: any
      votes: number
    }
  }[]
  votes: {
    voterId: string
    participantId: string
    createdAt: any
  }[]
  winner?: string
}

export default function BattleRoomSystem() {
  const [user] = useAuthState(auth)
  const [battles, setBattles] = useState<Battle[]>([])
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(true)

  // New battle form
  const [newBattle, setNewBattle] = useState({
    title: '',
    description: '',
    format: 'freestyle' as 'freestyle' | 'written' | 'cypher',
    timeLimit: 60,
    maxParticipants: 2
  })

  // Load battles
  useEffect(() => {
    const battlesQuery = query(
      collection(db, 'battles'),
      where('status', 'in', ['waiting', 'active', 'voting']),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(battlesQuery, (snapshot) => {
      const battleList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Battle[]
      
      setBattles(battleList)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Create new battle
  const createBattle = async () => {
    if (!user || !newBattle.title.trim()) return

    try {
      const battleDoc = {
        title: newBattle.title,
        description: newBattle.description,
        format: newBattle.format,
        timeLimit: newBattle.timeLimit,
        maxParticipants: newBattle.maxParticipants,
        status: 'waiting',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        participants: [],
        votes: []
      }

      await addDoc(collection(db, 'battles'), battleDoc)
      
      // Reset form
      setNewBattle({
        title: '',
        description: '',
        format: 'freestyle',
        timeLimit: 60,
        maxParticipants: 2
      })
      setShowCreateForm(false)
      
      console.log('Battle created successfully!')
    } catch (error) {
      console.error('Error creating battle:', error)
    }
  }

  // Join battle
  const joinBattle = async (battleId: string) => {
    if (!user) return

    try {
      const battleRef = doc(db, 'battles', battleId)
      const battle = battles.find(b => b.id === battleId)
      
      if (!battle) return

      // Check if user already joined
      const alreadyJoined = battle.participants.some(p => p.userId === user.uid)
      if (alreadyJoined) {
        alert('You have already joined this battle!')
        return
      }

      // Check if battle is full
      if (battle.participants.length >= battle.maxParticipants) {
        alert('This battle is full!')
        return
      }

      const newParticipant = {
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        joinedAt: serverTimestamp()
      }

      const updatedParticipants = [...battle.participants, newParticipant]
      
      // Update battle
      await updateDoc(battleRef, {
        participants: updatedParticipants,
        // Start battle if it reaches max participants
        status: updatedParticipants.length >= battle.maxParticipants ? 'active' : 'waiting'
      })

      console.log('Joined battle successfully!')
    } catch (error) {
      console.error('Error joining battle:', error)
    }
  }

  // Submit performance
  const submitPerformance = async (battleId: string, content: string) => {
    if (!user) return

    try {
      const battleRef = doc(db, 'battles', battleId)
      const battle = battles.find(b => b.id === battleId)
      
      if (!battle) return

      const updatedParticipants = battle.participants.map(p => 
        p.userId === user.uid 
          ? { 
              ...p, 
              performance: {
                content,
                submittedAt: serverTimestamp(),
                votes: 0
              }
            }
          : p
      )

      // Check if all participants have submitted
      const allSubmitted = updatedParticipants.every(p => p.performance)

      await updateDoc(battleRef, {
        participants: updatedParticipants,
        status: allSubmitted ? 'voting' : 'active'
      })

      console.log('Performance submitted!')
    } catch (error) {
      console.error('Error submitting performance:', error)
    }
  }

  // Vote for participant
  const voteForParticipant = async (battleId: string, participantId: string) => {
    if (!user) return

    try {
      const battleRef = doc(db, 'battles', battleId)
      const battle = battles.find(b => b.id === battleId)
      
      if (!battle) return

      // Check if user already voted
      const alreadyVoted = battle.votes.some(v => v.voterId === user.uid)
      if (alreadyVoted) {
        alert('You have already voted!')
        return
      }

      // Check if user is a participant (participants can't vote)
      const isParticipant = battle.participants.some(p => p.userId === user.uid)
      if (isParticipant) {
        alert('Participants cannot vote!')
        return
      }

      const newVote = {
        voterId: user.uid,
        participantId,
        createdAt: serverTimestamp()
      }

      await updateDoc(battleRef, {
        votes: [...battle.votes, newVote]
      })

      console.log('Vote submitted!')
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="w-5 h-5 text-yellow-400" />
      case 'active': return <Mic className="w-5 h-5 text-red-400" />
      case 'voting': return <Vote className="w-5 h-5 text-blue-400" />
      case 'completed': return <Trophy className="w-5 h-5 text-green-400" />
      default: return <Swords className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Waiting for participants'
      case 'active': return 'Battle in progress'
      case 'voting': return 'Voting phase'
      case 'completed': return 'Battle completed'
      default: return 'Unknown status'
    }
  }

  if (!user) {
    return (
      <div className="text-center p-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
        <p className="text-white">Please sign in to participate in battles</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Swords className="w-8 h-8 text-pink-400" />
              Battle Arena
            </h2>
            <p className="text-gray-300">Join epic rap battles and showcase your skills</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <Swords className="w-5 h-5" />
            Create Battle
          </button>
        </div>

        {/* Create Battle Form */}
        {showCreateForm && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Create New Battle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Battle Title *</label>
                <input
                  type="text"
                  value={newBattle.title}
                  onChange={(e) => setNewBattle(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Epic Freestyle Battle..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Description</label>
                <textarea
                  value={newBattle.description}
                  onChange={(e) => setNewBattle(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the battle theme or rules..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 resize-none"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Format</label>
                  <select
                    value={newBattle.format}
                    onChange={(e) => setNewBattle(prev => ({ 
                      ...prev, 
                      format: e.target.value as 'freestyle' | 'written' | 'cypher' 
                    }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="freestyle">Freestyle</option>
                    <option value="written">Written</option>
                    <option value="cypher">Cypher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Time Limit (seconds)</label>
                  <input
                    type="number"
                    value={newBattle.timeLimit}
                    onChange={(e) => setNewBattle(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
                    min="30"
                    max="300"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Max Participants</label>
                  <input
                    type="number"
                    value={newBattle.maxParticipants}
                    onChange={(e) => setNewBattle(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 2 }))}
                    min="2"
                    max="8"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={createBattle}
                  disabled={!newBattle.title.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Create Battle
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Battles List */}
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
        </div>
      ) : battles.length === 0 ? (
        <div className="text-center p-12 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
          <div className="text-6xl mb-4">⚔️</div>
          <h3 className="text-xl font-bold text-white mb-2">No active battles</h3>
          <p className="text-gray-300 mb-6">
            Be the first to create a battle and challenge other artists!
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
          >
            Create First Battle
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {battles.map((battle) => (
            <div
              key={battle.id}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 hover:transform hover:scale-105 transition-all duration-300"
            >
              {/* Battle Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white line-clamp-1">
                  {battle.title}
                </h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(battle.status)}
                </div>
              </div>

              {/* Battle Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Format:</span>
                  <span className="text-white font-semibold capitalize">{battle.format}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Time Limit:</span>
                  <span className="text-white font-semibold">{battle.timeLimit}s</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Participants:</span>
                  <span className="text-white font-semibold">
                    {battle.participants.length}/{battle.maxParticipants}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {getStatusIcon(battle.status)}
                  <span className="text-gray-300">{getStatusText(battle.status)}</span>
                </div>
              </div>

              {/* Participants */}
              {battle.participants.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-300 text-sm mb-2">Participants:</p>
                  <div className="flex -space-x-2">
                    {battle.participants.map((participant, index) => (
                      <div
                        key={participant.userId}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold border-2 border-white/20"
                        title={participant.displayName}
                      >
                        {participant.displayName.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-4">
                {battle.status === 'waiting' && (
                  <button
                    onClick={() => joinBattle(battle.id)}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-2 rounded-lg font-semibold transition-all"
                  >
                    Join Battle
                  </button>
                )}
                
                {battle.status === 'active' && (
                  <button
                    onClick={() => setActiveBattle(battle)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-2 rounded-lg font-semibold transition-all"
                  >
                    Enter Battle
                  </button>
                )}
                
                {battle.status === 'voting' && (
                  <button
                    onClick={() => setActiveBattle(battle)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-2 rounded-lg font-semibold transition-all"
                  >
                    Vote Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Battle Modal would go here */}
      {activeBattle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">{activeBattle.title}</h3>
              <button
                onClick={() => setActiveBattle(null)}
                className="text-white hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="text-center text-white">
              <p className="mb-4">Battle interface coming soon!</p>
              <p className="text-gray-300 text-sm">
                This will include real-time performance submission, voting system, and live results.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
