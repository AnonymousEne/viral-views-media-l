'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@/types/firebase'

// Backend API client
class ViralViewsAPIClient {
  private baseUrl: string = ''

  async call(endpoint: string, method = 'GET', body: any = null) {
    try {
      // Use the client-side API we deployed
      if (typeof window !== 'undefined' && (window as any).ViralViewsAPI) {
        return await (window as any).ViralViewsAPI.call(endpoint, method, body)
      }
      
      // Fallback for server-side rendering
      return {
        success: false,
        error: 'API not available'
      }
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      }
    }
  }

  async signIn(email: string, password: string) {
    return this.call('auth/signin', 'POST', { email, password })
  }

  async signUp(email: string, password: string, displayName: string) {
    return this.call('auth/signup', 'POST', { email, password, displayName })
  }
}

const apiClient = new ViralViewsAPIClient()

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string, username: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithTwitter: () => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (updates: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load user from localStorage on mount
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('viralviews_user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const result = await apiClient.signIn(email, password)
      
      if (result.success && result.user) {
        const userData: User = {
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.name || result.user.email.split('@')[0],
          username: result.user.name || result.user.email.split('@')[0],
          avatar: '',
          followers: 0,
          following: 0,
          battleStats: {
            wins: 0,
            losses: 0,
            draws: 0,
            totalBattles: 0
          },
          createdAt: new Date(),
          verified: false
        }
        
        setUser(userData)
        localStorage.setItem('viralviews_user', JSON.stringify(userData))
      } else {
        throw new Error(result.error || 'Sign in failed')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, displayName: string, username: string) => {
    try {
      setLoading(true)
      const result = await apiClient.signUp(email, password, displayName)
      
      if (result.success && result.user) {
        const userData: User = {
          id: result.user.id,
          email: result.user.email,
          displayName: result.user.displayName || displayName,
          username: username,
          avatar: '',
          followers: 0,
          following: 0,
          battleStats: {
            wins: 0,
            losses: 0,
            draws: 0,
            totalBattles: 0
          },
          createdAt: new Date(),
          verified: false
        }
        
        setUser(userData)
        localStorage.setItem('viralviews_user', JSON.stringify(userData))
      } else {
        throw new Error(result.error || 'Sign up failed')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      // Mock Google sign in for now
      const mockUser: User = {
        id: Date.now().toString(),
        email: 'google@example.com',
        displayName: 'Google User',
        username: 'googleuser',
        avatar: '',
        followers: 0,
        following: 0,
        battleStats: {
          wins: 0,
          losses: 0,
          draws: 0,
          totalBattles: 0
        },
        createdAt: new Date(),
        verified: false
      }
      
      setUser(mockUser)
      localStorage.setItem('viralviews_user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInWithTwitter = async () => {
    try {
      setLoading(true)
      // Mock Twitter sign in for now
      const mockUser: User = {
        id: Date.now().toString(),
        email: 'twitter@example.com',
        displayName: 'Twitter User',
        username: 'twitteruser',
        avatar: '',
        followers: 0,
        following: 0,
        battleStats: {
          wins: 0,
          losses: 0,
          draws: 0,
          totalBattles: 0
        },
        createdAt: new Date(),
        verified: false
      }
      
      setUser(mockUser)
      localStorage.setItem('viralviews_user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('Twitter sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setUser(null)
      localStorage.removeItem('viralviews_user')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const updateUserProfile = async (updates: Partial<User>) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('viralviews_user', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithTwitter,
    logout,
    updateUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
