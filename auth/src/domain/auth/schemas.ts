import { z } from 'zod';

export const emailSchema = z.string()
  .email('Format d\'email invalide')
  .transform(val => val.trim().toLowerCase());

export const passwordSchema = z.string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre');

export const phoneNumberSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Format de numéro de téléphone invalide')
  .transform(val => val.replace(/\s+/g, '').replace(/^00/, '+'));

export const userSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(1),
  email: emailSchema,
  role: z.enum(['customer', 'creator', 'admin']),
  createdAt: z.string().datetime(),
});

export const creatorSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  name: z.string().min(1),
  bio: z.string().optional(),
  country: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
});

export const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginInputSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const registerInputSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  password: passwordSchema,
  name: z.string().min(1, 'Nom requis'),
});