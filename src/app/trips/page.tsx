import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TripCard } from "@/components/TripCard";
import { claimLegacyTrips, requireUser } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TripsPage = async () => {
  const user = await requireUser();
  await claimLegacyTrips(user.id);

  const trips = await prisma.trip.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Trips</h1>
          <p className="text-muted-foreground">
            {trips.length === 0
              ? "Plan your first adventure."
              : `${trips.length} ${trips.length === 1 ? "trip" : "trips"} planned.`}
          </p>
        </div>
        <Link href="/trips/new" className={buttonVariants()}>
          New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <h2 className="text-lg font-medium">No trips yet</h2>
            <p className="text-muted-foreground max-w-sm text-sm">
              Create a trip to keep track of where you are going and when.
            </p>
            <Link href="/trips/new" className={buttonVariants()}>
              Plan a trip
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TripsPage;
