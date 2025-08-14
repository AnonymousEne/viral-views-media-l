import { NextRequest, NextResponse } from 'next/server'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { signInSchema } from '@/lib/validation'
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
      message: 'Sign in attempt',
      category: 'auth'
    })

    // Parse and validate request body
    const body = await request.json()
    const validationResult = signInSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { email, password } = validationResult.data

    // Attempt to sign in
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const idToken = await userCredential.user.getIdToken()

    // Set auth cookie
    const response = NextResponse.json({
      success: true,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
      }
    })

    // Set secure httpOnly cookie with the ID token
    response.cookies.set('auth-token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    addBreadcrumb({
      message: 'Sign in successful',
      category: 'auth',
      data: { uid: userCredential.user.uid }
    })
    
    return response

  } catch (error) {
    captureException(error)
    
    if (error instanceof Error) {
      // Handle specific Firebase auth errors
      if (error.message.includes('auth/user-not-found') || 
          error.message.includes('auth/wrong-password') ||
          error.message.includes('auth/invalid-credential')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      if (error.message.includes('auth/too-many-requests')) {
        return NextResponse.json(
          { error: 'Too many failed attempts. Please try again later.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
