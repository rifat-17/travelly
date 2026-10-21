import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { toDateInputValue } from "@/lib/trip-form";
import { updateTrip } from "@/app/trips/actions";
import { TripForm } from "@/app/trips/new/trip-form";

export const metadata = {
  title: "Edit Trip | Travel Planner",
};

export const dynamic = "force-dynamic";

const EditTripPage = async ({ params }: PageProps<"/trips/[id]/edit">) => {
  const { id } = await params;
  const user = await requireUser();
  const trip = await prisma.trip.findFirst({
    where: { id, userId: user.id },
  });

  if (!trip) {
    notFound();
  }

  return (
    <div className="container mx-auto mt-10 max-w-2xl space-y-4 px-4 pb-10">
      <Link
        href={`/trips/${trip.id}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" />
        Back to trip
      </Link>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Edit trip</CardTitle>
          <CardDescription>
            Update the details of {trip.title}. Your notes and dates stay in
            sync everywhere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TripForm
            key={trip.id}
            action={updateTrip}
            tripId={trip.id}
            initialValues={{
              title: trip.title,
              destination: trip.destination,
              startDate: toDateInputValue(trip.startDate),
              endDate: toDateInputValue(trip.endDate),
              notes: trip.notes ?? "",
            }}
            submitLabel="Save changes"
            pendingLabel="Saving..."
            cancelHref={`/trips/${trip.id}`}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTripPage;
