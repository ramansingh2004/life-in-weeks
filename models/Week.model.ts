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
}, { timestamps: true })

// Compound index — one week entry per user
WeekSchema.index({ userId: 1, weekIndex: 1 }, { unique: true })

export const Week = models.Week || model<IWeek>("Week", WeekSchema)