import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import BetaNotice from '@/components/BetaNotice'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Viral Views - Hip-Hop Competition Platform (Beta)',
  description: 'AI-powered rap battles, cypher analysis, and community features - Now in Beta!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="/api.js" async></script>
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <BetaNotice />
            <Navbar />
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
