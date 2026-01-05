import z from "zod";

export const UserSchema = z.object({
  name: z.string(),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(5, { message: "Email must be at least 5 characters" }),
  password: z
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
  number: z.number().optional(),
  isEmailVerified: z.boolean().default(false),
  role: z.enum(["admin", "user"]).default("user"),
  isActive: z.boolean().default(false),
  deletedAt: z.date(),
});

const User = UserSchema.pick({
  email: true,
  role: true,
}).extend({
  id: z.string(),
});

export type User = z.infer<typeof User>;
export type UserType = z.infer<typeof UserSchema>;
