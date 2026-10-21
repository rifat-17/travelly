import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TripForm } from "./trip-form";
import { requireUser } from "@/lib/auth/session";

export const metadata = {
  title: "New Trip | Travel Planner",
};

export const dynamic = "force-dynamic";

const NewTripsPage = async ({ searchParams }: PageProps<"/trips/new">) => {
  await requireUser();

  const params = await searchParams;
  const initialDestination =
    typeof params.destination === "string"
      ? params.destination.slice(0, 100)
      : "";

  return (
    <div className="container mx-auto mt-10 max-w-2xl px-4 pb-10">
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg">New Trip</CardTitle>
          <CardDescription>
            Add the basics of your trip. You can fill in the itinerary later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TripForm
            key={initialDestination}
            initialValues={{ destination: initialDestination }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewTripsPage;
