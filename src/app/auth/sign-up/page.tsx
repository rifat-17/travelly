import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { getCurrentUser } from "@/lib/auth/session";
import { SignUpForm } from "./sign-up-form";

export const metadata = {
  title: "Create account | Travel Planner",
};

export const dynamic = "force-dynamic";

export default async function SignUpPage() {
  if (await getCurrentUser()) {
    redirect("/trips");
  }

  return (
    <AuthShell
      title="Create your account"
      description="Start planning and keeping track of your trips."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="text-foreground font-medium hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
