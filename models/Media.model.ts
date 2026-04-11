import { Schema, model, models } from "mongoose"
import { IMedia } from "@/typesDefined"

const MediaSchema = new Schema<IMedia>({
  userId: { 
    type: String,
    required: true
    },
  weekIndex: { 
    type: Number,
     required: true
    },
  type: { 
    type: String,
     enum: ["image", "video", "audio"],
      required: true
    },
  url: { 
    type: String,
     required: true
    },
  publicId: { 
    type: String,
     required: true
    },
  name: { 
    type: String,
     required: true
    },
}, { timestamps: true })

export const Media = models.Media || model<IMedia>("Media", MediaSchema)