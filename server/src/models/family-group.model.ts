import mongoose, { HydratedDocument } from "mongoose";
import { FamilyGroupType, FamilyMemberType } from "../types/family.types";

export type FamilyMemberDb = Omit<FamilyMemberType, "userId" | "invitedBy"> & {
  userId: mongoose.Types.ObjectId;
  invitedBy?: mongoose.Types.ObjectId;
};

export type FamilyGroupDb = Omit<FamilyGroupType, "adminId" | "members"> & {
  _id: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  members: FamilyMemberDb[];
};

const familyMemberSchema = new mongoose.Schema<FamilyMemberDb>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    relation: String,
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

const familyGroupSchema = new mongoose.Schema<FamilyGroupDb>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: {
      type: [familyMemberSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export type FamilyGroupDocument = HydratedDocument<FamilyGroupDb>;

export const FamilyGroup = mongoose.model<FamilyGroupDb>(
  "FamilyGroup",
  familyGroupSchema,
);
