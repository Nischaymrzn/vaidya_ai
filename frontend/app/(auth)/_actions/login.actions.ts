import { LoginFormData } from "../_schemas/schemas";

export async function loginAction(values: LoginFormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("login", values);
}
