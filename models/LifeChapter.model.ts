import { Schema, model, models, Document } from 'mongoose'
import { Types } from 'mongoose'

export interface ILifeChapter extends Document {
  userId: Types.ObjectId
  startWeek: number
  endWeek: number
  title: string
  emoji: string
  description: string
  keyTags: string[]
  averageMood: number
  photoCount: number
  milestoneCount: number
  createdAt: Date
  updatedAt: Date
}

const LifeChapterSchema = new Schema<ILifeChapter>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  startWeek: { type: Number, required: true },
  endWeek: { type: Number, required: true },
  title: { type: String, required: true },
  emoji: { type: String, required: true },
  description: { type: String },
  keyTags: [{ type: String }],
  averageMood: { type: Number, default: 0 },
  photoCount: { type: Number, default: 0 },
  milestoneCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

LifeChapterSchema.index({ userId: 1, startWeek: 1 })

export const LifeChapter = models.LifeChapter || model<ILifeChapter>('LifeChapter', LifeChapterSchema)