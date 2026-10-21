import { cache } from "react";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "./server";

function isAuthConfigured() {
  return Boolean(process.env.NEON_AUTH_BASE_URL);
}

export const getCurrentUser = cache(async () => {
  if (!isAuthConfigured()) {
    return null;
  }

  try {
    const { data: session } = await auth.getSession();
    return session?.user ?? null;
  } catch (error) {
    console.error("[auth] Failed to load the session:", error);
    return null;
  }
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return user;
}

/**
 * Trips created before Neon Auth was added have no owner. When the first user
 * signs in, adopt those trips so they are not lost.
 */
export async function claimLegacyTrips(userId: string) {
  await prisma.trip.updateMany({
    where: { userId: null },
    data: { userId },
  });
}
