
import { z } from 'zod';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  isBoutique?: boolean;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    email: string;
    role: 'customer' | 'creator' | 'admin';
    createdAt: string;
  };
  token: string;
  role?: string;
}

export interface ServiceContext {
  component: string;
  action: string;
  data?: Record<string, unknown>;
}

export const registerDataSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit avoir au moins 8 caractères'),
  isBoutique: z.boolean().optional()
}) satisfies z.ZodType<RegisterData>;

export const loginDataSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis')
}) satisfies z.ZodType<LoginData>;
