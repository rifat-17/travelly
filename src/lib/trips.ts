export type TripStatus =
  | "upcoming"
  | "ongoing"
  | "past"
  | "unscheduled"
  | "completed";

const DATE_ONLY_LENGTH = 10;

function toDateKey(date: Date) {
  return date.toISOString().slice(0, DATE_ONLY_LENGTH);
}

const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(date: Date) {
  return fullDateFormatter.format(date);
}

export function formatDateTime(date: Date) {
  return dateTimeFormatter.format(date);
}

export function formatDateRange(
  startDate: Date | null,
  endDate: Date | null
) {
  if (startDate && endDate) {
    if (startDate.getUTCFullYear() === endDate.getUTCFullYear()) {
      return `${shortDateFormatter.format(startDate)} – ${shortDateFormatter.format(endDate)}, ${endDate.getUTCFullYear()}`;
    }
    return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  }

  if (startDate) return `From ${formatDate(startDate)}`;
  if (endDate) return `Until ${formatDate(endDate)}`;
  return "Dates not set";
}

export function getTripStatus(
  startDate: Date | null,
  endDate: Date | null,
  completedAt?: Date | null
): TripStatus {
  if (completedAt) return "completed";
  if (!startDate && !endDate) return "unscheduled";

  const today = toDateKey(new Date());
  const start = startDate ? toDateKey(startDate) : null;
  const end = endDate ? toDateKey(endDate) : null;

  if (start && today < start) return "upcoming";
  if (end && today > end) return "past";

  return "ongoing";
}

export function getTripDurationDays(
  startDate: Date | null,
  endDate: Date | null
) {
  if (!startDate || !endDate) return null;

  const days =
    Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) + 1;

  return days > 0 ? days : null;
}
