import Link from "next/link";
import { Globe2, MapPin } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { Logo } from "@/components/Logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";

const Navbar = async () => {
  const user = await getCurrentUser();

  return (
    <nav className="sticky top-0 z-40 border-b border-border/70 bg-background/90 py-3 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Travel Planner home"
          className="shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Logo />
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/explore"
            aria-label="Explore the world"
            className="inline-flex size-9 items-center justify-center gap-1.5 rounded-lg text-sm font-medium text-foreground/90 transition-colors hover:text-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 sm:w-auto sm:justify-start sm:px-1"
          >
            <Globe2 className="size-4 sm:hidden" />
            <span className="hidden sm:inline">Explore</span>
          </Link>

          {user ? (
            <>
              <Link
                href="/trips"
                aria-label="My trips"
                className="inline-flex size-9 items-center justify-center gap-1.5 rounded-lg text-sm font-medium text-foreground/90 transition-colors hover:text-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 sm:w-auto sm:justify-start sm:px-1"
              >
                <MapPin className="size-4 sm:hidden" />
                <span className="hidden sm:inline">My Trips</span>
              </Link>
              <span className="hidden max-w-40 truncate text-sm text-muted-foreground lg:inline">
                {user.name || user.email}
              </span>
              <form action={signOut}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="h-9 lg:h-7"
                >
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="inline-flex h-9 items-center rounded-lg px-1.5 text-sm font-medium text-foreground/90 transition-colors hover:text-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 sm:px-0"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className={buttonVariants({
                  size: "sm",
                  className: "h-9 lg:h-7",
                })}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
