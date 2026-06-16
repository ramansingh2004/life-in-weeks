import { Schema, model, models } from "mongoose"
import { IWeek } from "@/typesDefined"

const WeekSchema = new Schema<IWeek>({
  userId: { 
    type: String,
     required: true
    },
  weekIndex: { 
    type: Number,
     required: true
    },
  note: { 
    type: String,
     default: ""
    },
  mood: { 
    type: Number,
     default: 0
    },
  isPast: { 
    type: Boolean,
     required: true
    },
  isCurrent: { 
    type: Boolean,
     required: true
    },
  date: { 
    type: String,
     required: true
    },
  tags: [
    { 
      type: String,
       lowercase: true
       }
  ],     // ["college", "family"]
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

// Compound index — one week entry per user
WeekSchema.index({ userId: 1, weekIndex: 1 }, { unique: true })
WeekSchema.index({ userId: 1, tags: 1 })        // NEW: for filtering by tag
WeekSchema.index({ userId: 1, date: 1 })
WeekSchema.index({ userId: 1 })
WeekSchema.index({ userId: 1, mood: 1 })

export const Week = models.Week || model<IWeek>("Week", WeekSchema)