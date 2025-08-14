# Firebase Hosting Configuration for Beta

# Beta Release Checklist

## Pre-Deployment Setup
- [ ] Firebase project created and configured
- [ ] Environment variables set in `.env.production`
- [ ] Google AI API enabled and keys configured
- [ ] Domain/custom URL configured (optional)
- [ ] Firebase Authentication methods enabled
- [ ] Firestore security rules updated for production
- [ ] Storage rules configured

## Environment Variables to Set
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI
GEMINI_API_KEY=your_gemini_api_key
```

## Deployment Commands

### Quick Deploy
```bash
npm run beta:deploy
```

### Manual Deploy
```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build for production
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Preview Channel (for testing)
```bash
firebase hosting:channel:deploy beta --expires 30d
```

## Post-Deployment Verification

### Core Features Test
- [ ] User registration works
- [ ] Google authentication works
- [ ] Profile creation and editing
- [ ] Battle creation and joining
- [ ] Cypher sessions functional
- [ ] AI analysis working
- [ ] Real-time features responsive
- [ ] Mobile responsiveness
- [ ] Feedback form accessible

### Performance Check
- [ ] Page load speeds < 3 seconds
- [ ] AI responses < 5 seconds
- [ ] Real-time updates working
- [ ] Image uploads functional
- [ ] Audio/video features working

### Security Verification
- [ ] Authentication required for protected routes
- [ ] Firestore rules enforced
- [ ] Storage rules enforced
- [ ] API keys not exposed in client
- [ ] Content moderation active

## Monitoring Setup

### Analytics
- Set up Google Analytics
- Firebase Analytics enabled
- Error tracking configured

### Alerts
- Firebase hosting alerts
- Firestore usage monitoring
- Storage usage monitoring
- AI API usage tracking

## Beta User Communication

### Launch Announcement
- Beta notice displayed on app
- Clear version information
- Feedback collection system
- Known limitations communicated

### Support Channels
- GitHub issues for bug reports
- Feedback form in app
- Discord/community for discussions
- Email for urgent issues

## Rollback Plan

If issues arise:
```bash
# Rollback to previous version
firebase hosting:releases:rollback

# Or deploy specific previous version
firebase deploy --only hosting --version=previous
```

## Security Notes

### Production Firestore Rules
Ensure rules are restrictive:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Battles are public but creation requires auth
    match /battles/{battleId} {
      allow read: if true;
      allow create, update: if request.auth != null;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Beta Testing KPIs

Track these metrics:
- User registration rate
- Feature adoption (battles vs cyphers)
- AI analysis usage
- User retention (daily/weekly)
- Feedback sentiment
- Performance metrics
- Error rates

---

Ready to go live! 🚀
