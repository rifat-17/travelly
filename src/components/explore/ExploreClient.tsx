"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Compass,
  Globe2,
  MapPin,
  Shuffle,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { WorldGlobe } from "@/components/explore/WorldGlobe";
import { TripStatusBadge } from "@/components/TripStatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  CountryTripStats,
  ExploreCountry,
  ExploreFilter,
  ExploreTrip,
} from "@/lib/explore";
import { formatDate, formatDateRange } from "@/lib/trips";
import { cn } from "@/lib/utils";

type ExploreClientProps = {
  countries: ExploreCountry[];
  numericToCode: Record<string, string>;
  trips: ExploreTrip[];
  initialCountry: string | null;
  initialFocus: [number, number] | null;
  isSignedIn: boolean;
};

const FILTERS: { value: ExploreFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "visited", label: "Visited" },
  { value: "planned", label: "Planned" },
];

const LEGEND = [
  { label: "Visited", dot: "bg-sky-500" },
  { label: "Planned", dot: "bg-indigo-500" },
  { label: "Both", dot: "bg-emerald-500" },
  { label: "Not yet", dot: "bg-slate-700" },
];

const REGION_ORDER = ["Asia", "Europe", "Africa", "Americas", "Oceania", "Antarctic"];

const STATUS_ORDER = {
  ongoing: 0,
  upcoming: 1,
  unscheduled: 2,
  completed: 3,
  past: 4,
} as const;

function buildStats(trips: ExploreTrip[]) {
  const result: Record<string, CountryTripStats> = {};

  for (const trip of trips) {
    if (!trip.countryCode) continue;

    const stats = result[trip.countryCode] ?? {
      total: 0,
      past: 0,
      planned: 0,
      upcoming: 0,
      ongoing: 0,
      unscheduled: 0,
      nextStart: null,
    };

    stats.total += 1;

    if (trip.status === "past" || trip.status === "completed") {
      stats.past += 1;
    } else if (trip.status === "upcoming") {
      stats.upcoming += 1;
      stats.planned += 1;
    } else if (trip.status === "ongoing") {
      stats.ongoing += 1;
      stats.planned += 1;
    } else {
      stats.unscheduled += 1;
      stats.planned += 1;
    }

    if (trip.status === "upcoming" && trip.startDate) {
      if (!stats.nextStart || trip.startDate < stats.nextStart) {
        stats.nextStart = trip.startDate;
      }
    }

    result[trip.countryCode] = stats;
  }

  return result;
}

function matchesFilter(
  stats: CountryTripStats | undefined,
  filter: ExploreFilter
) {
  if (filter === "all") return true;
  if (!stats) return false;
  return filter === "visited" ? stats.past > 0 : stats.planned > 0;
}

