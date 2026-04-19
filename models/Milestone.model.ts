import { Schema, model, models } from "mongoose"

export interface IMilestone {
  _id: string
  userId: string
  weekIndex: number
  title: string
  description: string
  category: "career" | "education" | "health" | "family" | "travel" | "personal" | "other"
  icon: string
  date: string // ISO date
  createdAt: Date
  updatedAt: Date
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    weekIndex: {
      type: Number,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    category: {
      type: String,
      enum: ["career", "education", "health", "family", "travel", "personal", "other"],
      default: "personal",
    },
    icon: {
      type: String,
      default: "✦",
    },
    date: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

// Compound index for efficient querying
MilestoneSchema.index({ userId: 1, weekIndex: 1 }, { unique: true })

export const Milestone = models.Milestone || model<IMilestone>("Milestone", MilestoneSchema)