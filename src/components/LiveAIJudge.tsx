'use client'

import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import { 
  doc, 
  onSnapshot, 
  updateDoc,
  collection,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Brain, 
  Zap, 
  Star, 
  TrendingUp, 
  Target,
  Award,
  BarChart,
  Sparkles,
  Mic
} from 'lucide-react'
import { analyzeBattlePerformance } from '@/lib/ai-client'

interface BattleParticipant {
  id: string
  name: string
  performance?: string
  audioUrl?: string
  submission?: any
}

interface AIJudgment {
  participant1: {
    name: string
    scores: {
      flow_rhythm: number
      lyrical_content: number
      wordplay: number
      delivery: number
      creativity: number
      crowd_appeal: number
    }
    total_score: number
    strengths: string[]
    improvements: string[]
  }
  participant2: {
    name: string
    scores: {
      flow_rhythm: number
      lyrical_content: number
      wordplay: number
      delivery: number
      creativity: number
      crowd_appeal: number
    }
    total_score: number
    strengths: string[]
    improvements: string[]
  }
  winner: string
  margin: string
  reasoning: string
  battle_highlights: string[]
  overall_assessment: string
}

interface LiveAIJudgeProps {
  battleId: string
  participants: BattleParticipant[]
  onJudgmentComplete?: (judgment: AIJudgment) => void
}

