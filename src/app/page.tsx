import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Globe2,
  MapPin,
  NotebookPen,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TripCard } from "@/components/TripCard";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: CalendarDays,
    title: "Keep dates in order",
    description:
      "Start and end dates, durations, and upcoming trips at a glance.",
  },
  {
    icon: MapPin,
    title: "Track destinations",
    description:
      "Every trip in one place, from weekend escapes to long journeys.",
  },
  {
    icon: NotebookPen,
    title: "Save the details",
    description:
      "Notes for flights, places to visit, and things you do not want to forget.",
  },
];

const HomePage = async () => {
  const user = await getCurrentUser();

  const recentTrips = user
    ? await prisma.trip.findMany({
        where: { userId: user.id },
        take: 3,
        orderBy: { createdAt: "desc" },
      })
    : [];

  const latestTrip = recentTrips[0];

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="from-sky-50 via-background to-background dark:from-sky-950/30 pointer-events-none absolute inset-0 bg-gradient-to-b"
        />
        <div
          aria-hidden
          className="bg-sky-200/40 dark:bg-sky-500/10 pointer-events-none absolute -top-24 right-[-6rem] size-80 rounded-full blur-3xl"
        />

        <div className="container relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <p className="text-sm font-medium tracking-widest text-sky-600 uppercase dark:text-sky-400">
              Travel Planner
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
              Plan your next trip, one day at a time.
            </h1>
            <p className="text-muted-foreground max-w-lg text-lg">
              Keep destinations, dates, and notes together in one calm place —
              so the only thing left to do is go.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {user ? (
                <>
                  <Link
                    href="/trips/new"
                    className={buttonVariants({ size: "lg" })}
                  >
                    Plan a trip
                  </Link>
                  <Link
                    href="/trips"
                    className={buttonVariants({ variant: "outline", size: "lg" })}
                  >
                    View my trips
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/sign-up"
                    className={buttonVariants({ size: "lg" })}
                  >
                    Create an account
                  </Link>
                  <Link
                    href="/auth/sign-in"
                    className={buttonVariants({ variant: "outline", size: "lg" })}
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div
              aria-hidden
              className="bg-sky-200/50 dark:bg-sky-500/10 absolute inset-x-4 -bottom-3 top-6 -rotate-2 rounded-xl"
            />
            <div className="relative space-y-3">
              {!user ? (
                <Card className="border border-dashed">
                  <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                    <CalendarDays className="text-muted-foreground size-8" />
                    <div className="space-y-1">
                      <p className="font-medium">Sign in to see your trips</p>
                      <p className="text-muted-foreground text-sm">
                        Your latest trip will show up right here.
                      </p>
                    </div>
                    <Link
                      href="/auth/sign-in"
                      className={buttonVariants({ size: "sm" })}
                    >
                      Sign in
                    </Link>
                  </CardContent>
                </Card>
              ) : latestTrip ? (
                <>
                  <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                    Latest trip
                  </p>
                  <TripCard trip={latestTrip} />
                </>
              ) : (
                <Card className="border border-dashed">
                  <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                    <CalendarDays className="text-muted-foreground size-8" />
                    <div className="space-y-1">
                      <p className="font-medium">Your next trip starts here</p>
                      <p className="text-muted-foreground text-sm">
                        Create a trip and it will show up right here.
                      </p>
                    </div>
                    <Link
                      href="/trips/new"
                      className={buttonVariants({ size: "sm" })}
                    >
                      Plan a trip
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardContent className="space-y-3">
                <span className="bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 flex size-10 items-center justify-center rounded-lg">
                  <Icon className="size-5" />
                </span>
                <h2 className="font-medium">{title}</h2>
                <p className="text-muted-foreground text-sm leading-6">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 pb-14">
        <Card className="from-sky-500/10 via-background to-indigo-500/10 overflow-hidden border-sky-500/20 bg-gradient-to-br">
          <CardContent className="flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
                <Globe2 className="size-6" />
              </span>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">
                  Explore your world
                </h2>
                <p className="text-muted-foreground max-w-md text-sm">
                  Spin an interactive globe, see the countries you have visited,
                  and find your next destination.
                </p>
              </div>
            </div>
            <Link
              href="/explore"
              className={buttonVariants({ size: "lg" })}
            >
              Open world explorer
              <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      {recentTrips.length > 0 ? (
        <section className="container mx-auto max-w-6xl px-4 pb-14">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Recent trips
              </h2>
              <p className="text-muted-foreground text-sm">
                Your latest plans, ready when you are.
              </p>
            </div>
            <Link
              href="/trips"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium"
            >
              View all
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="container mx-auto max-w-6xl px-4 pb-16">
        <Card className="bg-muted/40">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Ready for your next adventure?
            </h2>
            <p className="text-muted-foreground max-w-md text-sm">
              Start with a destination and dates. You can fill in the rest
              later.
            </p>
            <Link
              href={user ? "/trips/new" : "/auth/sign-up"}
              className={buttonVariants()}
            >
              {user ? "Plan a trip" : "Get started"}
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default HomePage;
