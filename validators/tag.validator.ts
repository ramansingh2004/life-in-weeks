import { z } from 'zod';
import { SlugSchema, HexColorSchema, ObjectIdSchema, EmojiSchema } from './common.validator';

export const TagCreateSchema = z.object({
  name: SlugSchema,
  displayName: z.string().min(1).max(50, 'Display name must be 50 characters or less'),
  color: HexColorSchema.default('#6366f1'),
  emoji: EmojiSchema,
  description: z.string().max(200).optional(),
});
 
export const TagUpdateSchema = TagCreateSchema.partial();
 
export const TagResponseSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  name: z.string(),
  displayName: z.string(),
  color: z.string(),
  emoji: z.string().optional(),
  description: z.string().optional(),
  usageCount: z.number().int().nonnegative().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});
 
export const TagMergeSchema = z.object({
  sourceTagName: SlugSchema,
  targetTagName: SlugSchema,
}).refine((data) => data.sourceTagName !== data.targetTagName, {
  message: 'Cannot merge a tag with itself',
});
 
export const TagSearchSchema = z.object({
  query: z.string().min(1).max(50),
  limit: z.number().int().positive().default(10),
});