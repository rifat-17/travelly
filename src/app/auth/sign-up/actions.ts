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

export async function signUpWithEmail(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = readField(formData, "name").trim();
  const email = readField(formData, "email").trim();
  const password = readField(formData, "password");
  const confirmPassword = readField(formData, "confirmPassword");

  if (!name) {
    return { error: "Enter your name." };
  }

  if (!email) {
    return { error: "Enter your email address." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    const { error } = await auth.signUp.email({ email, name, password });

    if (error) {
      return {
        error: await getAuthErrorMessage(
          error,
          "Unable to create your account. Try again."
        ),
      };
    }
  } catch (error) {
    console.error("[auth] Sign up failed:", error);
    return {
      error: "Unable to reach the auth service. Try again in a moment.",
    };
  }

  redirect("/trips");
}
