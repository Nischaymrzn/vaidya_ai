import z, { number } from "zod";
import { UserSchema } from "../types/user.types";

export const CreateUserDTO = z
  .object({
    email: z.string().email(),
    name: z.string().min(1),
    password: z.string().min(6),
    number: z.int().optional(),
    confirmPassword: z.string().min(6),
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
