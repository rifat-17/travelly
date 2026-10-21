import type { TripStatus } from "./trips";

export type ExploreCountry = {
  code: string;
  name: string;
  region: string;
  subregion: string;
  capital: string;
  flag: string;
  currency: string;
  languages: string;
  center: [number, number];
  independent: boolean;
};

export type ExploreTrip = {
  id: string;
  title: string;
  destination: string;
  startDate: string | null;
  endDate: string | null;
  status: TripStatus;
  countryCode: string | null;
  countryName: string | null;
};

export type CountryTripStats = {
  total: number;
  past: number;
  planned: number;
  upcoming: number;
  ongoing: number;
  unscheduled: number;
  nextStart: string | null;
};

export type ExploreFilter = "all" | "visited" | "planned";
