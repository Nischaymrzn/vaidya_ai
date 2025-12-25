import { SignupFormData } from "../_schemas/schemas";

export async function signupAction(values: SignupFormData) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("signup", values);
}
