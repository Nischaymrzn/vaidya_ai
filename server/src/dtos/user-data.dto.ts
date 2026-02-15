import z from "zod";
import { UserDataSchema } from "../types/user-data.types";

export const UpdateUserDataDto = UserDataSchema.omit({
  userId: true,
  latestVitals: true,
}).partial();
export type UpdateUserDataDto = z.infer<typeof UpdateUserDataDto>;
