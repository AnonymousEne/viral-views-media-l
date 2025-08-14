'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { performanceMonitor } from '@/lib/performance-monitor'

interface PerformanceMetric {
  name: string
  value: number
  category: string
  timestamp: number
  metadata?: Record<string, any>
}

interface SystemHealth {
  apiResponseTime: number
  errorRate: number
  activeUsers: number
  memoryUsage: number
  uptime: number
  lastUpdated: Date
}

export default function PerformanceDashboard() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    apiResponseTime: 0,
    errorRate: 0,
    activeUsers: 0,
    memoryUsage: 0,
    uptime: 0,
    lastUpdated: new Date()
  })
  const [isMonitoring, setIsMonitoring] = useState(false)

  // Check if user has admin access
  const isAdmin = user?.email?.includes('admin') || false

  useEffect(() => {
    if (!isAdmin) return

    // Start performance monitoring
    setIsMonitoring(true)

    // Simulate real-time metrics collection
    const interval = setInterval(() => {
      // Collect current metrics from performance monitor
      const currentMetrics = performanceMonitor.getMetrics()
      setMetrics(currentMetrics.slice(-50)) // Keep last 50 metrics

      // Simulate system health data
      setSystemHealth({
        apiResponseTime: Math.random() * 200 + 50, // 50-250ms
        errorRate: Math.random() * 2, // 0-2%
        activeUsers: Math.floor(Math.random() * 500 + 100), // 100-600 users
        memoryUsage: Math.random() * 40 + 30, // 30-70%
        uptime: Date.now() - (Date.now() % (24 * 60 * 60 * 1000)), // Since midnight
        lastUpdated: new Date()
      })
    }, 2000)

    return () => {
      clearInterval(interval)
      setIsMonitoring(false)
    }
  }, [isAdmin])

  const startPerformanceTest = () => {
    // Simulate various performance operations
    const operations = [
      'API Call - Get Battles',
      'API Call - Get User Profile', 
      'Database Query - Recent Media',
      'Storage Upload - Simulation',
      'AI Processing - Mock Analysis'
    ]

    operations.forEach((operation, index) => {
      setTimeout(() => {
        const timing = performanceMonitor.startTiming(operation)
        
        // Simulate operation duration
        setTimeout(() => {
          timing.end()
        }, Math.random() * 1000 + 100)
      }, index * 500)
    })
  }

  const getMetricsByCategory = (category: string) => {
    return metrics.filter(m => m.category === category)
  }

  const getAverageValue = (categoryMetrics: PerformanceMetric[]) => {
    if (categoryMetrics.length === 0) return 0
    return categoryMetrics.reduce((sum, m) => sum + m.value, 0) / categoryMetrics.length
  }

  const getHealthStatus = (value: number, thresholds: {good: number, warning: number}) => {
    if (value <= thresholds.good) return { status: 'good', color: 'text-green-400' }
    if (value <= thresholds.warning) return { status: 'warning', color: 'text-yellow-400' }
    return { status: 'critical', color: 'text-red-400' }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Card className="p-8 bg-gray-800 border-gray-700">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-300">You don't have permission to access the performance dashboard.</p>
        </Card>
      </div>
    )
  }

  const apiMetrics = getMetricsByCategory('api')
  const renderingMetrics = getMetricsByCategory('rendering')
  const userInteractionMetrics = getMetricsByCategory('user_interaction')

  const responseTimeStatus = getHealthStatus(systemHealth.apiResponseTime, {good: 100, warning: 200})
  const errorRateStatus = getHealthStatus(systemHealth.errorRate, {good: 1, warning: 2})
  const memoryStatus = getHealthStatus(systemHealth.memoryUsage, {good: 50, warning: 70})

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <div className="flex space-x-4">
            <Button
              onClick={startPerformanceTest}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Run Performance Test
            </Button>
            <div className={`px-3 py-1 rounded-full text-sm ${isMonitoring ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
              {isMonitoring ? '🟢 Monitoring Active' : '🔴 Monitoring Inactive'}
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-lg font-semibold mb-2">API Response Time</h3>
            <p className={`text-3xl font-bold ${responseTimeStatus.color}`}>
              {systemHealth.apiResponseTime.toFixed(0)}ms
            </p>
            <p className="text-sm text-gray-400 mt-2">Average response time</p>
          </Card>
          
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Error Rate</h3>
            <p className={`text-3xl font-bold ${errorRateStatus.color}`}>
              {systemHealth.errorRate.toFixed(2)}%
            </p>
            <p className="text-sm text-gray-400 mt-2">Error percentage</p>
          </Card>
          
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Active Users</h3>
            <p className="text-3xl font-bold text-blue-400">{systemHealth.activeUsers}</p>
            <p className="text-sm text-gray-400 mt-2">Currently online</p>
          </Card>
          
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Memory Usage</h3>
            <p className={`text-3xl font-bold ${memoryStatus.color}`}>
              {systemHealth.memoryUsage.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-400 mt-2">System memory</p>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-lg font-semibold mb-4">API Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Average Response Time:</span>
                <span className="font-mono">{getAverageValue(apiMetrics).toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Total API Calls:</span>
                <span className="font-mono">{apiMetrics.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Fastest Call:</span>
                <span className="font-mono text-green-400">
                  {apiMetrics.length > 0 ? Math.min(...apiMetrics.map(m => m.value)).toFixed(0) : 0}ms
                </span>
              </div>
              <div className="flex justify-between">
                <span>Slowest Call:</span>
                <span className="font-mono text-red-400">
                  {apiMetrics.length > 0 ? Math.max(...apiMetrics.map(m => m.value)).toFixed(0) : 0}ms
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Rendering Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Average Render Time:</span>
                <span className="font-mono">{getAverageValue(renderingMetrics).toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Total Renders:</span>
                <span className="font-mono">{renderingMetrics.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Web Vitals Count:</span>
                <span className="font-mono text-blue-400">
                  {renderingMetrics.filter(m => m.metadata?.type === 'web_vital').length}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <h3 className="text-lg font-semibold mb-4">User Interactions</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Average Interaction Time:</span>
                <span className="font-mono">{getAverageValue(userInteractionMetrics).toFixed(0)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Total Interactions:</span>
                <span className="font-mono">{userInteractionMetrics.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Fastest Interaction:</span>
                <span className="font-mono text-green-400">
                  {userInteractionMetrics.length > 0 ? Math.min(...userInteractionMetrics.map(m => m.value)).toFixed(0) : 0}ms
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Metrics Log */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Recent Performance Metrics</h3>
          <div className="max-h-96 overflow-y-auto">
            {metrics.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No metrics collected yet. Run a performance test to see data.
              </p>
            ) : (
              <div className="space-y-2">
                {metrics.slice(-20).reverse().map((metric, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700 text-sm">
                    <div className="flex-1">
                      <span className="font-medium">{metric.name}</span>
                      <span className="ml-2 text-gray-400">({metric.category})</span>
                    </div>
                    <div className="flex space-x-4">
                      <span className="font-mono">{metric.value.toFixed(0)}ms</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          Last updated: {systemHealth.lastUpdated.toLocaleString()}
        </div>
      </div>
    </div>
  )
}
