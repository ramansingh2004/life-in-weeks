import { z } from 'zod';
import { ObjectIdSchema } from './common.validator';

// ✅ Base object schema
const BaseLifeChapterSchema = z.object({
  userId: ObjectIdSchema,
  startWeek: z.number().int().nonnegative(),
  endWeek: z.number().int().nonnegative(),
  title: z.string().min(1).max(100, 'Title must be 100 characters or less'),
  emoji: z.string().emoji('Must be a valid emoji'),
  description: z.string().max(500).optional(),
  keyTags: z.array(z.string()).default([]),
  averageMood: z.number().default(0),
  photoCount: z.number().int().nonnegative().default(0),
  milestoneCount: z.number().int().nonnegative().default(0),
});

// ✅ Create schema with refinement
export const LifeChapterCreateSchema = BaseLifeChapterSchema.refine(
  (data) => data.startWeek <= data.endWeek,
  {
    message: 'startWeek must be less than or equal to endWeek',
    path: ['endWeek'],
  }
);

// ✅ Update schema from BASE schema
export const LifeChapterUpdateSchema = BaseLifeChapterSchema.partial();

export const LifeChapterResponseSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  startWeek: z.number().int().nonnegative(),
  endWeek: z.number().int().nonnegative(),
  title: z.string(),
  emoji: z.string(),
  description: z.string().optional(),
  keyTags: z.array(z.string()),
  averageMood: z.number().default(0),
  photoCount: z.number().int().nonnegative().default(0),
  milestoneCount: z.number().int().nonnegative().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const LifeChapterFilterSchema = z.object({
  limit: z.number().int().positive().default(20),
  skip: z.number().int().nonnegative().default(0),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});

export type LifeChapterCreate = z.infer<typeof LifeChapterCreateSchema>;
export type LifeChapterUpdate = z.infer<typeof LifeChapterUpdateSchema>;
export type LifeChapterResponse = z.infer<typeof LifeChapterResponseSchema>;
export type LifeChapterFilter = z.infer<typeof LifeChapterFilterSchema>;