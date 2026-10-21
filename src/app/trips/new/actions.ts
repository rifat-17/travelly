"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { parseTripFormData, type TripFormState } from "@/lib/trip-form";

export async function createTrip(
  _prevState: TripFormState,
  formData: FormData
): Promise<TripFormState> {
  const user = await requireUser();
  const { errors, data } = parseTripFormData(formData);

  if (!data) {
    return { errors };
  }

  try {
    await prisma.trip.create({
      data: {
        userId: user.id,
        ...data,
      },
    });
  } catch (error) {
    console.error("Failed to create trip:", error);
    return {
      message: "Something went wrong while saving your trip. Please try again.",
    };
  }

  revalidatePath("/");
  revalidatePath("/trips");
  revalidatePath("/explore");
  redirect("/trips");
}
