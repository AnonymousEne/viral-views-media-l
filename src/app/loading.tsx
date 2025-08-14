import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Mic } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="max-w-sm w-full bg-white/10 backdrop-blur-md border-purple-500/20">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Mic className="h-12 w-12 text-purple-400" />
              <Loader2 className="h-6 w-6 text-pink-400 absolute -top-1 -right-1 animate-spin" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">
            Loading Viral Views
          </h2>
          
          <p className="text-gray-300 text-sm mb-6">
            Preparing your hip-hop battle experience...
          </p>
          
          {/* Animated loading bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
          </div>
          
          <p className="text-gray-400 text-xs mt-4">
            This may take a moment
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
