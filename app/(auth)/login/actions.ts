"use server";

import { signIn } from "@/auth";

export async function loginWithEmail(formData: FormData) {
  const email = formData.get("email");
  if (typeof email !== "string" || !email) {
    throw new Error("이메일을 입력해주세요");
  }
  await signIn("resend", { email, redirectTo: "/" });
}
