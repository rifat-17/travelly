"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TripFormState, TripFormValues } from "@/lib/trip-form";
import { createTrip } from "./actions";

const initialState: TripFormState = {};

type TripFormAction = (
  state: TripFormState,
  formData: FormData
) => Promise<TripFormState>;

type TripFormProps = {
  action?: TripFormAction;
  initialValues?: TripFormValues;
  tripId?: string;
  submitLabel?: string;
  pendingLabel?: string;
  cancelHref?: string;
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;

  return (
    <p role="alert" className="text-sm text-destructive">
      {messages[0]}
    </p>
  );
}

export function TripForm({
  action = createTrip,
  initialValues = {},
  tripId,
  submitLabel = "Create trip",
  pendingLabel = "Creating...",
  cancelHref = "/trips",
}: TripFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {tripId ? <input type="hidden" name="id" value={tripId} /> : null}

      <div className="space-y-2">
        <Label htmlFor="title">Trip title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Summer in Japan"
          defaultValue={initialValues.title ?? ""}
          maxLength={100}
          required
          aria-invalid={state.errors?.title ? true : undefined}
          aria-describedby={state.errors?.title ? "title-error" : undefined}
        />
        <div id="title-error">
          <FieldError messages={state.errors?.title} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>
        <Input
          id="destination"
          name="destination"
          placeholder="Tokyo, Japan"
          defaultValue={initialValues.destination ?? ""}
          maxLength={100}
          required
          aria-invalid={state.errors?.destination ? true : undefined}
          aria-describedby={
            state.errors?.destination ? "destination-error" : undefined
          }
        />
        <div id="destination-error">
          <FieldError messages={state.errors?.destination} />
        </div>
        <p className="text-muted-foreground text-xs">
          Include the country name so this trip appears on your world map.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={initialValues.startDate ?? ""}
            aria-invalid={state.errors?.startDate ? true : undefined}
            aria-describedby={
              state.errors?.startDate ? "start-date-error" : undefined
            }
          />
          <div id="start-date-error">
            <FieldError messages={state.errors?.startDate} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={initialValues.endDate ?? ""}
            aria-invalid={state.errors?.endDate ? true : undefined}
            aria-describedby={
              state.errors?.endDate ? "end-date-error" : undefined
            }
          />
          <div id="end-date-error">
            <FieldError messages={state.errors?.endDate} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Flights, places to visit, things to remember..."
          defaultValue={initialValues.notes ?? ""}
          rows={4}
          maxLength={2000}
          aria-invalid={state.errors?.notes ? true : undefined}
          aria-describedby={state.errors?.notes ? "notes-error" : undefined}
        />
        <div id="notes-error">
          <FieldError messages={state.errors?.notes} />
        </div>
      </div>

      {state.message ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? pendingLabel : submitLabel}
        </Button>
        <Link href={cancelHref} className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
