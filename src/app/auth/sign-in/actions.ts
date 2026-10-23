"use server";

import { redirect } from "next/navigation";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { auth } from "@/lib/auth/server";

export type AuthFormState = {
  error?: string;
};

function readField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function signInWithEmail(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = readField(formData, "email").trim();
  const password = readField(formData, "password");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  try {
    const { error } = await auth.signIn.email({ email, password });

    if (error) {
      return {
        error: await getAuthErrorMessage(
          error,
          "Unable to sign in. Check your email and password and try again."
        ),
      };
    }
  } catch (error) {
    console.error("[auth] Sign in failed:", error);
    return {
      error: "Unable to reach the auth service. Try again in a moment.",
    };
  }

  redirect("/trips");
}
