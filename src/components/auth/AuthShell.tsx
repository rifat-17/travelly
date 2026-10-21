import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        <Card>
          <CardContent>{children}</CardContent>
        </Card>

        <p className="text-muted-foreground text-center text-sm">{footer}</p>

        <p className="text-center">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
