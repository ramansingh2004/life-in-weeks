import { Schema, model, models } from "mongoose"
import { IUser } from "@/typesDefined";

const UserSchema = new Schema<IUser>({
  name: { 
    type: String,
    required: true
  },
  email: { 
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  googleId: { 
    type: String,
    default: null 
  },
  image: { 
  type: String,
  default: null 
  },
  password: {
    type: String,
    required: function (this: IUser): boolean {
      return !this.googleId
    },
    default: null,
  },
  birthDate: { 
    type: String
  },
  lifeExpectancy: { 
    type: Number,
    default: 80
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
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
