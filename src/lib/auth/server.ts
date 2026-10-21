import { createNeonAuth } from "@neondatabase/auth/next/server";

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const secret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!secret) {
  throw new Error(
    "NEON_AUTH_COOKIE_SECRET is missing. Add a 32+ character secret to .env."
  );
}

if (!baseUrl) {
  console.warn(
    "[auth] NEON_AUTH_BASE_URL is not set. Add your Neon Auth URL to .env to enable sign-in."
  );
}

export const auth = createNeonAuth({
  baseUrl: baseUrl ?? "",
  cookies: {
    secret,
  },
});
