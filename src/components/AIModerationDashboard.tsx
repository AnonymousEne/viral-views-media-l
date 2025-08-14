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
  doc,
  updateDoc,
  where,
  getDocs 
} from 'firebase/firestore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Flag,
  Eye,
  UserCheck,
  MessageSquare,
  Mic,
  Clock
} from 'lucide-react'

interface ModerationItem {
  id: string
  type: 'battle' | 'message' | 'profile' | 'audio'
  content: string
  userId: string
  userName: string
  status: 'pending' | 'approved' | 'rejected' | 'flagged'
  aiScore: number
  aiFlags: string[]
  timestamp: any
  reportCount?: number
}

interface ModerationStats {
  pending: number
  approved: number
  rejected: number
  flagged: number
}

export default function AIModerationDashboard() {
  const [user] = useAuthState(auth)
  const [moderationItems, setModerationItems] = useState<ModerationItem[]>([])
  const [stats, setStats] = useState<ModerationStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    flagged: 0
  })
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!user) return

    // Generate mock moderation data for demonstration
    const mockModerationItems: ModerationItem[] = [
      {
        id: '1',
        type: 'battle',
        content: 'Yo, check my flow, I\'m the king of this scene, dropping bars so clean...',
        userId: 'user1',
        userName: 'MCFlow2024',
        status: 'pending',
        aiScore: 0.95,
        aiFlags: [],
        timestamp: { toDate: () => new Date(Date.now() - 300000) },
        reportCount: 0
      },
      {
        id: '2',
        type: 'message',
        content: 'Great battle! That wordplay was insane 🔥',
        userId: 'user2',
        userName: 'BattleFan',
        status: 'approved',
        aiScore: 0.98,
        aiFlags: [],
        timestamp: { toDate: () => new Date(Date.now() - 600000) },
        reportCount: 0
      },
      {
        id: '3',
        type: 'battle',
        content: 'This content has been flagged for review...',
        userId: 'user3',
        userName: 'ProblematicUser',
        status: 'flagged',
        aiScore: 0.25,
        aiFlags: ['inappropriate_language', 'potential_harassment'],
        timestamp: { toDate: () => new Date(Date.now() - 900000) },
        reportCount: 3
      },
      {
        id: '4',
        type: 'profile',
        content: 'Bio: Professional rapper and battle enthusiast from NYC',
        userId: 'user4',
        userName: 'NYCRapper',
        status: 'approved',
        aiScore: 0.92,
        aiFlags: [],
        timestamp: { toDate: () => new Date(Date.now() - 1200000) },
        reportCount: 0
      },
      {
        id: '5',
        type: 'audio',
        content: '[Audio recording - 45 seconds]',
        userId: 'user5',
        userName: 'VocalVirtual',
        status: 'pending',
        aiScore: 0.88,
        aiFlags: ['audio_quality_check'],
        timestamp: { toDate: () => new Date(Date.now() - 1500000) },
        reportCount: 0
      }
    ]

    setModerationItems(mockModerationItems)

    // Calculate stats
    const newStats = mockModerationItems.reduce(
      (acc, item) => {
        acc[item.status as keyof ModerationStats]++
        return acc
      },
      { pending: 0, approved: 0, rejected: 0, flagged: 0 }
    )
    setStats(newStats)
  }, [user])

  const handleModeration = async (itemId: string, action: 'approve' | 'reject' | 'flag') => {
    setIsProcessing(true)
    
    try {
      // Update local state immediately for better UX
      setModerationItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged' }
            : item
        )
      )

      // Update stats
      const item = moderationItems.find(i => i.id === itemId)
      if (item) {
        const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged'
        setStats(prev => ({
          ...prev,
          [item.status]: prev[item.status as keyof ModerationStats] - 1,
          [newStatus]: prev[newStatus as keyof ModerationStats] + 1
        }))
      }

      // In a real app, this would update Firestore
      // await updateDoc(doc(db, 'moderation_queue', itemId), {
      //   status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged',
      //   moderatedBy: user.uid,
      //   moderatedAt: serverTimestamp()
      // })

      console.log(`${action}ed item ${itemId}`)
    } catch (error) {
      console.error('Error moderating content:', error)
    }

    setIsProcessing(false)
  }

  const runAIModeration = async () => {
    setIsProcessing(true)
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Auto-approve high-confidence items
      const autoApprovals = moderationItems.filter(
        item => item.status === 'pending' && item.aiScore > 0.9 && item.aiFlags.length === 0
      )
      
      for (const item of autoApprovals) {
        await handleModeration(item.id, 'approve')
      }
      
      console.log(`Auto-approved ${autoApprovals.length} items`)
    } catch (error) {
      console.error('Error running AI moderation:', error)
    }
    
    setIsProcessing(false)
  }

  const filteredItems = moderationItems.filter(item => {
    if (selectedFilter === 'all') return true
    return item.status === selectedFilter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'flagged':
        return <Flag className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'battle':
        return <Mic className="h-4 w-4 text-purple-400" />
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-400" />
      case 'profile':
        return <UserCheck className="h-4 w-4 text-green-400" />
      case 'audio':
        return <Mic className="h-4 w-4 text-orange-400" />
      default:
        return <Eye className="h-4 w-4 text-gray-400" />
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-purple-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">AI Moderation</h2>
              <p className="text-gray-600 mb-4">
                Admin access required for moderation dashboard
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
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-10 w-10 text-purple-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">AI Moderation Dashboard</h1>
          </div>
          <p className="text-gray-300">
            AI-powered content moderation for safe community experiences
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-yellow-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Pending Review</p>
                  <p className="text-2xl font-bold text-white">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-green-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Approved</p>
                  <p className="text-2xl font-bold text-white">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Rejected</p>
                  <p className="text-2xl font-bold text-white">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300">Flagged</p>
                  <p className="text-2xl font-bold text-white">{stats.flagged}</p>
                </div>
                <Flag className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'flagged', 'approved', 'rejected'].map(filter => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className={`capitalize ${
                  selectedFilter === filter 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>
          
          <Button
            onClick={runAIModeration}
            disabled={isProcessing}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
          >
            <Shield className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Run AI Moderation'}
          </Button>
        </div>

        {/* Moderation Queue */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Moderation Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-400">No items to moderate</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(item.type)}
                        <span className="text-sm font-medium text-purple-300 capitalize">
                          {item.type}
                        </span>
                        {getStatusIcon(item.status)}
                        <span className="text-sm text-gray-400">
                          by {item.userName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">
                          AI Score: {(item.aiScore * 100).toFixed(0)}%
                        </span>
                        <span className="text-xs text-gray-400">
                          {item.timestamp.toDate().toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-white text-sm">
                        {item.content}
                      </p>
                    </div>

                    {item.aiFlags.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-orange-300 mb-1">AI Flags:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.aiFlags.map((flag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded"
                            >
                              {flag.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.reportCount && item.reportCount > 0 && (
                      <div className="mb-3">
                        <span className="text-sm text-red-300">
                          {item.reportCount} user report{item.reportCount > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {item.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleModeration(item.id, 'approve')}
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleModeration(item.id, 'reject')}
                          disabled={isProcessing}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleModeration(item.id, 'flag')}
                          disabled={isProcessing}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          Flag
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
