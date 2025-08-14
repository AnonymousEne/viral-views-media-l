// Centralized auth types
import { z } from 'zod';
import { signInSchema, signUpSchema } from '../lib/validation';

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
