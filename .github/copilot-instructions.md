# Viral Views - AI Coding Agent Instructions

## Project Overview

**Viral Views** is a next-generation AI-enhanced hip-hop battle platform that combines social media, streaming, and artificial intelligence to create immersive rap battle experiences. The platform focuses on community-driven competitions, real-time AI judging, and content creation tools for hip-hop artists and enthusiasts.

### Core Mission
- **Community Building**: Foster authentic hip-hop culture through digital platforms
- **AI Enhancement**: Leverage AI for performance analysis, content moderation, and battle judging
- **Creator Empowerment**: Provide tools for artists to showcase, improve, and monetize their skills
- **Cultural Preservation**: Document and celebrate hip-hop's competitive traditions

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 15.3.3 with React 18.3.1 and TypeScript 5.6.3
- **Styling**: Tailwind CSS with Radix UI components for consistent design system
- **State Management**: React Context API for authentication and global state
- **Build**: Static export compatible with Firebase App Hosting
- **Development**: Hot reload on port 9002 (`npm run dev`)

### Backend Infrastructure
- **Authentication**: Firebase Auth with Email/Password, Google, and Twitter providers
- **Database**: Firestore for real-time data with optimized collections
- **Storage**: Firebase Storage for media files (videos, audio, images)
- **Functions**: Firebase Functions for serverless backend logic
- **AI Services**: Google Vertex AI and Genkit for battle analysis and content moderation

### Key Dependencies
```json
{
  "firebase": "^11.10.0",
  "react-firebase-hooks": "^5.1.1",
  "genkit": "^1.8.0",
  "@genkit-ai/googleai": "^1.8.0",
  "next": "15.3.3",
  "react": "^18.3.1",
  "tailwindcss": "^3.4.16"
}
```

## Project Structure

```
/src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with AuthProvider
│   ├── page.tsx          # Homepage with battle highlights
│   ├── battles/          # Battle rooms and live battles
│   ├── cypher-test/      # Cypher session testing
│   ├── profile/          # User profile management
│   ├── dashboard/        # User dashboard
│   ├── ai/              # AI analysis dashboard
│   └── feedback/        # User feedback forms
├── components/           # Reusable React components
│   ├── ui/              # Radix UI component abstractions
│   ├── AuthModal.tsx    # Authentication modal
│   ├── BattleRoomSystem.tsx    # Battle creation and management
│   ├── LiveBattleInterface.tsx # Real-time battle viewing
│   ├── MediaUpload.tsx  # File upload with Firebase Storage
│   ├── UserProfile.tsx  # Profile editing and display
│   ├── AIModerationDashboard.tsx # Content moderation
│   └── Navbar.tsx       # Navigation with auth integration
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Authentication state management
├── lib/                # Utility libraries and services
│   ├── firebase.ts     # Firebase SDK initialization
│   ├── firestore.ts    # Firestore operations
│   ├── ai-client.ts    # AI analysis mock (beta)
│   └── utils.ts        # Helper functions
├── types/              # TypeScript type definitions
│   └── firebase.ts     # Firebase/Firestore interfaces
└── ai/                 # AI service configuration
    ├── config.ts       # Genkit AI setup
    └── battle-ai.ts    # Battle judging AI flows
```

## Core Features & Components

### 1. Authentication System (`/src/contexts/AuthContext.tsx`)
- **Multi-Provider Auth**: Email/password, Google, Twitter sign-in
- **User State Management**: Firebase user + custom user document sync
- **Profile Integration**: Automatic profile creation with battle stats
- **Real-time Sync**: Auth state changes trigger Firestore updates

**Key Implementation Pattern**:
```typescript
const { user, firebaseUser, signIn, signUp, signInWithGoogle } = useAuth()
// Always check both user (Firestore doc) and firebaseUser (Auth state)
```

### 2. Battle System (`/src/components/BattleRoomSystem.tsx`)
- **Real-time Battles**: Firestore listeners for live battle state
- **Multi-round Support**: Sequential rounds with content submission
- **Spectator Mode**: Non-participant viewing with chat
- **AI Judging Integration**: Automated performance analysis
- **Voting System**: Community voting with duplicate prevention

**Data Flow**:
```
Battle Creation → Participant Joining → Round Submission → AI Analysis → Results
```

### 3. Media Upload (`/src/components/MediaUpload.tsx`)
- **Multi-format Support**: Video (MP4, WebM) and Audio (MP3, WAV)
- **Firebase Storage**: Organized folder structure by user and content type
- **Progress Tracking**: Real-time upload progress with visual indicators
- **Metadata Management**: Title, description, tags, privacy settings
- **File Validation**: Type checking, size limits (100MB max)

