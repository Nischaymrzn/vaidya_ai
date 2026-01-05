import bcrypt from "bcryptjs";
import { env } from "../config/env";

export const bcryptUtil = {
  async generate(password: string, saltRounds: number) {
    return await bcrypt.hash(password + env.SECRET_KEY, saltRounds);
  },
  async compare(password: string, hash: string) {
    return await bcrypt.compare(password + env.SECRET_KEY, hash);
  },
};
