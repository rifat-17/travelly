import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TripStatusBadge } from "@/components/TripStatusBadge";
import { requireUser } from "@/lib/auth/session";
import { getTripCountry } from "@/lib/countries";
import prisma from "@/lib/prisma";
import {
  formatDate,
  formatDateRange,
  formatDateTime,
  getTripDurationDays,
  getTripStatus,
} from "@/lib/trips";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/trips/[id]">) {
  const { id } = await params;
  const user = await requireUser();
  const trip = await prisma.trip.findFirst({
    where: { id, userId: user.id },
    select: { title: true },
  });

  return {
    title: trip ? `${trip.title} | Travel Planner` : "Trip not found",
  };
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

const TripDetailPage = async ({ params }: PageProps<"/trips/[id]">) => {
  const { id } = await params;
  const user = await requireUser();
  const trip = await prisma.trip.findFirst({
    where: { id, userId: user.id },
  });

  if (!trip) {
    notFound();
  }

  const status = getTripStatus(
    trip.startDate,
    trip.endDate,
    trip.completedAt
  );
  const duration = getTripDurationDays(trip.startDate, trip.endDate);
  const country = getTripCountry(trip);

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Link
        href="/trips"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" />
        Back to trips
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{trip.title}</h1>
            <p className="text-muted-foreground flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0" />
              {trip.destination}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TripStatusBadge status={status} />
            <Link
              href={`/trips/${trip.id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Pencil className="size-3.5" />
              Edit trip
            </Link>
          </div>
        </div>

        <p className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <CalendarDays className="size-4 shrink-0" />
          <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          {duration ? (
            <>
              <span aria-hidden>·</span>
              <span>
                {duration} {duration === 1 ? "day" : "days"}
              </span>
            </>
          ) : null}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              Everything you want to remember about this trip.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p
              className={
                trip.notes
                  ? "text-sm leading-6 whitespace-pre-line"
                  : "text-muted-foreground text-sm"
              }
            >
              {trip.notes || "No notes yet."}
            </p>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Trip details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <DetailRow label="Destination" value={trip.destination} />
              <DetailRow
                label="Country"
                value={
                  country ? (
                    <Link
                      href={`/explore?country=${country.code}`}
                      className="inline-flex items-center gap-1.5 text-sky-400 hover:underline"
                    >
                      <span aria-hidden="true">{country.flag}</span>
                      {country.name}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Not mapped</span>
                  )
                }
              />
              <DetailRow
                label="Start date"
                value={trip.startDate ? formatDate(trip.startDate) : "Not set"}
              />
              <DetailRow
                label="End date"
                value={trip.endDate ? formatDate(trip.endDate) : "Not set"}
              />
              <DetailRow
                label="Duration"
                value={
                  duration
                    ? `${duration} ${duration === 1 ? "day" : "days"}`
                    : "Not set"
                }
              />
              {trip.completedAt ? (
                <DetailRow
                  label="Completed"
                  value={formatDateTime(trip.completedAt)}
                />
              ) : null}

              <div className="space-y-3 border-t pt-3">
                <DetailRow
                  label="Created"
                  value={formatDateTime(trip.createdAt)}
                />
                <DetailRow
                  label="Updated"
                  value={formatDateTime(trip.updatedAt)}
                />
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TripDetailPage;
