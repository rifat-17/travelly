import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function TripNotFound() {
  return (
    <div className="container mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Trip not found</h1>
      <p className="text-muted-foreground text-sm">
        This trip may have been deleted, or the link is incorrect.
      </p>
      <Link href="/trips" className={buttonVariants()}>
        Back to trips
      </Link>
    </div>
  );
}
