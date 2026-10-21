"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function signOut() {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("[auth] Sign out failed:", error);
  }

  redirect("/");
}
