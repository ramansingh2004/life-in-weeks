import { Schema, model, models } from 'mongoose'
import { ITag } from '@/typesDefined'

const TagSchema = new Schema<ITag>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, lowercase: true }, // "college"
  displayName: { type: String, required: true },          // "College"
  color: { type: String, default: '#6366f1' },            // Hex color
  emoji: { type: String },                                // "🎓"
  description: { type: String },                          // Optional
  usageCount: { type: Number, default: 0 },               // Cached count
  // createdAt: { type: Date, default: Date.now },
  // updatedAt: { type: Date, default: Date.now },
},
 { timestamps: true })

// Unique index on userId + name
TagSchema.index({ userId: 1, name: 1 }, { unique: true })
TagSchema.index({ userId: 1, usageCount: -1 })  // For ordering

export const Tag = models.Tag || model('Tag', TagSchema)