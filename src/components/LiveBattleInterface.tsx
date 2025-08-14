'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { 
  doc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore'
import { 
  Mic, 
  MicOff, 
  Timer, 
  Vote, 
  Crown, 
  Users, 
  Send,
  Heart,
  Flame,
  ThumbsUp,
  X
} from 'lucide-react'

interface LiveBattleProps {
  battleId: string
  battle: any
  onClose: () => void
}

export default function LiveBattleInterface({ battleId, battle, onClose }: LiveBattleProps) {
  const [user] = useAuthState(auth)
  const [currentBattle, setCurrentBattle] = useState(battle)
  const [timeRemaining, setTimeRemaining] = useState(battle?.timeLimit || 60)
  const [isRecording, setIsRecording] = useState(false)
  const [currentPerformance, setCurrentPerformance] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [reactions, setReactions] = useState<{id: string, type: string, x: number, y: number}[]>([])
  const [liveComments, setLiveComments] = useState<any[]>([])

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Listen to battle updates
  useEffect(() => {
    if (!battleId) return

    const unsubscribe = onSnapshot(doc(db, 'battles', battleId), (doc) => {
      if (doc.exists()) {
        setCurrentBattle({ id: doc.id, ...doc.data() })
      }
    })

    return () => unsubscribe()
  }, [battleId])

  // Timer countdown
  useEffect(() => {
    if (currentBattle?.status === 'active' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev: number) => {
          if (prev <= 1) {
            stopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [currentBattle?.status, timeRemaining])

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [liveComments])

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        // TODO: Upload audio blob to Firebase Storage
        console.log('Recording completed:', audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  // Submit performance
  const submitPerformance = async () => {
    if (!user || !currentBattle || !currentPerformance.trim()) return

    try {
      const battleRef = doc(db, 'battles', battleId)
      const updatedParticipants = currentBattle.participants.map((p: any) => 
        p.userId === user.uid 
          ? { 
              ...p, 
              performance: {
                content: currentPerformance,
                submittedAt: serverTimestamp(),
                votes: 0,
                type: 'text' // or 'audio' for recorded performances
              }
            }
          : p
      )

      await updateDoc(battleRef, {
        participants: updatedParticipants
      })

      setCurrentPerformance('')
      alert('Performance submitted! 🎤')
    } catch (error) {
      console.error('Error submitting performance:', error)
    }
  }

  // Send chat message
  const sendChatMessage = async () => {
    if (!user || !chatMessage.trim()) return

    try {
      const battleRef = doc(db, 'battles', battleId)
      const newComment = {
        id: Date.now().toString(),
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || '',
        message: chatMessage,
        timestamp: serverTimestamp(),
        type: 'chat'
      }

      await updateDoc(battleRef, {
        liveComments: arrayUnion(newComment)
      })

      setChatMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Add reaction
  const addReaction = (type: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newReaction = {
      id: Date.now().toString(),
      type,
      x,
      y
    }

    setReactions(prev => [...prev, newReaction])

    // Remove reaction after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id))
    }, 2000)

    // Send reaction to battle
    if (user) {
      const battleRef = doc(db, 'battles', battleId)
      updateDoc(battleRef, {
        liveComments: arrayUnion({
          id: Date.now().toString(),
          userId: user.uid,
          displayName: user.displayName || 'Anonymous',
          message: `reacted with ${type}`,
          timestamp: serverTimestamp(),
          type: 'reaction',
          reactionType: type
        })
      })
    }
  }

  // Vote for participant
  const voteForParticipant = async (participantId: string) => {
    if (!user || !currentBattle) return

    try {
      const battleRef = doc(db, 'battles', battleId)
      const newVote = {
        voterId: user.uid,
        participantId,
        createdAt: serverTimestamp()
      }

      await updateDoc(battleRef, {
        votes: arrayUnion(newVote)
      })

      alert('Vote submitted! 🗳️')
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isUserParticipant = currentBattle?.participants?.some((p: any) => p.userId === user?.uid)
  const userPerformance = currentBattle?.participants?.find((p: any) => p.userId === user?.uid)?.performance

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 backdrop-blur-lg border border-white/20 rounded-xl w-full max-w-6xl h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-white">{currentBattle?.title}</h2>
            <div className="flex items-center space-x-2 text-yellow-400">
              <Crown className="w-5 h-5" />
              <span className="font-semibold">{currentBattle?.format}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Timer */}
            <div className="flex items-center space-x-2 bg-red-600/20 px-4 py-2 rounded-lg">
              <Timer className="w-5 h-5 text-red-400" />
              <span className="text-white font-mono text-lg">{formatTime(timeRemaining)}</span>
            </div>
            
            {/* Participants Count */}
            <div className="flex items-center space-x-2 bg-blue-600/20 px-4 py-2 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-white">{currentBattle?.participants?.length || 0}</span>
            </div>
            
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 text-2xl p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Side - Battle Arena */}
          <div className="flex-1 flex flex-col p-6">
            
            {/* Participants */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Participants</h3>
              <div className="grid grid-cols-2 gap-4">
                {currentBattle?.participants?.map((participant: any, index: number) => (
                  <div
                    key={participant.userId}
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 relative overflow-hidden"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {participant.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-semibold">{participant.displayName}</p>
                        <p className="text-gray-400 text-sm">
                          {participant.userId === user?.uid ? 'You' : 'Opponent'}
                        </p>
                      </div>
                    </div>
                    
                    {participant.performance ? (
                      <div className="space-y-2">
                        <div className="text-green-400 text-sm font-semibold">✓ Performance Submitted</div>
                        {currentBattle?.status === 'voting' && (
                          <button
                            onClick={() => voteForParticipant(participant.userId)}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-2 rounded-lg font-semibold transition-all text-sm"
                          >
                            <Vote className="w-4 h-4 inline mr-2" />
                            Vote for {participant.displayName}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">Waiting for performance...</div>
                    )}

                    {/* Reaction Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {reactions.map((reaction) => (
                        <div
                          key={reaction.id}
                          className="absolute animate-bounce text-2xl"
                          style={{ left: reaction.x, top: reaction.y }}
                        >
                          {reaction.type}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Area */}
            {isUserParticipant && !userPerformance && currentBattle?.status === 'active' && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Your Performance</h3>
                
                {/* Recording Controls */}
                <div className="flex items-center space-x-4 mb-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                      isRecording 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                  </button>
                  
                  {isRecording && (
                    <div className="flex items-center space-x-2 text-red-400">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold">Recording...</span>
                    </div>
                  )}
                </div>

                {/* Text Performance */}
                <div className="space-y-4">
                  <textarea
                    value={currentPerformance}
                    onChange={(e) => setCurrentPerformance(e.target.value)}
                    placeholder="Drop your bars here... 🎤"
                    rows={4}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 resize-none"
                  />
                  
                  <button
                    onClick={submitPerformance}
                    disabled={!currentPerformance.trim()}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Submit Performance 🎤
                  </button>
                </div>
              </div>
            )}

            {/* Reaction Buttons */}
            <div className="mt-6">
              <div className="flex items-center space-x-3">
                <span className="text-white font-semibold">React:</span>
                {['🔥', '💯', '👏', '😱', '🎤'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={(e) => addReaction(emoji, e)}
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Live Chat */}
          <div className="w-80 border-l border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Live Chat</h3>
            </div>
            
            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {liveComments.map((comment: any) => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {comment.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{comment.displayName}</p>
                    <p className="text-white text-sm">{comment.message}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Chat Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-sm"
                />
                <button
                  onClick={sendChatMessage}
                  className="bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
