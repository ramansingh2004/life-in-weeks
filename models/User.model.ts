import mongoose, { Schema, model, models } from "mongoose"
import { IUser } from "@/typesDefined";

const UserSchema = new Schema<IUser>({
  name: { 
    type: String,
    required: true
    },
  email: { 
    type: String,
    required: true,
    unique: true
    },
  password: { 
    type: String,
    required: true
    },
  birthDate: { 
    type: String
    },
  lifeExpectancy: { 
    type: Number,
    default: 80
    },
  createdAt: { 
    type: Date,
     default: Date.now
    },
}, 
  {
    timestamps: true
   })

export const User = models.User || model<IUser>("User", UserSchema)