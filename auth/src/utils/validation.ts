
import { z } from 'zod';
import { ERROR_MESSAGES } from './messages';

const emailSchema = z.string()
  .email(ERROR_MESSAGES.EMAIL_INVALID)
  .transform(val => val.trim().toLowerCase());

const passwordSchema = z.string()
  .min(8, ERROR_MESSAGES.PASSWORD_TOO_SHORT)
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre');

export const loginValidationSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, ERROR_MESSAGES.PASSWORD_REQUIRED),
});

export type LoginInput = z.infer<typeof loginValidationSchema>;

export const registerValidationSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom doit contenir au maximum 100 caractères'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerValidationSchema>;

export const boutiqueValidationSchema = z.object({
  shopName: z.string()
    .min(2, 'Le nom de la boutique doit contenir au moins 2 caractères')
    .max(100, 'Le nom doit contenir au maximum 100 caractères'),
  address: z.string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .max(200, 'L\'adresse doit contenir au maximum 200 caractères'),
  postalCode: z.string()
    .regex(/^[0-9]{5}$/, 'Le code doit contenir 5 chiffres'),
  country: z.string().min(1, 'Le pays est requis'),
  phoneNumber: z.string()
    .regex(/^[0-9\s\-\+]{6,20}$/, 'Le numéro de téléphone invalide'),
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(1000, 'La description doit contenir au maximum 1000 caractères'),
});

export type BoutiqueInput = z.infer<typeof boutiqueValidationSchema>;

export const validateWithSchema = <T>(schema: z.ZodSchema, data: unknown): { valid: boolean; data?: T; errors?: Record<string, string> } => {
  try {
    const result = schema.parse(data);
    return { valid: true, data: result as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { _general: 'Erreur de validation' } };
  }
};