export default function LiveAIJudge({ battleId, participants, onJudgmentComplete }: LiveAIJudgeProps) {
  const [user] = useAuthState(auth)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [judgment, setJudgment] = useState<AIJudgment | null>(null)
  const [individualAnalyses, setIndividualAnalyses] = useState<any[]>([])
  const [showDetails, setShowDetails] = useState(false)

  const runAIJudgment = async () => {
    if (!user || participants.length < 2) return
    
    setIsAnalyzing(true)
    
    try {
      const participant1 = participants[0]
      const participant2 = participants[1]
      
      // Get performances
      const performance1 = participant1.performance || participant1.submission?.text || '[Audio submission]'
      const performance2 = participant2.performance || participant2.submission?.text || '[Audio submission]'
      
      // Generate AI judgment
      const judgeResult = await analyzeBattlePerformance(
        `${participant1.name} vs ${participant2.name}`,
        `Participant 1 (${participant1.name}): ${performance1}\n\nParticipant 2 (${participant2.name}): ${performance2}`,
        { battleId, battleContext: 'live_competition' }
      )
      
      if (judgeResult.judgment) {
        // Parse the AI response
        try {
          const parsedJudgment = JSON.parse(judgeResult.judgment || '{}') as AIJudgment
          setJudgment(parsedJudgment)
          
          // Save to database
          await addDoc(collection(db, 'ai_judgments'), {
            battleId,
            judgment: parsedJudgment,
            participants: participants.map(p => ({ id: p.id, name: p.name })),
            timestamp: serverTimestamp(),
            judgedBy: user.uid
          })
          
          // Update battle with AI results
          await updateDoc(doc(db, 'battles', battleId), {
            aiJudgment: parsedJudgment,
            aiJudgedAt: serverTimestamp()
          })
          
          if (onJudgmentComplete) {
            onJudgmentComplete(parsedJudgment)
          }
          
        } catch (parseError) {
          console.error('Error parsing AI judgment:', parseError)
        }
      }
      
    } catch (error) {
      console.error('Error running AI judgment:', error)
    }
    
    setIsAnalyzing(false)
  }

  const runIndividualAnalysis = async (participant: BattleParticipant) => {
    if (!user) return
    
    try {
      const performance = participant.performance || participant.submission?.text || ''
      const audioUrl = participant.audioUrl || participant.submission?.audioUrl
      
      const analysisResult = await analyzeBattlePerformance(
        participant.name,
        performance,
        { battleId, participantId: participant.id, analysisType: 'individual' }
      )
      
      if (analysisResult.judgment) {
        const parsedAnalysis = JSON.parse(analysisResult.judgment || '{}')
        
        setIndividualAnalyses(prev => [
          ...prev.filter(a => a.participantId !== participant.id),
          {
            participantId: participant.id,
            participantName: participant.name,
            analysis: parsedAnalysis,
            timestamp: new Date().toISOString()
          }
        ])
      }
      
    } catch (error) {
      console.error('Error analyzing individual performance:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-400'
    if (score >= 7) return 'text-yellow-400'
    if (score >= 5) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* AI Judge Controls */}
      <Card className="bg-white/10 backdrop-blur-md border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="h-6 w-6 mr-2 text-purple-400" />
            AI Battle Judge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={runAIJudgment}
              disabled={isAnalyzing || participants.length < 2}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isAnalyzing ? 'Analyzing Battle...' : 'Judge Battle'}
            </Button>
            
            {participants.map((participant) => (
              <Button
                key={participant.id}
                onClick={() => runIndividualAnalysis(participant)}
                variant="outline"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Target className="h-4 w-4 mr-1" />
                Analyze {participant.name}
              </Button>
            ))}
          </div>
          
          {participants.length < 2 && (
            <p className="text-gray-400 text-sm">
              Need at least 2 participants to run AI judgment
            </p>
          )}
        </CardContent>
      </Card>

      {/* AI Judgment Results */}
      {judgment && (
        <Card className="bg-white/10 backdrop-blur-md border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center">
                <Award className="h-6 w-6 mr-2 text-yellow-400" />
                AI Judgment Results
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-400 hover:text-white"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Winner Announcement */}
            <div className="text-center p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
              <h3 className="text-2xl font-bold text-white mb-2">
                🏆 Winner: {judgment.winner}
              </h3>
              <p className="text-gray-300 mb-4">{judgment.reasoning}</p>
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">{judgment.participant1.name}</p>
                  <p className={`text-2xl font-bold ${getScoreColor(judgment.participant1.total_score)}`}>
                    {judgment.participant1.total_score.toFixed(1)}
                  </p>
                </div>
                <div className="text-2xl text-gray-400">VS</div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-white">{judgment.participant2.name}</p>
                  <p className={`text-2xl font-bold ${getScoreColor(judgment.participant2.total_score)}`}>
                    {judgment.participant2.total_score.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            {/* Battle Highlights */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                Battle Highlights
              </h4>
              <ul className="space-y-2">
                {judgment.battle_highlights.map((highlight, index) => (
                  <li key={index} className="text-gray-300 flex items-start">
                    <span className="text-yellow-400 mr-2">★</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Scores */}
            {showDetails && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[judgment.participant1, judgment.participant2].map((participant) => (
                  <div key={participant.name} className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">{participant.name}</h4>
                    
                    {/* Score Breakdown */}
                    <div className="space-y-2">
                      {Object.entries(participant.scores).map(([category, score]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-gray-300 capitalize text-sm">
                            {category.replace('_', ' ')}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  score >= 8 ? 'bg-green-400' :
                                  score >= 6 ? 'bg-yellow-400' :
                                  score >= 4 ? 'bg-orange-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${(score / 10) * 100}%` }}
                              />
                            </div>
                            <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                              {score.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Strengths */}
                    <div>
                      <p className="text-sm font-medium text-green-300 mb-1">Strengths:</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {participant.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-400 mr-1">+</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div>
                      <p className="text-sm font-medium text-blue-300 mb-1">Areas for Improvement:</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {participant.improvements.map((improvement, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-400 mr-1">→</span>
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Overall Assessment */}
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-2">Overall Assessment</h4>
              <p className="text-gray-300">{judgment.overall_assessment}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Analyses */}
      {individualAnalyses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <BarChart className="h-6 w-6 mr-2 text-blue-400" />
            Individual Performance Analysis
          </h3>
          
          {individualAnalyses.map((analysis) => (
            <Card key={analysis.participantId} className="bg-white/10 backdrop-blur-md border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Mic className="h-5 w-5 mr-2 text-blue-400" />
                  {analysis.participantName} - Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Technical Analysis */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Technical Skills</h4>
                    <div className="space-y-2">
                      {Object.entries(analysis.analysis.technical_analysis).map(([skill, score]: [string, any]) => (
                        <div key={skill} className="flex justify-between items-center">
                          <span className="text-gray-300 capitalize text-sm">
                            {skill.replace('_', ' ')}
                          </span>
                          <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                            {score}/10
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Artistic Elements */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Artistic Elements</h4>
                    <div className="space-y-2">
                      {Object.entries(analysis.analysis.artistic_elements).map(([element, score]: [string, any]) => (
                        <div key={element} className="flex justify-between items-center">
                          <span className="text-gray-300 capitalize text-sm">
                            {element.replace('_', ' ')}
                          </span>
                          <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                            {score}/10
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Overall Grade */}
                <div className="text-center p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
                  <p className="text-sm text-gray-300 mb-1">Overall Grade</p>
                  <p className="text-3xl font-bold text-white">{analysis.analysis.overall_grade}</p>
                  <p className="text-sm text-gray-300 capitalize">{analysis.analysis.performance_type} Level</p>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">AI Recommendations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-yellow-300 mb-2">Technical Improvements:</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {analysis.analysis.recommendations.technical_improvements.map((tip: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-yellow-400 mr-1">⚡</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-300 mb-2">Artistic Development:</p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {analysis.analysis.recommendations.artistic_development.map((tip: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-purple-400 mr-1">🎨</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
