import { 
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds
} from '@firebase/rules-unit-testing'

let testEnv: RulesTestEnvironment

// Skip these tests if Firebase emulator isn't running
beforeAll(async () => {
  try {
    testEnv = await initializeTestEnvironment({
      projectId: 'viral-views-test',
      firestore: {
        host: '127.0.0.1',
        port: 8080,
        rules: `
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /users/{userId} {
              allow read: if request.auth != null && request.auth.uid == userId;
              allow read: if request.auth != null && isValidPublicRead();
              allow create: if request.auth != null && request.auth.uid == userId && isValidUserData();
              allow update: if request.auth != null && request.auth.uid == userId && isValidUserUpdate();
              allow delete: if false;
            }
            
            match /battles/{battleId} {
              allow read: if true;
              allow create: if request.auth != null && isValidBattle();
              allow update: if request.auth != null && (
                resource.data.createdBy == request.auth.uid ||
                isParticipantUpdate() ||
                isVoteUpdate()
              );
              allow delete: if request.auth != null && resource.data.createdBy == request.auth.uid;
            }
            
            match /media/{mediaId} {
              allow read: if resource.data.privacy == 'public' || 
                (request.auth != null && resource.data.userId == request.auth.uid) ||
                (request.auth != null && resource.data.privacy == 'unlisted');
              allow create: if request.auth != null && 
                request.auth.uid == request.resource.data.userId &&
                isValidMediaData();
              allow update: if request.auth != null && 
                request.auth.uid == resource.data.userId &&
                isValidMediaUpdate();
              allow delete: if request.auth != null && 
                (request.auth.uid == resource.data.userId || isAdmin());
            }
            
            function isValidPublicRead() { return true; }
            function isValidUserData() {
              let data = request.resource.data;
              return data.keys().hasAll(['email', 'username', 'displayName', 'createdAt']) &&
                data.email == request.auth.token.email &&
                data.username is string && data.username.size() >= 3 && data.username.size() <= 30 &&
                data.displayName is string && data.displayName.size() >= 1 && data.displayName.size() <= 50;
            }
            function isValidUserUpdate() {
              let data = request.resource.data;
              let existingData = resource.data;
              return data.email == existingData.email &&
                data.createdAt == existingData.createdAt &&
                (!data.diff(existingData).affectedKeys().hasAny(['email', 'createdAt', 'uid']));
            }
            function isValidBattle() {
              return request.resource.data.keys().hasAll(['title', 'createdBy', 'status', 'participants']) &&
                request.resource.data.createdBy == request.auth.uid &&
                request.resource.data.participants.size() <= 10 &&
                request.resource.data.title.size() <= 100;
            }
            function isParticipantUpdate() {
              let isParticipant = request.auth.uid in resource.data.participants;
              let isJoining = request.auth.uid in request.resource.data.participants && 
                !(request.auth.uid in resource.data.participants);
              return isParticipant || isJoining;
            }
            function isVoteUpdate() {
              let changedFields = resource.data.diff(request.resource.data).changedKeys();
              return changedFields.hasOnly(['votes']) && 
                request.resource.data.votes.size() > resource.data.votes.size();
            }
            function isValidMediaData() {
              let data = request.resource.data;
              return data.keys().hasAll(['title', 'userId', 'privacy', 'category', 'uploadedAt']) &&
                data.title is string && data.title.size() >= 1 && data.title.size() <= 100 &&
                data.privacy in ['public', 'private', 'unlisted'] &&
                data.category in ['battle', 'cypher', 'freestyle', 'practice', 'other'] &&
                (!data.keys().hasAny(['tags']) || data.tags.size() <= 10);
            }
            function isValidMediaUpdate() {
              let data = request.resource.data;
              let existingData = resource.data;
              return data.userId == existingData.userId &&
                data.uploadedAt == existingData.uploadedAt &&
                (!data.diff(existingData).affectedKeys().hasAny(['userId', 'uploadedAt']));
            }
            function isAdmin() {
              return request.auth.token.admin == true;
            }
          }
        }
      `
    }
    })
  } catch (error) {
    console.warn('Firebase emulator not available, skipping Firestore rules tests')
    // Mark tests as skipped when emulator isn't running
    return
  }
})

afterAll(async () => {
  await testEnv.cleanup()
})

