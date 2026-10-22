import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  NEON_AUTH_SESSION_COOKIE_NAME,
  handleAuthProxyRequest,
  parseSessionData,
} from "@neondatabase/auth/server";
import prisma from "@/lib/prisma";

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;
const SESSION_REQUEST_TIMEOUT_MS = 5_000;

function isAuthConfigured() {
  return Boolean(baseUrl && cookieSecret);
}

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || null;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error("Auth session request timed out")),
        timeoutMs
      );
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * Reads the current session without mutating cookies.
 *
 * `auth.getSession()` proxies to the auth server and persists refreshed
 * cookies. That is fine in Server Actions and Route Handlers, but Next.js
 * forbids cookie writes while rendering a Server Component, which made the
 * SDK throw and every request look signed out. The proxy helper below performs
 * the same read (including the signed session cache) without touching cookies.
 */
async function readSession() {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie");

  if (!cookieHeader?.includes(NEON_AUTH_SESSION_COOKIE_NAME)) {
    return null;
  }

  const forwardedHost = firstHeaderValue(
    requestHeaders.get("x-forwarded-host")
  );
  const host = forwardedHost ?? requestHeaders.get("host") ?? "localhost";
  const forwardedProtocol = firstHeaderValue(
    requestHeaders.get("x-forwarded-proto")
  )?.toLowerCase();
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : process.env.NODE_ENV === "production"
        ? "https"
        : "http";
  const origin = `${protocol}://${host}`;

  try {
    const response = await withTimeout(
      handleAuthProxyRequest({
        request: new Request(`${origin}/api/auth/get-session`, {
          method: "GET",
          headers: {
            cookie: cookieHeader,
            origin,
            referer: `${origin}/`,
          },
        }),
        path: "get-session",
        baseUrl: baseUrl!,
        cookieSecret: cookieSecret!,
      }),
      SESSION_REQUEST_TIMEOUT_MS
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json().catch(() => null);
    return parseSessionData(data);
  } catch (error) {
    console.error("[auth] Failed to load the session:", error);
    return null;
  }
}

export const getCurrentUser = cache(async () => {
  if (!isAuthConfigured()) {
    return null;
  }

  const session = await readSession();
  return session?.user ?? null;
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
