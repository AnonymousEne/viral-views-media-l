'use client'

import { Navbar } from '@/components/Navbar'
import { VideoCard } from '@/components/VideoCard'
import { BattleRoom } from '@/components/BattleRoom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, Zap, Crown } from 'lucide-react'

// Mock data
const trendingVideos = [
  {
    id: '1',
    title: 'Epic Rap Battle: MC Flow vs. Rhythm King',
    creator: 'MC Flow',
    thumbnail: 'https://picsum.photos/400/300?random=1',
    views: 25000,
    likes: 1500,
    duration: '3:45',
    type: 'battle' as const
  },
  {
    id: '2', 
    title: 'Underground Cypher Session #47',
    creator: 'DJ Beats',
    thumbnail: 'https://picsum.photos/400/300?random=2',
    views: 18000,
    likes: 890,
    duration: '12:30',
    type: 'cypher' as const
  },
  {
    id: '3',
    title: 'Freestyle Friday: Street Poetry',
    creator: 'Wordsmith',
    thumbnail: 'https://picsum.photos/400/300?random=3', 
    views: 42000,
    likes: 2100,
    duration: '2:15',
    type: 'freestyle' as const
  }
]

const liveBattles = [
  {
    id: '1',
    title: 'Championship Finals',
    participants: ['RapMaster', 'VerseKing'],
    spectators: 1200,
    status: 'live' as const,
    round: 3,
    timeLeft: 180
  },
  {
    id: '2',
    title: 'Rookie Battle Arena',
    participants: ['NewcomerMC'],
    spectators: 45,
    status: 'waiting' as const,
    round: 1
  }
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.1M</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Creators</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5K</div>
              <p className="text-xs text-muted-foreground">+8.2% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Battles</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Happening now</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Champions</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Battle winners this month</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trending Videos */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Trending Now</h2>
                <Button variant="outline">View All</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trendingVideos.map((video) => (
                  <VideoCard key={video.id} {...video} />
                ))}
              </div>
            </section>

            {/* Featured Creator */}
            <section>
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardHeader>
                  <CardTitle>Creator Spotlight</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      MC
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">MC FlowMaster</h3>
                      <p className="text-muted-foreground">3x Champion • 500K followers</p>
                      <p className="text-sm mt-2">Known for incredible freestyle skills and lightning-fast wordplay. Currently on a 15-battle win streak!</p>
                    </div>
                    <Button>Follow</Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Battles */}
            <section>
              <h3 className="text-xl font-bold mb-4">Live Battles</h3>
              <div className="space-y-4">
                {liveBattles.map((battle) => (
                  <BattleRoom key={battle.id} {...battle} />
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">Start a Battle</Button>
                <Button variant="outline" className="w-full">Join Cypher</Button>
                <Button variant="outline" className="w-full">Upload Video</Button>
              </CardContent>
            </Card>

            {/* Top Creators */}
            <Card>
              <CardHeader>
                <CardTitle>Top Creators This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['RapGod', 'VerseQueen', 'FlowNinja', 'WordWizard'].map((creator, index) => (
                    <div key={creator} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{creator}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {(Math.random() * 100).toFixed(1)}K views
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
