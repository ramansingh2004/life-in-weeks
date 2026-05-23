import { z } from 'zod';
import { CategorySchema, ISODateSchema, ObjectIdSchema } from './common.validator';

export const MilestoneCreateSchema = z.object({
  weekIndex: z.number().int().nonnegative(),
  title: z.string().min(1).max(50, 'Title must be 50 characters or less'),
  description: z.string().max(200).optional(),
  category: CategorySchema,
  icon: z.string().default('✦'),
  date: ISODateSchema,
  tags: z.array(z.string()).optional(),
});
 
export const MilestoneUpdateSchema = MilestoneCreateSchema.partial();
 
export const MilestoneResponseSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  weekIndex: z.number().int().nonnegative(),
  title: z.string(),
  description: z.string().optional(),
  category: CategorySchema,
  icon: z.string(),
  date: z.string(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
 
export const MilestoneFilterSchema = z.object({
  category: CategorySchema.optional(),
  startDate: ISODateSchema.optional(),
  endDate: ISODateSchema.optional(),
  startWeek: z.number().int().nonnegative().optional(),
  endWeek: z.number().int().nonnegative().optional(),
  limit: z.number().int().positive().default(20),
  skip: z.number().int().nonnegative().default(0),
});