### 4. AI Analysis System (`/src/ai/battle-ai.ts`)
- **Performance Scoring**: Flow, lyrical content, wordplay, delivery metrics
- **Detailed Feedback**: Strengths, improvements, and suggestions
- **Battle Judging**: Comparative analysis between participants
- **Real-time Processing**: Streaming analysis results
- **Mock Implementation**: Beta version with realistic data simulation

### 5. Profile Management (`/src/components/UserProfile.tsx`)
- **Complete Profile Data**: Display name, bio, location, genre, social links
- **Image Upload**: Profile pictures with Firebase Storage integration
- **Battle Statistics**: Wins, losses, total battles, performance metrics
- **Social Integration**: Instagram, YouTube, SoundCloud, TikTok connections

## Database Schema

### Firestore Collections

#### `/users/{userId}`
```typescript
interface User {
  id: string
  username: string
  displayName: string
  email: string
  avatar: string
  followers: number
  following: number
  battleStats: {
    wins: number
    losses: number
    draws: number
    totalBattles: number
  }
  createdAt: Date
  verified: boolean
}
```

#### `/battles/{battleId}`
```typescript
interface Battle {
  id: string
  title: string
  participants: string[]
  status: 'waiting' | 'live' | 'judging' | 'finished'
  rounds: Round[]
  spectators: string[]
  winner?: string
  createdAt: Date
  scheduledFor?: Date
}
```

#### `/media/{mediaId}`
```typescript
interface MediaItem {
  id: string
  userId: string
  type: 'video' | 'audio'
  title: string
  description: string
  url: string
  thumbnailUrl?: string
  tags: string[]
  category: string
  privacy: 'public' | 'private' | 'unlisted'
  uploadedAt: Date
}
```

## Firebase Configuration

### Environment Variables
```bash
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# AI Services
GEMINI_API_KEY=
GOOGLE_GENAI_API_KEY=
```

### Security Rules
- **Firestore**: Users can only access their own data, battles are public read
- **Storage**: User-specific folders with authentication requirements
- **Functions**: API key protection for AI services

## Development Guidelines

### 1. Code Patterns

#### Firebase Integration
```typescript
// Always use react-firebase-hooks for auth state
import { useAuthState } from 'react-firebase-hooks/auth'
const [user, loading, error] = useAuthState(auth)

// Use onSnapshot for real-time data
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'battles'), (snapshot) => {
    // Handle real-time updates
  })
  return unsubscribe
}, [])
```

#### Component Structure
```typescript
'use client' // Always include for client components
import { useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
// Component logic with proper TypeScript interfaces
```

#### Error Handling
```typescript
try {
  // Firebase operations
} catch (error) {
  console.error('Operation failed:', error)
  // User-friendly error messages
}
```

### 2. File Naming Conventions
- **Components**: PascalCase (`BattleRoomSystem.tsx`)
- **Pages**: lowercase with hyphens (`cypher-test/page.tsx`)
- **Utilities**: camelCase (`ai-client.ts`)
- **Types**: descriptive interfaces (`firebase.ts`)

### 3. State Management
- **Local State**: `useState` for component-specific data
- **Global Auth**: `AuthContext` for user authentication
- **Real-time Data**: Firestore listeners with `onSnapshot`
- **Forms**: React Hook Form with Zod validation

### 4. Styling Approach
- **Tailwind Classes**: Utility-first approach
- **Component Variants**: Radix UI for complex components
- **Responsive Design**: Mobile-first approach
- **Color Scheme**: Hip-hop inspired dark theme with accent colors

## AI Integration Patterns

### Mock vs Production
```typescript
// Current (Beta): Mock implementation for static build
export async function analyzeBattlePerformance(/*...*/) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000))
  return mockAnalysis
}

// Production: Replace with actual AI calls
export async function analyzeBattlePerformance(/*...*/) {
  const response = await ai.generate({
    model: 'googleai/gemini-1.5-flash',
    prompt: /* analysis prompt */
  })
  return response
}
```

### Analysis Types
1. **Battle Judging**: Comparative performance analysis
2. **Cypher Analysis**: Collaborative flow assessment
3. **Content Moderation**: Automated content filtering
4. **Performance Metrics**: Technical skill evaluation

## Deployment & Build

### Build Commands
```bash
npm run build      # Next.js production build
npm run export     # Static export for hosting
npm run typecheck  # TypeScript validation
npm run lint       # ESLint code quality
```

