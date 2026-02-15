"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDto = exports.resetPasswordDTO = exports.requestPasswordResetDTO = exports.loginUserDTO = exports.CreateUserDTO = void 0;
const zod_1 = __importDefault(require("zod"));
const user_types_1 = require("../types/user.types");
exports.CreateUserDTO = zod_1.default
    .object({
    email: zod_1.default
        .string()
        .email()
        .email({ message: "Invalid email address" })
        .min(5, { message: "Email must be at least 5 characters" }),
    name: zod_1.default.string().min(1),
    password: zod_1.default
        .string()
        .min(8, { message: "Password must be at least 8 characters" })
        .max(32, { message: "Password cannot be longer than 32 characters" })
        .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
    })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[\W_]/, {
        message: "Password must contain at least one special character",
    }),
    number: zod_1.default.string().optional(),
    profilePicture: zod_1.default.string().optional(),
    confirmPassword: zod_1.default
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
exports.loginUserDTO = user_types_1.UserSchema.pick({
    email: true,
    password: true,
});
exports.requestPasswordResetDTO = zod_1.default.object({
    email: exports.CreateUserDTO.shape.email,
});
exports.resetPasswordDTO = zod_1.default.object({
    newPassword: exports.CreateUserDTO.shape.password,
});
exports.UpdateUserDto = user_types_1.UserSchema.partial();
