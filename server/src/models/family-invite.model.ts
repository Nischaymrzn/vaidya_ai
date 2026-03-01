import mongoose, { HydratedDocument } from "mongoose";
import { FamilyInviteType } from "../types/family.types";

export type FamilyInviteDb = Omit<
  FamilyInviteType,
  "groupId" | "invitedBy" | "usedBy"
> & {
  groupId: mongoose.Types.ObjectId;
  invitedBy: mongoose.Types.ObjectId;
  usedBy?: mongoose.Types.ObjectId;
};

const familyInviteSchema = new mongoose.Schema<FamilyInviteDb>(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyGroup",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: Date,
    usedAt: Date,
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export type FamilyInviteDocument = HydratedDocument<FamilyInviteDb>;

export const FamilyInvite = mongoose.model<FamilyInviteDb>(
  "FamilyInvite",
  familyInviteSchema,
);
