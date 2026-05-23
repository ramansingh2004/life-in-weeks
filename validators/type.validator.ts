import { z } from 'zod';
import { UserRegisterSchema, UserLoginSchema, UserProfileUpdateSchema, UserResponseSchema, ChangePasswordSchema } from './user.validator';
import { TagCreateSchema,TagUpdateSchema,TagMergeSchema,TagResponseSchema,} from './tag.validator';
import { WeekDataSchema, WeekUpdateSchema, WeekFilterSchema, WeekResponseSchema } from './week.validator'
import { MilestoneCreateSchema, MilestoneUpdateSchema, MilestoneResponseSchema, MilestoneFilterSchema } from './milestone.validator';
import {MediaUploadSchema, MediaResponseSchema, MediaFilterSchema} from './media.validator'
import {LifeChapterCreateSchema, LifeChapterUpdateSchema, LifeChapterFilterSchema, LifeChapterResponseSchema} from './chapter.validator'
import { SuccessResponseSchema, ErrorResponseSchema, PaginatedResponseSchema } from './pagination_response.validator';

export type UserRegister = z.infer<typeof UserRegisterSchema>;
export type UserLogin = z.infer<typeof UserLoginSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type ChangePassword = z.infer<typeof ChangePasswordSchema>;
 
export type TagCreate = z.infer<typeof TagCreateSchema>;
export type TagUpdate = z.infer<typeof TagUpdateSchema>;
export type TagResponse = z.infer<typeof TagResponseSchema>;
export type TagMerge = z.infer<typeof TagMergeSchema>;
 
export type WeekData = z.infer<typeof WeekDataSchema>;
export type WeekUpdate = z.infer<typeof WeekUpdateSchema>;
export type WeekResponse = z.infer<typeof WeekResponseSchema>;
export type WeekFilter = z.infer<typeof WeekFilterSchema>;
 
export type MilestoneCreate = z.infer<typeof MilestoneCreateSchema>;
export type MilestoneUpdate = z.infer<typeof MilestoneUpdateSchema>;
export type MilestoneResponse = z.infer<typeof MilestoneResponseSchema>;
export type MilestoneFilter = z.infer<typeof MilestoneFilterSchema>;
 
export type MediaUpload = z.infer<typeof MediaUploadSchema>;
export type MediaResponse = z.infer<typeof MediaResponseSchema>;
export type MediaFilter = z.infer<typeof MediaFilterSchema>;
 
export type LifeChapterCreate = z.infer<typeof LifeChapterCreateSchema>;
export type LifeChapterUpdate = z.infer<typeof LifeChapterUpdateSchema>;
export type LifeChapterResponse = z.infer<typeof LifeChapterResponseSchema>;
export type LifeChapterFilter = z.infer<typeof LifeChapterFilterSchema>;
 
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;