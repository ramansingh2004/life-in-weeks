import { z } from 'zod';
import { MediaTypeSchema, ObjectIdSchema } from './common.validator';

export const MediaUploadSchema = z.object({
  weekIndex: z.number().int().nonnegative(),
  type: MediaTypeSchema,
  name: z.string().min(1).max(100),
  file: z.instanceof(File).refine(
    (file) => file.size <= 100 * 1024 * 1024,
    'File size must be less than 100MB'
  ).refine(
    (file) => {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      const validAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
      
      return validImageTypes.includes(file.type) || 
             validVideoTypes.includes(file.type) || 
             validAudioTypes.includes(file.type);
    },
    'Invalid file type. Allowed: JPEG, PNG, GIF, WebP, MP4, WebM, MOV, MP3, WAV, OGG'
  ),
});
 
export const MediaResponseSchema = z.object({
  _id: ObjectIdSchema,
  userId: ObjectIdSchema,
  weekIndex: z.number().int().nonnegative(),
  type: MediaTypeSchema,
  url: z.string().url(),
  publicId: z.string(),
  name: z.string(),
  createdAt: z.date(),
});
 
export const MediaFilterSchema = z.object({
  weekIndex: z.number().int().nonnegative().optional(),
  type: MediaTypeSchema.optional(),
  startWeek: z.number().int().nonnegative().optional(),
  endWeek: z.number().int().nonnegative().optional(),
  limit: z.number().int().positive().default(20),
  skip: z.number().int().nonnegative().default(0),
});