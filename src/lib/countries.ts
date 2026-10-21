import worldCountries from "world-countries";
import type { ExploreCountry, ExploreTrip } from "@/lib/explore";
import { getTripStatus } from "@/lib/trips";

type WorldCountry = (typeof worldCountries)[number];

export type { ExploreCountry } from "@/lib/explore";

export type Country = {
  code: string;
  numeric: string;
  name: string;
  officialName: string;
  region: string;
  subregion: string;
  capital: string;
  flag: string;
  center: [number, number];
  currency: string;
  languages: string;
  independent: boolean;
};

function toCountry(country: WorldCountry): Country {
  return {
    code: country.cca2,
    numeric: country.ccn3,
    name: country.name.common,
    officialName: country.name.official,
    region: country.region,
    subregion: country.subregion || country.region,
    capital: country.capital.join(", ") || "—",
    flag: country.flag,
    center: [country.latlng[1], country.latlng[0]],
    currency:
      Object.values(country.currencies)
        .map((currency) => `${currency.name} (${currency.symbol})`)
        .join(", ") || "—",
    languages: Object.values(country.languages).join(", ") || "—",
    independent: country.independent,
  };
}

export const countryList: Country[] = worldCountries
  .filter((country) => country.cca2 && country.cca2 !== "-99")
  .map(toCountry)
  .sort((a, b) => a.name.localeCompare(b.name));

export const countryByCode = new Map(countryList.map((country) => [country.code, country]));

export const countryByNumeric = new Map(
  countryList
    .filter((country) => country.numeric)
    .map((country) => [country.numeric, country])
);

export const numericToCode: Record<string, string> = Object.fromEntries(
  countryList
    .filter((country) => country.numeric)
    .map((country) => [country.numeric, country.code])
);

export function getExploreCountries(): ExploreCountry[] {
  return countryList.map((country) => ({
    code: country.code,
    name: country.name,
    region: country.region,
    subregion: country.subregion,
    capital: country.capital,
    flag: country.flag,
    currency: country.currency,
    languages: country.languages,
    center: country.center,
    independent: country.independent,
  }));
}

