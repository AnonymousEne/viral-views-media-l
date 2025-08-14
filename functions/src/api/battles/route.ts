import { NextRequest, NextResponse } from 'next/server'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { battleCreateSchema } from '@/lib/validation'
import { rateLimit } from '@/lib/rate-limiter'
import { captureException, addBreadcrumb } from '@/lib/monitoring'
import { verifyAuthToken } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request, 'api')
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Verify authentication
    const user = await verifyAuthToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    addBreadcrumb({
      message: 'Battle creation attempt',
      category: 'battles',
      data: { userId: user.uid }
    })

    // Parse and validate request body
    const body = await request.json()
    const validationResult = battleCreateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { title, description, maxParticipants, timeLimit, isPrivate } = validationResult.data

    // Create battle document
    const battleRef = await addDoc(collection(db, 'battles'), {
      title,
      description,
      maxParticipants,
      timeLimit,
      isPublic: !isPrivate, // Convert isPrivate to isPublic
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      status: 'open',
      participants: [user.uid],
      rounds: [],
      winner: null,
      stats: {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0
      }
    })

    addBreadcrumb({
      message: 'Battle created successfully',
      category: 'battles',
      data: { userId: user.uid, battleId: battleRef.id }
    })

    return NextResponse.json({
      success: true,
      battleId: battleRef.id,
      battle: {
        id: battleRef.id,
        title,
        description,
        maxParticipants,
        timeLimit,
        isPublic: !isPrivate,
        createdBy: user.uid,
        status: 'open',
        participants: [user.uid]
      }
    })

  } catch (error) {
    captureException(error)
    
    return NextResponse.json(
      { error: 'Failed to create battle' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting for read operations
    const rateLimitResult = await rateLimit(request, 'api')
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // For now, return a simple response
    // In a full implementation, this would fetch battles from Firestore
    return NextResponse.json({
      battles: [],
      total: 0,
      page: 1,
      hasMore: false
    })

  } catch (error) {
    captureException(error)
    
    return NextResponse.json(
      { error: 'Failed to fetch battles' },
      { status: 500 }
    )
  }
}
