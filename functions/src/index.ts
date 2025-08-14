import { onRequest } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin
initializeApp()

// Auth functions
export const authSignIn = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { email, password } = req.body
    
    // In production, you would implement proper authentication
    // For now, return a success response
    res.status(200).json({ 
      success: true, 
      message: 'Sign in endpoint ready - implement with your auth logic' 
    })
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
})

export const authSignUp = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { email, password, displayName, username } = req.body
    
    // In production, you would implement proper user creation
    res.status(200).json({ 
      success: true, 
      message: 'Sign up endpoint ready - implement with your auth logic' 
    })
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ error: 'User creation failed' })
  }
})

// Battles functions
export const battlesCreate = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const db = getFirestore()
    const { title, description, maxParticipants } = req.body
    
    const battleRef = await db.collection('battles').add({
      title,
      description,
      maxParticipants: maxParticipants || 2,
      participants: [],
      status: 'waiting',
      createdAt: new Date(),
      createdBy: 'system' // In production, get from auth token
    })

    res.status(201).json({ 
      success: true, 
      battleId: battleRef.id 
    })
  } catch (error) {
    console.error('Battle creation error:', error)
    res.status(500).json({ error: 'Failed to create battle' })
  }
})

export const battlesGet = onRequest(async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const db = getFirestore()
    const battlesSnapshot = await db.collection('battles')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get()

    const battles = battlesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    res.status(200).json({ battles })
  } catch (error) {
    console.error('Battles fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch battles' })
  }
})

// Media functions
export const mediaUpload = onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const db = getFirestore()
    const { title, description, category, privacy } = req.body
    
    const mediaRef = await db.collection('media').add({
      title,
      description,
      category: category || 'other',
      privacy: privacy || 'public',
      uploadedAt: new Date(),
      userId: 'system' // In production, get from auth token
    })

    res.status(201).json({ 
      success: true, 
      mediaId: mediaRef.id 
    })
  } catch (error) {
    console.error('Media upload error:', error)
    res.status(500).json({ error: 'Failed to upload media' })
  }
})

export const mediaGet = onRequest(async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const db = getFirestore()
    const mediaSnapshot = await db.collection('media')
      .where('privacy', '==', 'public')
      .orderBy('uploadedAt', 'desc')
      .limit(20)
      .get()

    const media = mediaSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    res.status(200).json({ media })
  } catch (error) {
    console.error('Media fetch error:', error)
    res.status(500).json({ error: 'Failed to fetch media' })
  }
})

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