const MANUAL_ALIASES: Record<string, string> = {
  // Common country names and abbreviations
  "united states": "US",
  "united states of america": "US",
  usa: "US",
  us: "US",
  "united kingdom": "GB",
  uk: "GB",
  britain: "GB",
  "great britain": "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  "northern ireland": "GB",
  uae: "AE",
  "united arab emirates": "AE",
  "south korea": "KR",
  korea: "KR",
  "republic of korea": "KR",
  "north korea": "KP",
  "russia": "RU",
  "russian federation": "RU",
  "czech republic": "CZ",
  czechia: "CZ",
  turkey: "TR",
  türkiye: "TR",
  "viet nam": "VN",
  vietnam: "VN",
  burma: "MM",
  myanmar: "MM",
  lao: "LA",
  laos: "LA",
  syria: "SY",
  "syrian arab republic": "SY",
  iran: "IR",
  "islamic republic of iran": "IR",
  tanzania: "TZ",
  "united republic of tanzania": "TZ",
  bolivia: "BO",
  "plurinational state of bolivia": "BO",
  venezuela: "VE",
  "bolivarian republic of venezuela": "VE",
  moldova: "MD",
  "republic of moldova": "MD",
  "dr congo": "CD",
  "drc": "CD",
  "democratic republic of the congo": "CD",
  "congo brazzaville": "CG",
  "republic of the congo": "CG",
  "ivory coast": "CI",
  "cote d ivoire": "CI",
  "cote divoire": "CI",
  "cape verde": "CV",
  "cabo verde": "CV",
  "east timor": "TL",
  "timor leste": "TL",
  swaziland: "SZ",
  eswatini: "SZ",
  macedonia: "MK",
  "north macedonia": "MK",
  holland: "NL",
  netherlands: "NL",
  deutschland: "DE",
  germany: "DE",
  espana: "ES",
  spain: "ES",
  italia: "IT",
  italy: "IT",
  france: "FR",
  portugal: "PT",
  greece: "GR",
  hellas: "GR",
  switzerland: "CH",
  schweiz: "CH",
  suisse: "CH",
  austria: "AT",
  belgium: "BE",
  denmark: "DK",
  sweden: "SE",
  norway: "NO",
  finland: "FI",
  iceland: "IS",
  ireland: "IE",
  poland: "PL",
  hungary: "HU",
  romania: "RO",
  bulgaria: "BG",
  serbia: "RS",
  albania: "AL",
  montenegro: "ME",
  "bosnia and herzegovina": "BA",
  malta: "MT",
  cyprus: "CY",
  estonia: "EE",
  latvia: "LV",
  lithuania: "LT",
  ukraine: "UA",
  georgia: "GE",
  armenia: "AM",
  azerbaijan: "AZ",
  kazakhstan: "KZ",
  uzbekistan: "UZ",
  kyrgyzstan: "KG",
  tajikistan: "TJ",
  turkmenistan: "TM",
  mongolia: "MN",
  china: "CN",
  japan: "JP",
  thailand: "TH",
  malaysia: "MY",
  singapore: "SG",
  indonesia: "ID",
  philippines: "PH",
  india: "IN",
  nepal: "NP",
  "sri lanka": "LK",
  maldives: "MV",
  bhutan: "BT",
  bangladesh: "BD",
  pakistan: "PK",
  afghanistan: "AF",
  australia: "AU",
  "new zealand": "NZ",
  fiji: "FJ",
  egypt: "EG",
  morocco: "MA",
  tunisia: "TN",
  algeria: "DZ",
  "south africa": "ZA",
  kenya: "KE",
  ethiopia: "ET",
  ghana: "GH",
  senegal: "SN",
  nigeria: "NG",
  brazil: "BR",
  argentina: "AR",
  chile: "CL",
  peru: "PE",
  colombia: "CO",
  ecuador: "EC",
  uruguay: "UY",
  paraguay: "PY",
  mexico: "MX",
  cuba: "CU",
  "costa rica": "CR",
  panama: "PA",
  guatemala: "GT",
  canada: "CA",

  // Popular cities and regions that make free-text destinations easier to map
  tokyo: "JP",
  kyoto: "JP",
  osaka: "JP",
  sapporo: "JP",
  okinawa: "JP",
  paris: "FR",
  nice: "FR",
  lyon: "FR",
  marseille: "FR",
  rome: "IT",
  venice: "IT",
  florence: "IT",
  milan: "IT",
  naples: "IT",
  sicily: "IT",
  amalfi: "IT",
  barcelona: "ES",
  madrid: "ES",
  valencia: "ES",
  seville: "ES",
  ibiza: "ES",
  mallorca: "ES",
  london: "GB",
  edinburgh: "GB",
  manchester: "GB",
  liverpool: "GB",
  oxford: "GB",
  "new york": "US",
  nyc: "US",
  "los angeles": "US",
  "san francisco": "US",
  miami: "US",
  chicago: "US",
  "las vegas": "US",
  hawaii: "US",
  boston: "US",
  seattle: "US",
  washington: "US",
  atlanta: "US",
  "georgia usa": "US",
  "georgia us": "US",
  "us virgin islands": "VI",
  "british virgin islands": "VG",
  dubai: "AE",
  "abu dhabi": "AE",
  bangkok: "TH",
  phuket: "TH",
  "chiang mai": "TH",
  "koh samui": "TH",
  bali: "ID",
  jakarta: "ID",
  ubud: "ID",
  sydney: "AU",
  melbourne: "AU",
  brisbane: "AU",
  perth: "AU",
  cairns: "AU",
  auckland: "NZ",
  queenstown: "NZ",
  wellington: "NZ",
  istanbul: "TR",
  cappadocia: "TR",
  antalya: "TR",
  bodrum: "TR",
  cairo: "EG",
  giza: "EG",
  luxor: "EG",
  aswan: "EG",
  delhi: "IN",
  mumbai: "IN",
  goa: "IN",
  jaipur: "IN",
  kerala: "IN",
  kolkata: "IN",
  bangalore: "IN",
  bengaluru: "IN",
  agra: "IN",
  kathmandu: "NP",
  pokhara: "NP",
  colombo: "LK",
  kandy: "LK",
  "kuala lumpur": "MY",
  langkawi: "MY",
  penang: "MY",
  seoul: "KR",
  busan: "KR",
  jeju: "KR",
  beijing: "CN",
  shanghai: "CN",
  guangzhou: "CN",
  shenzhen: "CN",
  chengdu: "CN",
  xian: "CN",
  "hong kong": "CN",
  macau: "CN",
  rio: "BR",
  "rio de janeiro": "BR",
  "sao paulo": "BR",
  cancun: "MX",
  "mexico city": "MX",
  tulum: "MX",
  toronto: "CA",
  vancouver: "CA",
  montreal: "CA",
  banff: "CA",
  zurich: "CH",
  geneva: "CH",
  lucerne: "CH",
  interlaken: "CH",
  amsterdam: "NL",
  rotterdam: "NL",
  berlin: "DE",
  munich: "DE",
  frankfurt: "DE",
  hamburg: "DE",
  athens: "GR",
  santorini: "GR",
  mykonos: "GR",
  crete: "GR",
  lisbon: "PT",
  porto: "PT",
  madeira: "PT",
  reykjavik: "IS",
  dublin: "IE",
  prague: "CZ",
  vienna: "AT",
  budapest: "HU",
  warsaw: "PL",
  krakow: "PL",
  copenhagen: "DK",
  stockholm: "SE",
  oslo: "NO",
  helsinki: "FI",
  brussels: "BE",
  marrakech: "MA",
  marrakesh: "MA",
  casablanca: "MA",
  fes: "MA",
  "cape town": "ZA",
  johannesburg: "ZA",
  nairobi: "KE",
  zanzibar: "TZ",
  serengeti: "TZ",
  "buenos aires": "AR",
  lima: "PE",
  cusco: "PE",
  "machu picchu": "PE",
  santiago: "CL",
  bogota: "CO",
  medellin: "CO",
  cartagena: "CO",
  havana: "CU",
  "panama city": "PA",
  "phnom penh": "KH",
  "siem reap": "KH",
  hanoi: "VN",
  "ho chi minh": "VN",
  "da nang": "VN",
  halong: "VN",
  yangon: "MM",
  bagan: "MM",
  manila: "PH",
  cebu: "PH",
  palawan: "PH",
  taipei: "TW",
  male: "MV",
  thimphu: "BT",
  dhaka: "BD",
  karachi: "PK",
  lahore: "PK",
  islamabad: "PK",
  tashkent: "UZ",
  samarkand: "UZ",
  almaty: "KZ",
  astana: "KZ",
  baku: "AZ",
  tbilisi: "GE",
  yerevan: "AM",
  ulaanbaatar: "MN",
  amman: "JO",
  petra: "JO",
  beirut: "LB",
  doha: "QA",
  muscat: "OM",
  riyadh: "SA",
  jeddah: "SA",
  "tel aviv": "IL",
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.'’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const termToCode = new Map<string, string>();

for (const country of worldCountries) {
  if (!country.cca2 || country.cca2 === "-99") continue;

  for (const term of [
    country.name.common,
    country.name.official,
    ...country.altSpellings,
  ]) {
    const normalized = normalize(term);
    if (normalized.length >= 2 && !termToCode.has(normalized)) {
      termToCode.set(normalized, country.cca2);
    }
  }
}

for (const [term, code] of Object.entries(MANUAL_ALIASES)) {
  const normalized = normalize(term);
  if (normalized) termToCode.set(normalized, code);
}

const countryMatchers = [...termToCode.entries()]
  .sort(([a], [b]) => b.length - a.length)
  .map(([term, code]) => ({
    code,
    length: term.length,
    regex: new RegExp(`(?:^| )${escapeRegExp(term)}(?=$| )`, "g"),
  }));

export function resolveCountryFromText(text: string): Country | null {
  const normalized = normalize(text);
  if (!normalized) return null;

  let best: { start: number; length: number; code: string } | null = null;

  for (const matcher of countryMatchers) {
    matcher.regex.lastIndex = 0;
    const match = matcher.regex.exec(normalized);
    if (!match) continue;

    const start = match.index + (match[0].startsWith(" ") ? 1 : 0);
    if (
      !best ||
      start < best.start ||
      (start === best.start && matcher.length > best.length)
    ) {
      best = { start, length: matcher.length, code: matcher.code };
    }
  }

  return best ? countryByCode.get(best.code) ?? null : null;
}

export function getTripCountry(trip: {
  destination: string;
  countryCode?: string | null;
}): Country | null {
  if (trip.countryCode) {
    const country = countryByCode.get(trip.countryCode);
    if (country) return country;
  }

  return resolveCountryFromText(trip.destination);
}

export function toExploreTrip(trip: {
  id: string;
  title: string;
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  completedAt: Date | null;
}): ExploreTrip {
  const country = getTripCountry(trip);

  return {
    id: trip.id,
    title: trip.title,
    destination: trip.destination,
    startDate: trip.startDate?.toISOString() ?? null,
    endDate: trip.endDate?.toISOString() ?? null,
    status: getTripStatus(trip.startDate, trip.endDate, trip.completedAt),
    countryCode: country?.code ?? null,
    countryName: country?.name ?? null,
  };
}

export function getExploreFocus(trips: ExploreTrip[]): [number, number] | null {
  const codes = new Set(
    trips
      .map((trip) => trip.countryCode)
      .filter((code): code is string => Boolean(code))
  );

  if (codes.size === 0) return null;

  let longitude = 0;
  let latitude = 0;
  let count = 0;

  for (const code of codes) {
    const country = countryByCode.get(code);
    if (!country) continue;
    longitude += country.center[0];
    latitude += country.center[1];
    count += 1;
  }

  if (count === 0) return null;

  return [longitude / count, latitude / count];
}
