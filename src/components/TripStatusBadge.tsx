import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TripStatus } from "@/lib/trips";

const statusLabels: Record<TripStatus, string> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  past: "Past",
  unscheduled: "No dates",
  completed: "Completed",
};

const statusStyles: Record<TripStatus, string> = {
  upcoming: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  ongoing:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  past: "bg-muted text-muted-foreground",
  unscheduled: "bg-muted text-muted-foreground",
  completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export function TripStatusBadge({
  status,
  className,
}: {
  status: TripStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="secondary"
      className={cn("border-0", statusStyles[status], className)}
    >
      {statusLabels[status]}
    </Badge>
  );
}
