import { ExploreClient } from "@/components/explore/ExploreClient";
import { getCurrentUser, claimLegacyTrips } from "@/lib/auth/session";
import {
  countryByCode,
  getExploreCountries,
  getExploreFocus,
  numericToCode,
  toExploreTrip,
} from "@/lib/countries";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Explore the World | Travel Planner",
  description:
    "Spin an interactive globe, see the countries you have visited, and find your next destination.",
};

export const dynamic = "force-dynamic";

const ExplorePage = async ({ searchParams }: PageProps<"/explore">) => {
  const params = await searchParams;
  const requestedCountry =
    typeof params.country === "string" ? params.country.toUpperCase() : null;
  const initialCountry =
    requestedCountry && countryByCode.has(requestedCountry)
      ? requestedCountry
      : null;

  const user = await getCurrentUser();

  let trips: Awaited<ReturnType<typeof prisma.trip.findMany>> = [];

  if (user) {
    await claimLegacyTrips(user.id);
    trips = await prisma.trip.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  }

  const exploreTrips = trips.map(toExploreTrip);

  return (
    <ExploreClient
      countries={getExploreCountries()}
      numericToCode={numericToCode}
      trips={exploreTrips}
      initialCountry={initialCountry}
      initialFocus={getExploreFocus(exploreTrips)}
      isSignedIn={Boolean(user)}
    />
  );
};

export default ExplorePage;
