'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  TwitterAuthProvider
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createUser, getUserById, updateUser } from '@/lib/firestore'
import type { User } from '@/types/firebase'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser)
      
      if (firebaseUser) {
        // Get or create user document
        let userData = await getUserById(firebaseUser.uid)
        
        if (!userData) {
          // Create new user document if it doesn't exist
          await createUser({
            id: firebaseUser.uid,
            username: firebaseUser.email?.split('@')[0] || '',
            displayName: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            avatar: firebaseUser.photoURL || '',
            followers: 0,
            following: 0,
            battleStats: {
              wins: 0,
              losses: 0,
              draws: 0,
              totalBattles: 0,
            },
            verified: false,
            createdAt: new Date()
          })
          userData = await getUserById(firebaseUser.uid)
        }
        
        setUser(userData)
      } else {
        setUser(null)
      }
      
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName: string, username: string) => {
    setLoading(true)
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName })
      
      // Create user document in Firestore
      await createUser({
        id: firebaseUser.uid,
        username,
        displayName,
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL || '',
        followers: 0,
        following: 0,
        battleStats: {
          wins: 0,
          losses: 0,
          draws: 0,
          totalBattles: 0,
        },
        verified: false,
        createdAt: new Date()
      })
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signInWithTwitter = async () => {
    setLoading(true)
    try {
      const provider = new TwitterAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await signOut(auth)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in')
    
    // Update Firestore document
    await updateUser(user.id, updates)
    
    // Update local state
    setUser({ ...user, ...updates })
  }

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithTwitter,
    logout,
    updateUserProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
