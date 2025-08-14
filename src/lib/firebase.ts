import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: "AIzaSyAlkLFh7sURRxD2YsgOpSujv7dGYZNCT4I",
  authDomain: "viralviews-m802a.firebaseapp.com",
  projectId: "viralviews-m802a",
  storageBucket: "viralviews-m802a.firebasestorage.app",
  messagingSenderId: "431053619338",
  appId: "1:431053619338:web:11b34d9d365ed172602d73",
  measurementId: "G-044M10846B"
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)

export { app }
export default app
