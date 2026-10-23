import { headers } from "next/headers";

type AuthFailure = {
  code?: string;
  message?: string;
};

/**
 * Makes the most common deployment failure actionable. Neon Auth rejects
 * requests from origins that are not on the branch's trusted-domain list.
 * Localhost is pre-approved, which is why this usually only appears after
 * deploying.
 */
export async function getAuthErrorMessage(
  error: AuthFailure,
  fallback: string
) {
  if (error.code !== "INVALID_ORIGIN") {
    return error.message || fallback;
  }

  const requestHeaders = await headers();
  const origin =
    requestHeaders.get("origin") ??
    requestHeaders.get("referer")?.split("/").slice(0, 3).join("/") ??
    "This site";

  console.error("[auth] Origin rejected by Neon Auth:", origin);

  return `${origin} is not authorized by Neon Auth. Add it under Neon Console → Auth → Configuration → Domains, then try again.`;
}
