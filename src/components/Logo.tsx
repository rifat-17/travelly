import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
};

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <span className={cn("group flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-500 shadow-lg shadow-sky-500/20 ring-1 ring-white/25 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 motion-reduce:transform-none"
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_55%)]" />
        <span className="absolute -top-2 -right-2 size-5 rounded-full bg-white/20 blur-[2px]" />
        <svg
          viewBox="0 0 24 24"
          className="relative size-5 text-white drop-shadow-sm"
          aria-hidden="true"
        >
          <path
            d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"
            fill="currentColor"
          />
          <path
            d="m21.854 2.147-10.94 10.939"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </svg>
      </span>

      {showWordmark ? (
        <span className="max-[359px]:hidden text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          Travel{" "}
          <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Planner
          </span>
        </span>
      ) : null}
    </span>
  );
}
