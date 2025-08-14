import { 
  signInSchema, 
  signUpSchema, 
  battleCreateSchema, 
  mediaUploadSchema,
  chatMessageSchema 
} from '@/lib/validation'

describe('Validation Schemas', () => {
  describe('signInSchema', () => {
    it('should validate correct sign-in data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      }
      
      const result = signInSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      }
      
      const result = signInSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email')
      }
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      }
      
      const result = signInSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password')
      }
    })
  })

  describe('signUpSchema', () => {
    it('should validate correct sign-up data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        username: 'testuser',
        displayName: 'Test User'
      }
      
      const result = signUpSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject username with invalid characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        username: 'test user!',
        displayName: 'Test User'
      }
      
      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'different',
        username: 'testuser',
        displayName: 'Test User'
      }
      
      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('battleCreateSchema', () => {
    it('should validate correct battle data', () => {
      const validData = {
        title: 'Epic Battle',
        description: 'A great hip-hop battle',
        format: 'freestyle' as const,
        maxParticipants: 4,
        timeLimit: 120,
        isPrivate: false
      }
      
      const result = battleCreateSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        description: 'A great hip-hop battle',
        format: 'freestyle' as const,
        maxParticipants: 4,
        timeLimit: 120
      }
      
      const result = battleCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject too many participants', () => {
      const invalidData = {
        title: 'Epic Battle',
        description: 'A great hip-hop battle',
        format: 'freestyle' as const,
        maxParticipants: 15,
        timeLimit: 120
      }
      
      const result = battleCreateSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('mediaUploadSchema', () => {
    it('should validate correct media upload data', () => {
      const validData = {
        title: 'My Freestyle',
        description: 'A sick freestyle rap',
        tags: ['hip-hop', 'freestyle', 'rap'],
        category: 'freestyle',
        privacy: 'public' as const
      }
      
      const result = mediaUploadSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject too many tags', () => {
      const invalidData = {
        title: 'My Freestyle',
        description: 'A sick freestyle rap',
        tags: Array(15).fill('tag'),
        category: 'freestyle',
        privacy: 'public' as const
      }
      
      const result = mediaUploadSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid privacy setting', () => {
      const invalidData = {
        title: 'My Freestyle',
        description: 'A sick freestyle rap',
        tags: ['hip-hop'],
        category: 'freestyle',
        privacy: 'invalid' as any
      }
      
      const result = mediaUploadSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })

  describe('chatMessageSchema', () => {
    it('should validate correct chat message', () => {
      const validData = {
        message: 'Great battle!',
        battleId: 'battle123'
      }
      
      const result = chatMessageSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty message', () => {
      const invalidData = {
        message: '',
        battleId: 'battle123'
      }
      
      const result = chatMessageSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject message that is too long', () => {
      const invalidData = {
        message: 'x'.repeat(501),
        battleId: 'battle123'
      }
      
      const result = chatMessageSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
