import { z } from 'zod';
import { MoodLevelSchema, ObjectIdSchema } from './common.validator';

export const WeekDataSchema = z.object({
  weekIndex: z.number().int().nonnegative(),
  date: z.string(),
  isPast: z.boolean(),
  isCurrent: z.boolean(),
  note: z.string().max(5000).default(''),
  mood: MoodLevelSchema.default(0),
  tags: z.array(z.string().toLowerCase()).default([]),
});
 
export const WeekUpdateSchema = z.object({
  note: z.string().max(5000).optional(),
  mood: MoodLevelSchema.optional(),
  tags: z.array(z.string().toLowerCase()).optional(),
});
 
export const WeekResponseSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  weekIndex: z.number().int().nonnegative(),
  date: z.string(),
  isPast: z.boolean(),
  isCurrent: z.boolean(),
  note: z.string(),
  mood: MoodLevelSchema,
  tags: z.array(z.string()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
 
export const WeekFilterSchema = z.object({
  startWeek: z.number().int().nonnegative().optional(),
  endWeek: z.number().int().nonnegative().optional(),
  tags: z.array(z.string()).optional(),
  moodMin: MoodLevelSchema.optional(),
  moodMax: MoodLevelSchema.optional(),
  limit: z.number().int().positive().default(20),
  skip: z.number().int().nonnegative().default(0),
}).refine((data) => {
  if (data.startWeek && data.endWeek) {
    return data.startWeek <= data.endWeek;
  }
  return true;
}, {
  message: 'startWeek must be less than or equal to endWeek',
});

export type WeekData = z.infer<typeof WeekDataSchema>;
export type WeekUpdate = z.infer<typeof WeekUpdateSchema>;
export type WeekResponse = z.infer<typeof WeekResponseSchema>;
export type WeekFilter = z.infer<typeof WeekFilterSchema>;