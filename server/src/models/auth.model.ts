import mongoose, { HydratedDocument } from "mongoose";
import { UserType } from "../types/user.types";

const userSchema = new mongoose.Schema<UserType>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    number: {
      type: String,
    },
    password: {
      type: String,
      select: false,
    },
    profilePicture: { type: String, required: false },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    deletedAt: Date,
  },
  { timestamps: true },
);

export type UserDocument = HydratedDocument<UserType>;

export const User = mongoose.model<UserType>("User", userSchema);
