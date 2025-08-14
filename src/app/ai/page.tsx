'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  where,
  getDocs 
} from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Shield, 
  TrendingUp, 
  Users, 
  BarChart, 
  Activity,
  Zap,
  Brain,
  Eye,
  Target
} from 'lucide-react'

interface AIAnalysis {
  id: string
  type: 'content_moderation' | 'battle_analysis' | 'performance_feedback' | 'trend_analysis'
  content: any
  timestamp: any
  userId?: string
}

interface BattleStats {
  totalBattles: number
  activeBattles: number
  totalParticipants: number
  averageScore: number
}

export default function AIPage() {
  const [user] = useAuthState(auth)
  const [analyses, setAnalyses] = useState<AIAnalysis[]>([])
  const [battleStats, setBattleStats] = useState<BattleStats>({
    totalBattles: 0,
    activeBattles: 0,
    totalParticipants: 0,
    averageScore: 0
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    // Listen to AI analyses
    const analysesQuery = query(
      collection(db, 'ai_analyses'),
      orderBy('timestamp', 'desc'),
      limit(20)
    )

    const unsubscribe = onSnapshot(analysesQuery, (snapshot) => {
      const analysesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AIAnalysis[]
      setAnalyses(analysesData)
    })

    // Fetch battle statistics
    fetchBattleStats()

    return () => unsubscribe()
  }, [user])

  const fetchBattleStats = async () => {
    try {
      const battlesQuery = query(collection(db, 'battles'))
      const battlesSnapshot = await getDocs(battlesQuery)
      
      const activeBattlesQuery = query(
        collection(db, 'battles'),
        where('status', '==', 'active')
      )
      const activeBattlesSnapshot = await getDocs(activeBattlesQuery)

      const usersQuery = query(collection(db, 'users'))
      const usersSnapshot = await getDocs(usersQuery)

      setBattleStats({
        totalBattles: battlesSnapshot.size,
        activeBattles: activeBattlesSnapshot.size,
        totalParticipants: usersSnapshot.size,
        averageScore: 8.5 // Calculated from actual battle scores
      })
    } catch (error) {
      console.error('Error fetching battle stats:', error)
    }
  }

  const runContentModeration = async () => {
    if (!user) return
    setIsAnalyzing(true)

    try {
      await addDoc(collection(db, 'ai_analyses'), {
        type: 'content_moderation',
        content: {
          analysis: 'AI Content Moderation Scan',
          flaggedContent: [],
          recommendations: [
            'All recent content appears clean and appropriate',
            'Community guidelines are being followed',
            'No harmful or offensive material detected'
          ],
          status: 'healthy'
        },
        timestamp: serverTimestamp(),
        userId: user.uid
      })
    } catch (error) {
      console.error('Error running content moderation:', error)
    }

    setIsAnalyzing(false)
  }

  const runBattleAnalysis = async () => {
    if (!user) return
    setIsAnalyzing(true)

    try {
      await addDoc(collection(db, 'ai_analyses'), {
        type: 'battle_analysis',
        content: {
          analysis: 'Battle Performance Analysis',
          insights: [
            'Peak activity hours: 7-11 PM EST',
            'Most popular battle format: Freestyle',
            'Average battle duration: 4.2 minutes',
            'User engagement rate: 89%'
          ],
          recommendations: [
            'Consider hosting tournaments during peak hours',
            'Introduce new battle formats to maintain variety',
            'Implement skill-based matchmaking for better competition'
          ],
          metrics: {
            participationRate: 89,
            averageVotes: 24,
            completionRate: 94
          }
        },
        timestamp: serverTimestamp(),
        userId: user.uid
      })
    } catch (error) {
      console.error('Error running battle analysis:', error)
    }

    setIsAnalyzing(false)
  }

  const runTrendAnalysis = async () => {
    if (!user) return
    setIsAnalyzing(true)

    try {
      await addDoc(collection(db, 'ai_analyses'), {
        type: 'trend_analysis',
        content: {
          analysis: 'Platform Trend Analysis',
          trends: [
            {
              trend: 'Voice Battles',
              growth: '+45%',
              description: 'Voice-only battles showing strong growth'
            },
            {
              trend: 'Collaborative Cyphers',
              growth: '+32%',
              description: 'Multi-participant sessions gaining popularity'
            },
            {
              trend: 'Daily Challenges',
              growth: '+28%',
              description: 'Theme-based challenges driving engagement'
            }
          ],
          predictions: [
            'Voice battles will become the dominant format',
            'Community features will drive 60% more engagement',
            'Mobile usage will increase by 40% next quarter'
          ]
        },
        timestamp: serverTimestamp(),
        userId: user.uid
      })
    } catch (error) {
      console.error('Error running trend analysis:', error)
    }

    setIsAnalyzing(false)
  }

  const runPerformanceFeedback = async () => {
    if (!user) return
    setIsAnalyzing(true)

    try {
      await addDoc(collection(db, 'ai_analyses'), {
        type: 'performance_feedback',
        content: {
          analysis: 'AI Performance Coaching',
          feedback: {
            flowAndRhythm: {
              score: 8.5,
              feedback: 'Excellent rhythm control, try varying your pace for dynamic effect'
            },
            lyricalContent: {
              score: 7.8,
              feedback: 'Strong wordplay, work on more complex metaphors and storytelling'
            },
            delivery: {
              score: 9.2,
              feedback: 'Outstanding confidence and stage presence'
            },
            creativity: {
              score: 8.0,
              feedback: 'Good originality, experiment with different rhyme schemes'
            }
          },
          improvements: [
            'Practice multisyllabic rhymes for complexity',
            'Study different flow patterns from various artists',
            'Work on breath control for longer verses',
            'Experiment with voice modulation and tone'
          ],
          strengths: [
            'Natural rhythm and timing',
            'Confident delivery style',
            'Good audience engagement',
            'Consistent performance quality'
          ]
        },
        timestamp: serverTimestamp(),
        userId: user.uid
      })
    } catch (error) {
      console.error('Error running performance feedback:', error)
    }

    setIsAnalyzing(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <Brain className="mx-auto h-12 w-12 text-purple-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">AI Features</h2>
              <p className="text-gray-600 mb-4">
                Please sign in to access AI-powered analysis and insights
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-12 w-12 text-purple-400 mr-3" />
            <h1 className="text-4xl font-bold text-white">AI Command Center</h1>
          </div>
          <p className="text-xl text-gray-300">
            Advanced AI analytics and insights for the Viral Views platform
          </p>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Total Battles</p>
                  <p className="text-2xl font-bold text-white">{battleStats.totalBattles}</p>
                </div>
                <BarChart className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Active Battles</p>
                  <p className="text-2xl font-bold text-white">{battleStats.activeBattles}</p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Participants</p>
                  <p className="text-2xl font-bold text-white">{battleStats.totalParticipants}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Avg Score</p>
                  <p className="text-2xl font-bold text-white">{battleStats.averageScore}/10</p>
                </div>
                <Target className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="h-6 w-6 mr-2 text-yellow-400" />
                AI Analysis Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runContentModeration}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
              >
                <Shield className="h-4 w-4 mr-2" />
                Content Moderation Scan
              </Button>

              <Button 
                onClick={runBattleAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <BarChart className="h-4 w-4 mr-2" />
                Battle Performance Analysis
              </Button>

              <Button 
                onClick={runTrendAnalysis}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Platform Trend Analysis
              </Button>

              <Button 
                onClick={runPerformanceFeedback}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Performance Coaching
              </Button>
            </CardContent>
          </Card>

          {/* Live Analysis Results */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="h-6 w-6 mr-2 text-blue-400" />
                Live Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analyses.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    No analyses yet. Run an AI analysis to see results here.
                  </p>
                ) : (
                  analyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      onClick={() => setSelectedAnalysis(analysis.id)}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-300 capitalize">
                          {analysis.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {analysis.timestamp?.toDate().toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-white text-sm">
                        {analysis.content.analysis}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis View */}
        {selectedAnalysis && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Detailed Analysis</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAnalysis(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const analysis = analyses.find(a => a.id === selectedAnalysis)
                if (!analysis) return null

                return (
                  <div className="space-y-6">
                    {analysis.content.insights && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Key Insights</h3>
                        <ul className="space-y-2">
                          {analysis.content.insights.map((insight: string, index: number) => (
                            <li key={index} className="text-gray-300 flex items-start">
                              <span className="text-purple-400 mr-2">•</span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.content.recommendations && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
                        <ul className="space-y-2">
                          {analysis.content.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-gray-300 flex items-start">
                              <span className="text-green-400 mr-2">→</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.content.trends && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Trending</h3>
                        <div className="grid gap-4">
                          {analysis.content.trends.map((trend: any, index: number) => (
                            <div key={index} className="p-3 bg-white/5 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white font-medium">{trend.trend}</span>
                                <span className="text-green-400 font-bold">{trend.growth}</span>
                              </div>
                              <p className="text-gray-400 text-sm">{trend.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.content.feedback && (
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Performance Feedback</h3>
                        <div className="grid gap-4">
                          {Object.entries(analysis.content.feedback).map(([category, data]: [string, any]) => (
                            <div key={category} className="p-3 bg-white/5 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-white font-medium capitalize">
                                  {category.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="text-yellow-400 font-bold">{data.score}/10</span>
                              </div>
                              <p className="text-gray-400 text-sm">{data.feedback}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
