export type TripFormState = {
  errors?: {
    title?: string[];
    destination?: string[];
    startDate?: string[];
    endDate?: string[];
    notes?: string[];
  };
  message?: string;
};

export type TripFormValues = {
  title?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
};

export type ParsedTripInput = {
  title: string;
  destination: string;
  startDate: Date | null;
  endDate: Date | null;
  notes: string | null;
};

export function readField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function parseDate(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parseTripFormData(formData: FormData): {
  errors: NonNullable<TripFormState["errors"]>;
  data?: ParsedTripInput;
} {
  const title = readField(formData, "title");
  const destination = readField(formData, "destination");
  const startDateValue = readField(formData, "startDate");
  const endDateValue = readField(formData, "endDate");
  const notes = readField(formData, "notes");

  const errors: NonNullable<TripFormState["errors"]> = {};

  if (!title) {
    errors.title = ["Title is required."];
  } else if (title.length > 100) {
    errors.title = ["Title must be 100 characters or fewer."];
  }

  if (!destination) {
    errors.destination = ["Destination is required."];
  } else if (destination.length > 100) {
    errors.destination = ["Destination must be 100 characters or fewer."];
  }

  const startDate = parseDate(startDateValue);
  const endDate = parseDate(endDateValue);

  if (startDateValue && !startDate) {
    errors.startDate = ["Enter a valid start date."];
  }

  if (endDateValue && !endDate) {
    errors.endDate = ["Enter a valid end date."];
  }

  if (startDate && endDate && endDate < startDate) {
    errors.endDate = ["End date must be on or after the start date."];
  }

  if (notes.length > 2000) {
    errors.notes = ["Notes must be 2000 characters or fewer."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors,
    data: {
      title,
      destination,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      notes: notes || null,
    },
  };
}

export function toDateInputValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 10) : "";
}
