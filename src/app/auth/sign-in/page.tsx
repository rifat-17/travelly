import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { getCurrentUser } from "@/lib/auth/session";
import { SignInForm } from "./sign-in-form";

export const metadata = {
  title: "Sign in | Travel Planner",
};

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  if (await getCurrentUser()) {
    redirect("/trips");
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to see and manage your trips."
      footer={
        <>
          Do not have an account?{" "}
          <Link href="/auth/sign-up" className="text-foreground font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthShell>
  );
}
