import { NextRequest, NextResponse } from 'next/server'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { signUpSchema } from '@/lib/validation'
import { rateLimit } from '@/lib/rate-limiter'
import { captureException, addBreadcrumb } from '@/lib/monitoring'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, 'auth')
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    addBreadcrumb({
      message: 'Sign up attempt',
      category: 'auth'
    })

    // Parse and validate request body
    const body = await request.json()
    const validationResult = signUpSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { email, password, username, displayName } = validationResult.data

    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update the user's profile
    await updateProfile(user, {
      displayName: displayName
    })

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      username: username,
      displayName: displayName,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      stats: {
        battlesWon: 0,
        battlesLost: 0,
        totalBattles: 0,
        totalViews: 0,
        totalLikes: 0
      },
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        privacy: 'public'
      }
    })

    // Get ID token for authentication
    const idToken = await user.getIdToken()

    // Set auth cookie
    const response = NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        username: username
      }
    })

    response.cookies.set('auth-token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    addBreadcrumb({
      message: 'Sign up successful',
      category: 'auth',
      data: { uid: user.uid, username }
    })
    
    return response

  } catch (error) {
    captureException(error)
    
    if (error instanceof Error) {
      // Handle specific Firebase auth errors
      if (error.message.includes('auth/email-already-in-use')) {
        return NextResponse.json(
          { error: 'Email address is already registered' },
          { status: 409 }
        )
      }

      if (error.message.includes('auth/weak-password')) {
        return NextResponse.json(
          { error: 'Password is too weak' },
          { status: 400 }
        )
      }

      if (error.message.includes('auth/invalid-email')) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
