'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Mic, 
  Users, 
  Zap, 
  Clock,
  Play,
  Pause,
  Volume2,
  Brain,
  Star,
  Flame
} from 'lucide-react'
import { analyzeCypherPerformance } from '@/lib/ai-client'

interface CypherParticipant {
  id: string
  name: string
  performance: string
  analysis?: any
  timestamp: number
}

export default function CypherTest() {
  const [user] = useAuthState(auth)
  const [participants, setParticipants] = useState<CypherParticipant[]>([])
  const [currentPerformance, setCurrentPerformance] = useState('')
  const [cypherTheme, setCypherTheme] = useState('Freestyle Flow')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [cypherStarted, setCypherStarted] = useState(false)
  const [currentBeat, setCurrentBeat] = useState('Classic Boom Bap - 90 BPM')

  // Mock cypher participants for testing
  const testParticipants = [
    {
      id: '1',
      name: 'FlowMaster',
      performance: "Yo, stepping in the cypher with that classic vibe, 90 BPM got me feeling so alive, boom bap foundation, that's my meditation, spitting pure fire with lyrical elevation",
      timestamp: Date.now() - 180000
    },
    {
      id: '2', 
      name: 'LyricGenius',
      performance: "Building off that energy, I'm next in rotation, wordplay so complex it needs translation, metaphors layered like geological formations, rap game architect with verbal innovations",
      timestamp: Date.now() - 120000
    },
    {
      id: '3',
      name: 'RhymeVision',
      performance: "The cypher's getting heated, temperature rising, my flow so smooth it's hypnotizing, each bar calculated, precision surprising, in this circle of excellence, we're all comprising",
      timestamp: Date.now() - 60000
    }
  ]

  useEffect(() => {
    // Simulate adding test participants over time
    if (cypherStarted && participants.length === 0) {
      setTimeout(() => {
        setParticipants([testParticipants[0]])
      }, 1000)
      
      setTimeout(() => {
        setParticipants(prev => [...prev, testParticipants[1]])
      }, 3000)
      
      setTimeout(() => {
        setParticipants(prev => [...prev, testParticipants[2]])
      }, 5000)
    }
  }, [cypherStarted, participants.length])

  const startCypher = () => {
    setCypherStarted(true)
    setParticipants([])
  }

  const addYourVerse = async () => {
    if (!user || !currentPerformance.trim()) return
    
    const newParticipant: CypherParticipant = {
      id: user.uid,
      name: user.displayName || 'You',
      performance: currentPerformance,
      timestamp: Date.now()
    }
    
    setParticipants(prev => [...prev, newParticipant])
    setCurrentPerformance('')
    
    // Analyze the performance
    setIsAnalyzing(true)
    try {
      const result = await analyzeCypherPerformance(
        newParticipant.name,
        newParticipant.performance,
        {
          theme: cypherTheme,
          previousParticipants: participants.map(p => p.name),
          beatInfo: currentBeat
        }
      )
      
      if (result.analysis) {
        const analysis = JSON.parse(result.analysis)
        setParticipants(prev => 
          prev.map(p => 
            p.id === newParticipant.id 
              ? { ...p, analysis }
              : p
          )
        )
      }
    } catch (error) {
      console.error('Error analyzing cypher performance:', error)
    }
    setIsAnalyzing(false)
  }

  const analyzeParticipant = async (participant: CypherParticipant) => {
    setIsAnalyzing(true)
    try {
      const result = await analyzeCypherPerformance(
        participant.name,
        participant.performance,
        {
          theme: cypherTheme,
          previousParticipants: participants.filter(p => p.timestamp < participant.timestamp).map(p => p.name),
          beatInfo: currentBeat
        }
      )
      
      if (result.analysis) {
        const analysis = JSON.parse(result.analysis)
        setParticipants(prev => 
          prev.map(p => 
            p.id === participant.id 
              ? { ...p, analysis }
              : p
          )
        )
      }
    } catch (error) {
      console.error('Error analyzing cypher performance:', error)
    }
    setIsAnalyzing(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-400'
    if (score >= 7) return 'text-yellow-400'
    if (score >= 5) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <Users className="h-10 w-10 mr-3 text-purple-400" />
            Cypher Test Arena
          </h1>
          <p className="text-xl text-gray-300">
            Test the AI cypher analysis system with collaborative freestyle sessions
          </p>
        </div>

        {/* Cypher Setup */}
        {!cypherStarted && (
          <Card className="bg-white/10 backdrop-blur-md border-purple-500/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Start a Cypher Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cypher Theme
                </label>
                <select
                  value={cypherTheme}
                  onChange={(e) => setCypherTheme(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="Freestyle Flow">Freestyle Flow</option>
                  <option value="Story Time">Story Time</option>
                  <option value="Battle Bars">Battle Bars</option>
                  <option value="Conscious Rap">Conscious Rap</option>
                  <option value="Party Vibes">Party Vibes</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Beat Selection
                </label>
                <select
                  value={currentBeat}
                  onChange={(e) => setCurrentBeat(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="Classic Boom Bap - 90 BPM">Classic Boom Bap - 90 BPM</option>
                  <option value="Trap Style - 140 BPM">Trap Style - 140 BPM</option>
                  <option value="Jazz Sample - 95 BPM">Jazz Sample - 95 BPM</option>
                  <option value="Lo-Fi Chill - 85 BPM">Lo-Fi Chill - 85 BPM</option>
                </select>
              </div>

              <Button
                onClick={startCypher}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Cypher Session
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Cypher */}
        {cypherStarted && (
          <div className="space-y-6">
            {/* Cypher Info */}
            <Card className="bg-white/10 backdrop-blur-md border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Volume2 className="h-5 w-5 text-green-400" />
                      <span className="text-white font-medium">{currentBeat}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Flame className="h-5 w-5 text-orange-400" />
                      <span className="text-white font-medium">{cypherTheme}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    <span className="text-white">{participants.length} Participants</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">CYPHER LIVE</span>
                </div>
              </CardContent>
            </Card>

            {/* Your Turn */}
            {user && (
              <Card className="bg-white/10 backdrop-blur-md border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Mic className="h-6 w-6 mr-2 text-yellow-400" />
                    Your Turn - Drop Your Bars
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <textarea
                    value={currentPerformance}
                    onChange={(e) => setCurrentPerformance(e.target.value)}
                    placeholder="Write your verse here... keep the energy flowing!"
                    className="w-full h-32 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      {currentPerformance.length}/500 characters
                    </span>
                    <Button
                      onClick={addYourVerse}
                      disabled={!currentPerformance.trim() || isAnalyzing}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Drop Your Bars'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cypher Participants */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Clock className="h-6 w-6 mr-2 text-purple-400" />
                Cypher Flow
              </h2>
              
              {participants.map((participant, index) => (
                <Card key={participant.id} className="bg-white/10 backdrop-blur-md border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-purple-400 mr-2">#{index + 1}</span>
                        <span>{participant.name}</span>
                        {participant.analysis && (
                          <Star className="h-5 w-5 ml-2 text-yellow-400" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">
                          {new Date(participant.timestamp).toLocaleTimeString()}
                        </span>
                        {!participant.analysis && (
                          <Button
                            onClick={() => analyzeParticipant(participant)}
                            disabled={isAnalyzing}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Brain className="h-4 w-4 mr-1" />
                            Analyze
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-white italic">"{participant.performance}"</p>
                    </div>
                    
                    {participant.analysis && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cypher Scores */}
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3">Cypher Analysis</h4>
                          <div className="space-y-2">
                            {Object.entries(participant.analysis.cypher_analysis).map(([category, score]: [string, any]) => (
                              <div key={category} className="flex justify-between items-center">
                                <span className="text-gray-300 capitalize text-sm">
                                  {category.replace('_', ' ')}
                                </span>
                                <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                                  {score}/10
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Analysis Details */}
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-3">AI Feedback</h4>
                          <div className="space-y-2">
                            <div>
                              <span className="text-green-300 text-sm font-medium">Grade: </span>
                              <span className="text-white font-bold">{participant.analysis.overall_cypher_grade}</span>
                            </div>
                            <div>
                              <span className="text-blue-300 text-sm font-medium">Energy: </span>
                              <span className="text-white capitalize">{participant.analysis.energy_level}</span>
                            </div>
                            <div>
                              <span className="text-purple-300 text-sm font-medium">Style: </span>
                              <span className="text-white text-sm">{participant.analysis.style_description}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {participants.length === 0 && (
                <Card className="bg-white/10 backdrop-blur-md border-gray-500/20">
                  <CardContent className="p-8 text-center">
                    <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">
                      Waiting for participants to join the cypher...
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