function formatTripRange(trip: ExploreTrip) {
  return formatDateRange(
    trip.startDate ? new Date(trip.startDate) : null,
    trip.endDate ? new Date(trip.endDate) : null
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  signedIn,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  signedIn: boolean;
}) {
  return (
    <Card className="bg-card/70">
      <CardContent className="flex items-center gap-3 py-4">
        <span className="bg-sky-500/10 text-sky-400 flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold tracking-tight">
            {signedIn ? value : "—"}
          </p>
          <p className="text-muted-foreground text-xs leading-tight">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-muted/40 rounded-lg border p-2">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-muted-foreground text-[0.65rem] tracking-wider uppercase">
        {label}
      </p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/30 rounded-lg border p-2.5">
      <dt className="text-muted-foreground text-[0.65rem] font-medium tracking-widest uppercase">
        {label}
      </dt>
      <dd
        className="mt-1 line-clamp-2 text-xs font-medium break-words"
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

function FilterToggle({
  filter,
  onChange,
}: {
  filter: ExploreFilter;
  onChange: (filter: ExploreFilter) => void;
}) {
  return (
    <div className="border-border bg-muted/30 inline-flex items-center gap-1 rounded-lg border p-1">
      {FILTERS.map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={filter === item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "min-h-8 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            filter === item.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {LEGEND.map((item) => (
        <span
          key={item.label}
          className="text-muted-foreground inline-flex items-center gap-1.5 text-xs"
        >
          <span
            className={cn("size-2 rounded-full ring-1 ring-white/10", item.dot)}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function CountryPanel({
  country,
  stats,
  trips,
  isSignedIn,
  onClear,
}: {
  country: ExploreCountry | null;
  stats: CountryTripStats | undefined;
  trips: ExploreTrip[];
  isSignedIn: boolean;
  onClear: () => void;
}) {
  if (!country) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pick a country</CardTitle>
          <CardDescription>
            Click the globe or use the picker. Every country is a possible next
            trip.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 rounded-xl border border-dashed p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Compass className="text-sky-400 size-4" />
              How it works
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">
              Countries with trips light up. Hover for a quick summary, click
              for details, then plan your next trip with the destination
              pre-filled.
            </p>
          </div>
          <p className="text-muted-foreground text-sm">
            {isSignedIn
              ? "Tip: include the country name in a trip's destination (for example, “Tokyo, Japan”) and it will appear on the globe."
              : "Sign in to see your own travel footprint light up the globe."}
          </p>
          {!isSignedIn ? (
            <Link
              href="/auth/sign-in"
              className={buttonVariants({ className: "w-full" })}
            >
              Sign in to explore
            </Link>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const location =
    country.subregion === country.region
      ? country.region
      : `${country.subregion} · ${country.region}`;

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-xl text-3xl"
              aria-hidden="true"
            >
              {country.flag}
            </span>
            <div className="min-w-0">
              <CardTitle className="truncate text-xl">
                {country.name}
              </CardTitle>
              <CardDescription className="truncate">
                {location}
              </CardDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-9 lg:size-7"
            onClick={onClear}
            aria-label={`Clear ${country.name}`}
          >
            <X />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {stats ? (
          <div className="grid grid-cols-3 gap-2 text-center">
            <MiniStat label="Trips" value={stats.total} />
            <MiniStat label="Visited" value={stats.past} />
            <MiniStat label="Planned" value={stats.planned} />
          </div>
        ) : null}

        <dl className="grid grid-cols-2 gap-2">
          <Fact label="Capital" value={country.capital} />
          <Fact label="Region" value={country.region} />
          <Fact label="Currency" value={country.currency} />
          <Fact label="Languages" value={country.languages} />
        </dl>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium">Your trips</h3>
            <span className="text-muted-foreground text-xs">
              {trips.length} total
            </span>
          </div>

          {trips.length > 0 ? (
            <ul className="space-y-2">
              {trips.map((trip) => (
                <li key={trip.id}>
                  <Link
                    href={`/trips/${trip.id}`}
                    className="group border-border/70 hover:bg-muted/60 flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="group-hover:text-sky-400 block truncate text-sm font-medium">
                        {trip.title}
                      </span>
                      <span className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                        <CalendarDays className="size-3 shrink-0" />
                        <span className="truncate">
                          {formatTripRange(trip)}
                        </span>
                      </span>
                    </span>
                    <TripStatusBadge status={trip.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
              No trips here yet. This could be your next one.
            </p>
          )}
        </div>

        <Link
          href={
            isSignedIn
              ? `/trips/new?destination=${encodeURIComponent(country.name)}`
              : "/auth/sign-up"
          }
          className={buttonVariants({ className: "h-10 w-full lg:h-8" })}
        >
          {isSignedIn
            ? `Plan a trip to ${country.name}`
            : "Create an account to plan this trip"}
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

function RegionBreakdown({
  rows,
  total,
  isSignedIn,
}: {
  rows: [string, number][];
  total: number;
  isSignedIn: boolean;
}) {
  const max = Math.max(...rows.map(([, count]) => count), 1);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Travel footprint</CardTitle>
        <CardDescription>Mapped trips by region</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.length > 0 ? (
          rows.map(([region, count]) => (
            <div key={region} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span>{region}</span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className="from-sky-500 to-indigo-500 h-full rounded-full bg-gradient-to-r"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">
            {isSignedIn
              ? "Plan a trip to start building your footprint."
              : "Sign in to see where your trips take you."}
          </p>
        )}
        {rows.length > 0 ? (
          <p className="text-muted-foreground pt-1 text-xs">
            {total} mapped {total === 1 ? "trip" : "trips"} across {rows.length}{" "}
            {rows.length === 1 ? "region" : "regions"}.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ExploreClient({
  countries,
  numericToCode,
  trips,
  initialCountry,
  initialFocus,
  isSignedIn,
}: ExploreClientProps) {
  const initialSelected =
    initialCountry && countries.some((country) => country.code === initialCountry)
      ? initialCountry
      : null;

  const [selectedCode, setSelectedCode] = useState<string | null>(
    initialSelected
  );
  const [filter, setFilter] = useState<ExploreFilter>("all");
  const panelRef = useRef<HTMLDivElement>(null);

  const countriesByCode = useMemo(
    () => new Map(countries.map((country) => [country.code, country])),
    [countries]
  );

  const stats = useMemo(() => buildStats(trips), [trips]);

  const mappedTrips = useMemo(
    () => trips.filter((trip) => Boolean(trip.countryCode)),
    [trips]
  );

  const unmappedCount = trips.length - mappedTrips.length;

  const visitedCodes = useMemo(
    () =>
      new Set(
        trips
          .filter(
            (trip) =>
              trip.status === "past" || trip.status === "completed"
          )
          .map((trip) => trip.countryCode)
          .filter((code): code is string => Boolean(code))
      ),
    [trips]
  );

  const plannedCodes = useMemo(
    () =>
      new Set(
        trips
          .filter(
            (trip) =>
              trip.status !== "past" && trip.status !== "completed"
          )
          .map((trip) => trip.countryCode)
          .filter((code): code is string => Boolean(code))
      ),
    [trips]
  );

  const regionCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const trip of mappedTrips) {
      if (!trip.countryCode) continue;
      const region = countriesByCode.get(trip.countryCode)?.region;
      if (!region) continue;
      counts.set(region, (counts.get(region) ?? 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [mappedTrips, countriesByCode]);

  const regionOptions = useMemo(() => {
    return [...new Set(countries.map((country) => country.region))].sort(
      (a, b) => {
        const aIndex = REGION_ORDER.indexOf(a);
        const bIndex = REGION_ORDER.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      }
    );
  }, [countries]);

  const countryNames = useMemo(
    () =>
      Object.fromEntries(
        countries.map((country) => [country.code, country.name])
      ),
    [countries]
  );

  const countryCards = useMemo(() => {
    return countries
      .filter((country) => (stats[country.code]?.total ?? 0) > 0)
      .filter((country) =>
        matchesFilter(stats[country.code], filter)
      )
      .sort((a, b) => {
        const tripDifference =
          (stats[b.code]?.total ?? 0) - (stats[a.code]?.total ?? 0);
        return tripDifference !== 0
          ? tripDifference
          : a.name.localeCompare(b.name);
      });
  }, [countries, stats, filter]);

  const selectedCountry = selectedCode
    ? countriesByCode.get(selectedCode) ?? null
    : null;
  const selectedStats = selectedCode ? stats[selectedCode] : undefined;

  const countryTrips = useMemo(() => {
    if (!selectedCode) return [];

    return mappedTrips
      .filter((trip) => trip.countryCode === selectedCode)
      .sort((a, b) => {
        const statusDifference =
          STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        if (statusDifference !== 0) return statusDifference;
        return (a.startDate ?? "9999").localeCompare(b.startDate ?? "9999");
      });
  }, [mappedTrips, selectedCode]);

  function selectCountry(code: string | null) {
    setSelectedCode(code);

    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    if (code) {
      url.searchParams.set("country", code);
    } else {
      url.searchParams.delete("country");
    }
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`
    );

    if (code && window.innerWidth < 768) {
      requestAnimationFrame(() => {
        panelRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }

  function surpriseMe() {
    const pool = countries.filter((country) => {
      if (country.code === selectedCode) return false;
      if (!country.independent) return false;
      if (!isSignedIn) return true;
      return (stats[country.code]?.past ?? 0) === 0;
    });

    const fallback = countries.filter(
      (country) =>
        country.code !== selectedCode &&
        country.independent &&
        country.region !== "Antarctic"
    );
    const options = pool.length > 0 ? pool : fallback;
    const pick = options[Math.floor(Math.random() * options.length)];

    if (pick) selectCountry(pick.code);
  }

  const cardDescription = !isSignedIn
    ? "Sign in to map the places you have been."
    : filter === "all"
      ? `${countryCards.length} ${countryCards.length === 1 ? "country" : "countries"} with trips`
      : filter === "visited"
        ? `${countryCards.length} visited ${countryCards.length === 1 ? "country" : "countries"}`
        : `${countryCards.length} planned ${countryCards.length === 1 ? "country" : "countries"}`;

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden="true"
          className="from-sky-500/10 via-background to-background pointer-events-none absolute inset-0 bg-gradient-to-b"
        />
        <div
          aria-hidden="true"
          className="bg-sky-500/10 pointer-events-none absolute -top-32 right-[-8rem] size-96 rounded-full blur-3xl"
        />

        <div className="container relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <p className="text-sm font-medium tracking-widest text-sky-400 uppercase">
                World explorer
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                See your world at a glance.
              </h1>
              <p className="text-muted-foreground max-w-xl text-lg">
                Spin the globe, revisit the countries you have explored, and
                pick where to go next.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 lg:h-8"
                onClick={surpriseMe}
              >
                <Shuffle className="size-4" />
                Surprise me
              </Button>
              <Link
                href={isSignedIn ? "/trips/new" : "/auth/sign-up"}
                className={buttonVariants({ className: "h-9 lg:h-8" })}
              >
                {isSignedIn ? "Plan a trip" : "Create an account"}
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={Globe2}
              label="Countries visited"
              value={visitedCodes.size}
              signedIn={isSignedIn}
            />
            <StatCard
              icon={CalendarDays}
              label="Countries planned"
              value={plannedCodes.size}
              signedIn={isSignedIn}
            />
            <StatCard
              icon={MapPin}
              label="Trips on the map"
              value={mappedTrips.length}
              signedIn={isSignedIn}
            />
            <StatCard
              icon={Compass}
              label="Regions mapped"
              value={regionCounts.length}
              signedIn={isSignedIn}
            />
          </div>

          {isSignedIn && unmappedCount > 0 ? (
            <p className="text-muted-foreground mt-3 text-xs">
              {unmappedCount} {unmappedCount === 1 ? "trip is" : "trips are"}{" "}
              not mapped to a country. Add the country name to the destination
              (for example, “Tokyo, Japan”) to see it on the globe.
            </p>
          ) : null}
        </div>
      </section>

      <section className="container mx-auto max-w-6xl px-4 py-8">
        <p className="sr-only" aria-live="polite">
          {selectedCountry ? `Selected ${selectedCountry.name}` : ""}
        </p>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] md:items-start">
          <Card className="overflow-hidden md:col-start-1 md:row-start-1">
              <CardHeader className="border-b">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <select
                    aria-label="Jump to a country"
                    value={selectedCode ?? ""}
                    onChange={(event) =>
                      selectCountry(event.target.value || null)
                    }
                    className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-10 w-full min-w-0 rounded-lg border px-3 text-sm shadow-xs outline-none focus-visible:ring-3 lg:h-9 lg:w-56"
                  >
                    <option value="">Jump to a country…</option>
                    {regionOptions.map((region) => (
                      <optgroup key={region} label={region}>
                        {countries
                          .filter((country) => country.region === region)
                          .map((country) => (
                            <option key={country.code} value={country.code}>
                              {country.flag} {country.name}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>

                  <FilterToggle filter={filter} onChange={setFilter} />
                </div>
              </CardHeader>

              <CardContent className="space-y-3 p-3 sm:p-4">
                <WorldGlobe
                  numericToCode={numericToCode}
                  names={countryNames}
                  stats={stats}
                  selectedCode={selectedCode}
                  filter={filter}
                  focus={initialFocus}
                  onSelect={selectCountry}
                />
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                  <Legend />
                  <p className="text-muted-foreground text-xs">
                    Drag to spin · Click a country
                  </p>
                </div>
              </CardContent>
            </Card>

            <div
              ref={panelRef}
              className="scroll-mt-20 md:col-start-2 md:row-start-1"
            >
              <CountryPanel
                country={selectedCountry}
                stats={selectedStats}
                trips={countryTrips}
                isSignedIn={isSignedIn}
                onClear={() => selectCountry(null)}
              />
            </div>

            <Card className="md:col-start-1 md:row-start-2">
              <CardHeader className="border-b">
                <CardTitle>Your countries</CardTitle>
                <CardDescription>{cardDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                {countryCards.length > 0 ? (
                  <div className="grid gap-2 lg:grid-cols-2">
                    {countryCards.map((country) => {
                      const countryStats = stats[country.code];
                      const isSelected = selectedCode === country.code;
                      const summary = countryStats?.nextStart
                        ? `Next ${formatDate(new Date(countryStats.nextStart))}`
                        : `${countryStats?.total ?? 0} ${
                            countryStats?.total === 1 ? "trip" : "trips"
                          }`;

                      return (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => selectCountry(country.code)}
                          className={cn(
                            "group border-border/70 hover:border-sky-500/40 hover:bg-muted/60 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                            isSelected && "border-sky-500/60 bg-sky-500/10"
                          )}
                        >
                          <span className="text-2xl" aria-hidden="true">
                            {country.flag}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {country.name}
                            </span>
                            <span className="text-muted-foreground block truncate text-xs">
                              {summary}
                            </span>
                          </span>
                          <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center">
                    <Globe2 className="text-muted-foreground mx-auto size-8" />
                    <p className="mt-3 text-sm font-medium">
                      {!isSignedIn
                        ? "Sign in to light up your map"
                        : mappedTrips.length === 0
                          ? "No countries mapped yet"
                          : "No countries in this view"}
                    </p>
                    <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-sm">
                      {!isSignedIn
                        ? "Your visited and planned countries will show up here."
                        : mappedTrips.length === 0
                          ? "Include the country name in a destination (for example, Tokyo, Japan) and it will appear on the globe."
                          : "Try a different filter to see your other countries."}
                    </p>
                    <div className="mt-4">
                      {!isSignedIn ? (
                        <Link
                          href="/auth/sign-in"
                          className={buttonVariants({
                            size: "sm",
                            className: "h-9 lg:h-7",
                          })}
                        >
                          Sign in
                        </Link>
                      ) : mappedTrips.length === 0 ? (
                        <Link
                          href="/trips/new"
                          className={buttonVariants({
                            size: "sm",
                            className: "h-9 lg:h-7",
                          })}
                        >
                          Plan a trip
                        </Link>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 lg:h-7"
                          onClick={() => setFilter("all")}
                        >
                          Show all
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="md:col-start-2 md:row-start-2">
              <RegionBreakdown
                rows={regionCounts}
                total={mappedTrips.length}
                isSignedIn={isSignedIn}
              />
            </div>
        </div>
      </section>
    </main>
  );
}
