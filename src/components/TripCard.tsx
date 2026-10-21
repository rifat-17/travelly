import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Pencil,
  Undo2,
} from "lucide-react";
import { toggleTripDone } from "@/app/trips/actions";
import { DeleteTripButton } from "@/components/DeleteTripButton";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TripStatusBadge } from "@/components/TripStatusBadge";
import { cn } from "@/lib/utils";
import {
  formatDateRange,
  getTripDurationDays,
  getTripStatus,
} from "@/lib/trips";

type TripCardTrip = {
  id: string;
  title: string;
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  notes: string | null;
  completedAt: Date | null;
};

function TripCard({ trip, className }: { trip: TripCardTrip; className?: string }) {
  const status = getTripStatus(trip.startDate, trip.endDate, trip.completedAt);
  const duration = getTripDurationDays(trip.startDate, trip.endDate);
  const completed = Boolean(trip.completedAt);

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-foreground/20",
        className
      )}
    >
      <Link
        href={`/trips/${trip.id}`}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 z-0 rounded-xl"
      />

      <CardHeader className="pointer-events-none relative z-10">
        <CardTitle className="truncate">{trip.title}</CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{trip.destination}</span>
        </CardDescription>
        <CardAction>
          <TripStatusBadge status={status} />
        </CardAction>
      </CardHeader>

      <CardContent className="pointer-events-none relative z-10 flex-1 space-y-3">
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <CalendarDays className="size-3.5 shrink-0" />
          <span className="truncate">
            {formatDateRange(trip.startDate, trip.endDate)}
          </span>
        </p>
        {trip.notes ? (
          <p className="text-muted-foreground line-clamp-3 text-sm">
            {trip.notes}
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="relative z-10 flex-col items-stretch gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-sm">
            {duration ? `${duration}-day trip` : "Date range open"}
          </span>
          <Link
            href={`/trips/${trip.id}`}
            aria-label={`View ${trip.title}`}
            className="hover:text-foreground inline-flex items-center gap-1 rounded-sm text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            View details
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Link
            href={`/trips/${trip.id}/edit`}
            aria-label={`Edit ${trip.title}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Pencil className="size-3.5" />
            Edit
          </Link>

          <form action={toggleTripDone}>
            <input type="hidden" name="id" value={trip.id} />
            <Button
              type="submit"
              variant={completed ? "secondary" : "outline"}
              size="sm"
              aria-label={
                completed
                  ? `Reopen ${trip.title}`
                  : `Mark ${trip.title} as done`
              }
            >
              {completed ? (
                <Undo2 className="size-3.5" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              {completed ? "Reopen" : "Mark As Done"}
            </Button>
          </form>

          <DeleteTripButton tripId={trip.id} title={trip.title} />
        </div>
      </CardFooter>
    </Card>
  );
}

export { TripCard };
