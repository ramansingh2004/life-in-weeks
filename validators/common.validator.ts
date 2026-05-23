import { z } from 'zod';

export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: 'Invalid MongoDB ObjectId',
});
 
export const EmailSchema = z.string().email('Invalid email address').toLowerCase();
 
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number');
 
export const HexColorSchema = z.string().regex(/^#[0-9A-F]{6}$/i, {
  message: 'Invalid hex color format (e.g., #FF6B6B)',
});
 
export const EmojiSchema = z.string().emoji('Must be a valid emoji').optional();
 
export const SlugSchema = z
  .string()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  });
 
export const ISODateSchema = z.string().datetime().or(z.string().date());
 
export const MoodLevelSchema = z.number().int().min(0).max(5);
 
export const CategorySchema = z.enum([
  'career',
  'education',
  'health',
  'family',
  'travel',
  'personal',
  'other',
]);
 
export const MediaTypeSchema = z.enum(['image', 'video', 'audio']);

// ✅ VERIFY EMAIL SCHEMA
export const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required').min(64, 'Invalid token format')
})
