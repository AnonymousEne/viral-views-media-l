import { NextRequest, NextResponse } from 'next/server'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { mediaUploadSchema } from '@/lib/validation'
import { rateLimit } from '@/lib/rate-limiter'
import { captureException, addBreadcrumb } from '@/lib/monitoring'
import { verifyAuthToken } from '@/lib/auth-helpers'

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for media uploads (more restrictive)
    const rateLimitResult = await rateLimit(request, 'upload')
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many uploads. Please try again later.' },
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
      message: 'Media upload attempt',
      category: 'media',
      data: { userId: user.uid }
    })

    // Parse and validate request body
    const body = await request.json()
    const validationResult = mediaUploadSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { title, description, tags, category, privacy } = validationResult.data

    // For this implementation, we'll assume mediaUrl and mediaType come from file upload
    // In a real app, these would be handled by a separate file upload service
    const mediaUrl = `https://storage.example.com/media/${Date.now()}-${user.uid}`
    const mediaType = category === 'battle' ? 'video' : 'audio'

    // Create media document
    const mediaRef = await addDoc(collection(db, 'media'), {
      title,
      description,
      mediaUrl,
      mediaType,
      category,
      tags: tags || [],
      privacy,
      uploadedBy: user.uid,
      uploadedAt: serverTimestamp(),
      status: 'pending_moderation', // All uploads go through moderation
      moderationStatus: {
        reviewed: false,
        approved: false,
        reviewedAt: null,
        reviewedBy: null,
        reason: null
      },
      stats: {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0
      },
      metadata: {
        fileSize: 0, // Would be set during actual file upload
        duration: 0, // For videos
        dimensions: null // For images/videos
      }
    })

    addBreadcrumb({
      message: 'Media uploaded successfully',
      category: 'media',
      data: { userId: user.uid, mediaId: mediaRef.id }
    })

    return NextResponse.json({
      success: true,
      mediaId: mediaRef.id,
      media: {
        id: mediaRef.id,
        title,
        description,
        mediaUrl,
        mediaType,
        category,
        tags: tags || [],
        privacy,
        uploadedBy: user.uid,
        status: 'pending_moderation'
      }
    })

  } catch (error) {
    captureException(error)
    
    return NextResponse.json(
      { error: 'Failed to upload media' },
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

    // Optional authentication (public endpoint but with different data for authenticated users)
    const user = await verifyAuthToken(request)

    // For now, return a simple response
    // In a full implementation, this would fetch media from Firestore with proper filtering
    return NextResponse.json({
      media: [],
      total: 0,
      page: 1,
      hasMore: false,
      authenticated: !!user
    })

  } catch (error) {
    captureException(error)
    
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}