### Firebase Deployment
```bash
npm run beta:deploy   # Deploy to Firebase Hosting
npm run beta:preview  # Create preview channel
firebase deploy       # Full deployment with functions
```

### Static Export Configuration
- **Output**: `/out` directory for static hosting
- **Images**: Optimized for static export
- **API Routes**: Converted to serverless functions
- **Environment**: Build-time environment variable injection

## Testing Strategy

### Component Testing
- **React Testing Library**: User interaction testing
- **Firebase Emulators**: Local Firebase services
- **Mock Data**: Realistic test data for development

### Integration Testing
- **Authentication Flow**: Complete sign-up/sign-in process
- **Real-time Features**: Multi-client synchronization
- **File Upload**: Media handling with Storage
- **AI Integration**: Mock service responses

## Performance Optimization

### Bundle Optimization
- **Code Splitting**: Route-based splitting with Next.js
- **Dynamic Imports**: Lazy loading for heavy components
- **Image Optimization**: Next.js Image component
- **Tree Shaking**: Eliminate unused dependencies

### Firebase Optimization
- **Query Optimization**: Limit results and use indexes
- **Storage Rules**: Efficient file access patterns
- **Function Cold Starts**: Minimize initialization time
- **Bandwidth**: CDN for static assets

## Common Development Tasks

### Adding New Features
1. **Create TypeScript interfaces** in `/src/types/`
2. **Add Firestore operations** in `/src/lib/firestore.ts`
3. **Build React components** with proper auth integration
4. **Add routing** in `/src/app/` directory
5. **Test with Firebase emulators**

### Debugging Authentication
```typescript
// Check auth state
console.log('Firebase User:', firebaseUser)
console.log('Firestore User:', user)
console.log('Loading:', loading)

// Verify Firestore rules
firebase emulators:start
```

### Adding AI Features
1. **Define interfaces** for AI responses
2. **Create mock implementations** for development
3. **Add Genkit flows** for production
4. **Test with realistic data**

## Security Considerations

### Data Protection
- **User Privacy**: Profile data access restrictions
- **Content Moderation**: AI-powered filtering
- **Authentication**: Secure token management
- **API Security**: Rate limiting and validation

### Best Practices
- **Environment Variables**: Never commit secrets
- **Firebase Rules**: Principle of least privilege
- **Input Validation**: Sanitize all user inputs
- **Error Messages**: Don't leak sensitive information

## Troubleshooting Guide

### Common Issues

#### Build Failures
```bash
# Check dependencies
npm install
npm run typecheck

# Verify Firebase config
npm run build
```

#### Authentication Problems
```bash
# Check Firebase setup
firebase projects:list
firebase login

# Verify environment variables
cat .env.local
```

#### Real-time Data Issues
```typescript
// Check Firestore rules
// Verify collection permissions
// Test with Firebase emulator
```

### Debug Tools
- **React DevTools**: Component state inspection
- **Firebase Console**: Real-time data monitoring
- **Network Tab**: API call debugging
- **VS Code**: Integrated debugging with breakpoints

## Contributing Guidelines

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Git Hooks**: Pre-commit validation

### Pull Request Process
1. **Feature branches**: `feature/battle-system-improvements`
2. **Descriptive commits**: Clear, actionable commit messages
3. **Testing**: All features must include tests
4. **Documentation**: Update this file for significant changes

### Review Checklist
- [ ] TypeScript compilation passes
- [ ] All tests pass
- [ ] Firebase rules updated if needed
- [ ] Performance impact considered
- [ ] Security implications reviewed

---

## Project Context for AI Agents

### When Working on This Project:

1. **Always prioritize real-time features** - This is a live battle platform
2. **Consider mobile users** - Many hip-hop artists use mobile devices
3. **Respect hip-hop culture** - Authentic language and features matter
4. **Performance is critical** - Real-time battles require low latency
5. **Security first** - Protect user content and personal data
6. **AI enhancement, not replacement** - AI should augment human creativity

### Key Success Metrics:
- **User Engagement**: Battle participation rates
- **Performance**: Sub-3 second page loads
- **Real-time**: <100ms battle state updates
- **AI Accuracy**: >85% satisfaction with AI judging
- **Content Quality**: Effective moderation systems

### Development Priorities:
1. **Real-time Battle System**: Core platform functionality
2. **AI Integration**: Performance analysis and judging
3. **Mobile Experience**: Responsive design and PWA features
4. **Content Creation Tools**: Video/audio editing capabilities
5. **Community Features**: Social interactions and following systems

This platform represents the intersection of technology and culture, where AI enhances but never diminishes the authentic human creativity that defines hip-hop.
