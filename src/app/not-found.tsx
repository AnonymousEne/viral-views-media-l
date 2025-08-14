'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/10 backdrop-blur-md border-gray-500/20">
        <CardHeader className="text-center">
          <div className="text-6xl font-bold text-purple-400 mb-4">404</div>
          <CardTitle className="text-white text-2xl">
            Battle Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-300">
            Looks like this page got dropped from the cypher. The content you're looking for might have been moved or doesn't exist.
          </p>
          
          <div className="space-y-3 pt-4">
            <Link href="/" className="block">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            
            <Link href="/battles" className="block">
              <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Search className="h-4 w-4 mr-2" />
                Browse Battles
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-600">
            <p className="text-gray-400 text-sm">
              Lost in the verse? Check out our popular sections:
            </p>
            <div className="flex justify-center gap-4 mt-2 text-sm">
              <Link href="/battles" className="text-purple-400 hover:text-purple-300">
                Battles
              </Link>
              <Link href="/cypher-test" className="text-purple-400 hover:text-purple-300">
                Cyphers
              </Link>
              <Link href="/profile" className="text-purple-400 hover:text-purple-300">
                Profile
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
