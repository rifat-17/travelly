"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteTrip } from "@/app/trips/actions";
import { Button } from "@/components/ui/button";

export function DeleteTripButton({
  tripId,
  title,
  className,
}: {
  tripId: string;
  title: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon-sm"
      className={className}
      aria-label={`Delete ${title}`}
      title="Delete trip"
      disabled={pending}
      onClick={() => {
        const confirmed = window.confirm(
          `Delete “${title}”? This cannot be undone.`
        );

        if (!confirmed) return;

        startTransition(async () => {
          await deleteTrip(tripId);
        });
      }}
    >
      {pending ? <Loader2 className="animate-spin" /> : <Trash2 />}
    </Button>
  );
}
