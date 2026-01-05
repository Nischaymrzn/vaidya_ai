import z, { number } from "zod";
import { UserSchema } from "../types/user.types";

export const CreateUserDTO = z
  .object({
    email: z
      .string()
      .email()
      .email({ message: "Invalid email address" })
      .min(5, { message: "Email must be at least 5 characters" }),
    name: z.string().min(1),
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
    number: z.int().optional(),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginUserDTO = UserSchema.pick({
  email: true,
  password: true,
});

export type loginUserDTO = z.infer<typeof loginUserDTO>;
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;
