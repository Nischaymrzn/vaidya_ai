import z from "zod";

export const UserSchema = z.object({
  name: z.string(),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(5, { message: "Email must be at least 5 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  number: z.string().optional(),
  isEmailVerified: z.coerce.boolean().default(false),
  role: z.enum(["admin", "user"]).default("user"),
  isActive: z.coerce.boolean().default(false),
  deletedAt: z.date(),
  profilePicture: z.string().optional(),
});

const User = UserSchema.pick({
  email: true,
  role: true,
}).extend({
  id: z.string(),
});

export type User = z.infer<typeof User>;
export type UserType = z.infer<typeof UserSchema>;
