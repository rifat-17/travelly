"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import {
  parseTripFormData,
  readField,
  type TripFormState,
} from "@/lib/trip-form";

function revalidateTrip(id: string) {
  revalidatePath("/");
  revalidatePath("/trips");
  revalidatePath(`/trips/${id}`);
  revalidatePath("/explore");
}

export async function updateTrip(
  _prevState: TripFormState,
  formData: FormData
): Promise<TripFormState> {
  const user = await requireUser();
  const id = readField(formData, "id");

  if (!id) {
    return { message: "Trip not found." };
  }

  const { errors, data } = parseTripFormData(formData);

  if (!data) {
    return { errors };
  }

  try {
    const result = await prisma.trip.updateMany({
      where: { id, userId: user.id },
      data,
    });

    if (result.count === 0) {
      return { message: "Trip not found." };
    }
  } catch (error) {
    console.error("Failed to update trip:", error);
    return {
      message: "Something went wrong while saving your trip. Please try again.",
    };
  }

  revalidateTrip(id);
  redirect(`/trips/${id}`);
}

export async function toggleTripDone(formData: FormData) {
  const user = await requireUser();
  const id = readField(formData, "id");

  if (!id) return;

  const trip = await prisma.trip.findFirst({
    where: { id, userId: user.id },
    select: { completedAt: true },
  });

  if (!trip) return;

  await prisma.trip.update({
    where: { id },
    data: { completedAt: trip.completedAt ? null : new Date() },
  });

  revalidateTrip(id);
}

export async function deleteTrip(tripId: string) {
  const user = await requireUser();

  if (!tripId) return;

  const result = await prisma.trip.deleteMany({
    where: { id: tripId, userId: user.id },
  });

  if (result.count === 0) return;

  revalidateTrip(tripId);
  redirect("/trips");
}