describe('Firestore Security Rules', () => {
  describe('Users Collection', () => {
    it('should allow users to read their own data', async () => {
      const alice = testEnv.authenticatedContext('alice', {
        email: 'alice@example.com'
      })
      
      await assertSucceeds(
        alice.firestore().doc('users/alice').get()
      )
    })

    it('should deny users from reading other users private data', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().doc('users/bob').get()
      )
    })

    it('should allow users to create their own profile with valid data', async () => {
      const alice = testEnv.authenticatedContext('alice', {
        email: 'alice@example.com'
      })
      
      await assertSucceeds(
        alice.firestore().doc('users/alice').set({
          email: 'alice@example.com',
          username: 'alice123',
          displayName: 'Alice',
          createdAt: new Date()
        })
      )
    })

    it('should deny user creation with invalid username', async () => {
      const alice = testEnv.authenticatedContext('alice', {
        email: 'alice@example.com'
      })
      
      await assertFails(
        alice.firestore().doc('users/alice').set({
          email: 'alice@example.com',
          username: 'ab', // Too short
          displayName: 'Alice',
          createdAt: new Date()
        })
      )
    })

    it('should deny account deletion by users', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().doc('users/alice').delete()
      )
    })
  })

  describe('Battles Collection', () => {
    it('should allow anyone to read public battles', async () => {
      const unauthenticated = testEnv.unauthenticatedContext()
      
      await assertSucceeds(
        unauthenticated.firestore().doc('battles/battle1').get()
      )
    })

    it('should allow authenticated users to create valid battles', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().doc('battles/battle1').set({
          title: 'Epic Battle',
          createdBy: 'alice',
          status: 'open',
          participants: ['alice'],
          description: 'A great battle'
        })
      )
    })

    it('should deny battle creation with too many participants', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().doc('battles/battle1').set({
          title: 'Epic Battle',
          createdBy: 'alice',
          status: 'open',
          participants: Array(15).fill('user'), // Too many participants
          description: 'A great battle'
        })
      )
    })

    it('should deny battle creation with title too long', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().doc('battles/battle1').set({
          title: 'A'.repeat(150), // Too long
          createdBy: 'alice',
          status: 'open',
          participants: ['alice']
        })
      )
    })
  })

  describe('Media Collection', () => {
    beforeEach(async () => {
      // Set up test media document
      await testEnv.withSecurityRulesDisabled((context: any) => {
        return context.firestore().doc('media/media1').set({
          title: 'Test Video',
          userId: 'alice',
          privacy: 'public',
          category: 'battle',
          uploadedAt: new Date()
        })
      })
    })

    it('should allow reading public media', async () => {
      const bob = testEnv.authenticatedContext('bob')
      
      await assertSucceeds(
        bob.firestore().doc('media/media1').get()
      )
    })

    it('should allow users to create valid media', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().doc('media/media2').set({
          title: 'My Battle Video',
          userId: 'alice',
          privacy: 'public',
          category: 'battle',
          uploadedAt: new Date(),
          tags: ['epic', 'battle']
        })
      )
    })

    it('should deny media creation with invalid category', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().doc('media/media2').set({
          title: 'My Battle Video',
          userId: 'alice',
          privacy: 'public',
          category: 'invalid-category', // Invalid category
          uploadedAt: new Date()
        })
      )
    })

    it('should deny media creation with too many tags', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().doc('media/media2').set({
          title: 'My Battle Video',
          userId: 'alice',
          privacy: 'public',
          category: 'battle',
          uploadedAt: new Date(),
          tags: Array(15).fill('tag') // Too many tags
        })
      )
    })

    it('should allow owner to update media', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertSucceeds(
        alice.firestore().doc('media/media1').update({
          title: 'Updated Title'
        })
      )
    })

    it('should deny non-owner from updating media', async () => {
      const bob = testEnv.authenticatedContext('bob')
      
      await assertFails(
        bob.firestore().doc('media/media1').update({
          title: 'Hijacked Title'
        })
      )
    })

    it('should deny modification of protected fields', async () => {
      const alice = testEnv.authenticatedContext('alice')
      
      await assertFails(
        alice.firestore().doc('media/media1').update({
          userId: 'bob', // Cannot change owner
          uploadedAt: new Date() // Cannot change upload timestamp
        })
      )
    })
  })
})
