import { z } from 'zod';
import { EmailSchema, PasswordSchema, ObjectIdSchema } from './common.validator';

export const UserRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: EmailSchema,
  password: PasswordSchema,
  confirmPassword: z.string(),
  birthDate: z.string().optional(),
  lifeExpectancy: z.number().int().min(1).max(150).default(80),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
 
export const UserLoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Password is required'),
});
 
export const UserProfileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: EmailSchema.optional(),
  birthDate: z.string().optional(),
  lifeExpectancy: z.number().int().min(1).max(150).optional(),
  image: z.string().url('Invalid image URL').optional(),
}).refine((data) => Object.values(data).some(val => val !== undefined), {
  message: 'At least one field must be provided',
});
 
export const UserResponseSchema = z.object({
  _id: ObjectIdSchema,
  name: z.string(),
  email: EmailSchema,
  birthDate: z.string().optional(),
  lifeExpectancy: z.number(),
  image: z.string().url().optional().nullable(),
  isEmailVerified: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});
 
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: PasswordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export type UserRegister = z.infer<typeof UserRegisterSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;