// Centralized auth types
import { z } from 'zod';
import { signInSchema, signUpSchema } from '../lib/validation';

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;

export interface User {
  uid: string;
  id: string;  // For compatibility with existing code
  email: string | null;
  displayName: string | null;
  username: string;
  avatar?: string;
  followers: number;
  following: number;
  createdAt: Date;
  verified: boolean;
  battleStats?: {
    wins: number;
    losses: number;
    draws: number;
    totalBattles: number;
  };
}
