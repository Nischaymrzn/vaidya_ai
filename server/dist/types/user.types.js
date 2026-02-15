"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.UserSchema = zod_1.default.object({
    name: zod_1.default.string(),
    email: zod_1.default
        .string()
        .email({ message: "Invalid email address" })
        .min(5, { message: "Email must be at least 5 characters" }),
    password: zod_1.default
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
    number: zod_1.default.string().optional(),
    isEmailVerified: zod_1.default.coerce.boolean().default(false),
    role: zod_1.default.enum(["admin", "user"]).default("user"),
    isActive: zod_1.default.coerce.boolean().default(false),
    deletedAt: zod_1.default.date(),
    profilePicture: zod_1.default.string().optional(),
    googleId: zod_1.default.string().optional(),
});
const User = exports.UserSchema.pick({
    email: true,
    role: true,
}).extend({
    id: zod_1.default.string(),
});
