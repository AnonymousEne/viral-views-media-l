# 🔥 Firebase Production Environment Setup Guide

## Prerequisites

1. **Firebase CLI installed** ✅ (v14.11.1 - Installed!)
2. **Google Cloud Project created**
3. **Firebase project created**

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Project name: `viral-views-production`
4. Enable Google Analytics (recommended)
5. Select or create a Google Analytics account

## Step 2: Enable Firebase Services

### Authentication
1. In Firebase Console → Authentication → Sign-in method
2. Enable the following providers:
   - ✅ Email/Password
   - ✅ Google
   - ✅ Twitter
   - Add authorized domains: `localhost`, `your-domain.com`

### Firestore Database
1. In Firebase Console → Firestore Database
2. Click "Create database"
3. Start in **production mode**
4. Choose location: `us-central1` (or closest to your users)

### Storage
1. In Firebase Console → Storage
2. Click "Get started"
3. Start in **production mode**
4. Choose same location as Firestore

### Functions (Optional - for advanced features)
1. In Firebase Console → Functions
2. Click "Get started"
3. Upgrade to Blaze plan (pay-as-you-go)

## Step 3: Get Firebase Configuration

### Web App Configuration
1. In Firebase Console → Project settings → General
2. Click "Add app" → Web (</>) 
3. App nickname: `viral-views-web`
4. Enable Firebase Hosting: ✅
5. Copy the configuration object

### Service Account Key (Admin SDK)
1. In Firebase Console → Project settings → Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. **Keep this file secure!** Never commit to version control

## Step 4: Update Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Firebase config:

```env
# Firebase Client Configuration (Web)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_from_firebase_config
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"

# Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Viral Views
```

## Step 5: Deploy Security Rules

```bash
# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init

# Deploy security rules
firebase deploy --only firestore:rules,storage:rules
```

## Step 6: Configure Firebase Project

Update `.firebaserc` with your project ID:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

## Step 7: Test the Setup

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Test authentication:**
   - Click "Join Now" in the navbar
   - Try signing up with email/password
   - Try Google/Twitter sign-in

3. **Check Firestore:**
   - Go to Firebase Console → Firestore
   - Verify user documents are created in `/users` collection

4. **Test real-time features:**
   - Open the app in multiple tabs
   - Changes should sync in real-time

## Step 8: Production Deployment

### Option A: Firebase Hosting
```bash
npm run build
npm run export  # For static export
firebase deploy --only hosting
```

### Option B: Vercel/Netlify
```bash
npm run build
# Follow your hosting provider's deployment guide
```

### Option C: Google Cloud Run
```bash
# Build Docker image
docker build -t viral-views .

# Deploy to Cloud Run
gcloud run deploy viral-views \
  --image viral-views \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Security Checklist

- [ ] Firebase Security Rules deployed
- [ ] Environment variables secured
- [ ] Service account key not committed to Git
- [ ] CORS configured for your domain
- [ ] Rate limiting enabled
- [ ] Monitoring and alerts set up

## Monitoring & Analytics

1. **Firebase Analytics:** Already enabled ✅
2. **Performance Monitoring:** Enable in Firebase Console
3. **Error Tracking:** Add Sentry or similar
4. **Uptime Monitoring:** Add monitoring service

## Cost Optimization

1. **Firestore:** Use composite indexes efficiently
2. **Storage:** Implement file size limits
3. **Functions:** Optimize cold starts
4. **Bandwidth:** Use CDN for static assets

## Next Steps After Setup

1. ✅ **Phase 1 Complete:** Firebase Production Environment
2. 🔄 **Phase 2:** Real-time Battle System
3. 🔄 **Phase 3:** Video Streaming Infrastructure
4. 🔄 **Phase 4:** Payment Integration
5. 🔄 **Phase 5:** Content Moderation

---

## Need Help?

- **Firebase Documentation:** https://firebase.google.com/docs
- **Support:** Check GitHub issues or create new ones
- **Community:** Join our Discord for real-time help

**Ready to battle? 🎤⚔️**
