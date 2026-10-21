"use client";

import {
  geoCentroid,
  geoGraticule10,
  geoOrthographic,
  geoPath,
} from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { Pause, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { feature } from "topojson-client";
import topology from "world-atlas/countries-110m.json";
import { Button } from "@/components/ui/button";
import type { CountryTripStats, ExploreFilter } from "@/lib/explore";
import { cn } from "@/lib/utils";

const VIEWBOX = 600;
const CENTER = VIEWBOX / 2;
const RADIUS = 258;
const DEFAULT_FOCUS: [number, number] = [20, 10];

type GlobeFeature = {
  code: string;
  feature: Feature<Geometry, { name?: string }>;
};

const atlasObject = topology.objects.countries;
const ATLAS: FeatureCollection<Geometry, { name?: string }> =
  atlasObject.type === "GeometryCollection"
    ? (feature(topology, atlasObject) as FeatureCollection<
        Geometry,
        { name?: string }
      >)
    : { type: "FeatureCollection", features: [] };

const FILL = {
  none: "#1e293b",
  visited: "#0ea5e9",
  planned: "#6366f1",
  both: "#10b981",
} as const;

const HOVER_FILL = {
  none: "#334155",
  visited: "#38bdf8",
  planned: "#818cf8",
  both: "#34d399",
} as const;

function buildCountries(numericToCode: Record<string, string>): GlobeFeature[] {
  return ATLAS.features.flatMap((countryFeature) => {
    const name = countryFeature.properties?.name ?? "Unknown";
    const code =
      numericToCode[String(countryFeature.id)] ??
      (name === "Kosovo" ? "XK" : null);

    return code ? [{ code, feature: countryFeature }] : [];
  });
}

function getCountryState(stats: CountryTripStats | undefined) {
  if (!stats || stats.total === 0) return "none" as const;
  if (stats.past > 0 && stats.planned > 0) return "both" as const;
  if (stats.planned > 0) return "planned" as const;
  return "visited" as const;
}

function matchesFilter(
  stats: CountryTripStats | undefined,
  filter: ExploreFilter
) {
  if (filter === "all") return true;
  if (!stats) return false;
  return filter === "visited" ? stats.past > 0 : stats.planned > 0;
}

function summarizeStats(stats: CountryTripStats | undefined) {
  if (!stats || stats.total === 0) return "No trips yet";

  const parts: string[] = [];
  if (stats.ongoing) parts.push("ongoing");
  if (stats.upcoming) parts.push(`${stats.upcoming} upcoming`);
  if (stats.past) parts.push(`${stats.past} past`);
  if (stats.unscheduled) parts.push(`${stats.unscheduled} saved`);

  return `${stats.total} ${stats.total === 1 ? "trip" : "trips"}${
    parts.length ? ` · ${parts.join(" · ")}` : ""
  }`;
}

type HoverState = {
  code: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type WorldGlobeProps = {
  numericToCode: Record<string, string>;
  names: Record<string, string>;
  stats: Record<string, CountryTripStats>;
  selectedCode: string | null;
  filter: ExploreFilter;
  focus: [number, number] | null;
  onSelect: (code: string) => void;
  className?: string;
};

export function WorldGlobe({
  numericToCode,
  names,
  stats,
  selectedCode,
  filter,
  focus,
  onSelect,
  className,
}: WorldGlobeProps) {
  const countries = useMemo(
    () => buildCountries(numericToCode),
    [numericToCode]
  );

  const initialFocus = focus ?? DEFAULT_FOCUS;
  const [rotation, setRotation] = useState<[number, number]>(() => [
    -initialFocus[0],
    -initialFocus[1],
  ]);
  const [hovered, setHovered] = useState<HoverState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    rotation: [number, number];
  } | null>(null);
  const movedRef = useRef(false);
  const rotationRef = useRef(rotation);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const animateTo = useCallback((target: [number, number]) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const start = rotationRef.current;
    let delta = target[0] - start[0];
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;

    const end: [number, number] = [start[0] + delta, target[1]];
    const startTime = performance.now();
    const duration = 500;

    setIsAnimating(true);

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);

      setRotation([
        start[0] + (end[0] - start[0]) * eased,
        start[1] + (end[1] - start[1]) * eased,
      ]);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else {
        animationRef.current = null;
        setIsAnimating(false);
      }
    };

    animationRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (!selectedCode) return;

    const country = countries.find((item) => item.code === selectedCode);
    if (!country) return;

    const frame = requestAnimationFrame(() => {
      const [longitude, latitude] = geoCentroid(country.feature);
      animateTo([-longitude, -latitude]);
    });

    return () => cancelAnimationFrame(frame);
  }, [selectedCode, countries, animateTo]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;

      if (Math.abs(dx) + Math.abs(dy) > 4) {
        movedRef.current = true;
      }

      setRotation([
        drag.rotation[0] + dx * 0.35,
        Math.max(-75, Math.min(75, drag.rotation[1] - dy * 0.35)),
      ]);
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [isDragging]);

  const isHovering = Boolean(hovered);

  useEffect(() => {
    if (!autoRotate || isDragging || isAnimating || isHovering || reduceMotion) {
      return;
    }

    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      if (now - last >= 50) {
        setRotation(([longitude, latitude]) => [
          longitude + 0.15,
          latitude,
        ]);
        last = now;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [autoRotate, isDragging, isAnimating, isHovering, reduceMotion]);

  const projection = useMemo(
    () =>
      geoOrthographic()
        .translate([CENTER, CENTER])
        .scale(RADIUS)
        .rotate([rotation[0], rotation[1], 0])
        .clipAngle(90),
    [rotation]
  );

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);
  const spherePath = pathGenerator({ type: "Sphere" });
  const graticulePath = pathGenerator(geoGraticule10());

  function getLocalPoint(event: { clientX: number; clientY: number }) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0, width: 0, height: 0 };
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  function handlePointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      setIsAnimating(false);
    }

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      rotation,
    };
    movedRef.current = false;
    setHovered(null);
    setIsDragging(true);
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!hovered || isDragging) return;
    const point = getLocalPoint(event);
    setHovered((current) => (current ? { ...current, ...point } : current));
  }

  function handleCountryEnter(
    event: React.PointerEvent<SVGPathElement>,
    code: string
  ) {
    if (isDragging) return;
    const point = getLocalPoint(event);
    setHovered({ code, ...point });
  }

  function handleCountryClick(code: string) {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }

    onSelect(code);
  }

  function handleReset() {
    animateTo(
      focus
        ? [-focus[0], -focus[1]]
        : [-DEFAULT_FOCUS[0], -DEFAULT_FOCUS[1]]
    );
  }

  const hoveredName = hovered
    ? names[hovered.code] ?? hovered.code
    : null;
  const tooltipLeft = hovered
    ? hovered.x > hovered.width - 190
      ? hovered.x - 182
      : hovered.x + 14
    : 0;
  const tooltipTop = hovered
    ? Math.min(hovered.y + 14, Math.max(8, hovered.height - 68))
    : 0;

  return (
    <div
      ref={containerRef}
      className={cn("relative aspect-square w-full select-none", className)}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        role="img"
        aria-label="Interactive globe showing the countries in your trips. Drag to rotate, and click a country to see details."
        className="h-full w-full touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          if (!isDragging) setHovered(null);
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        <defs>
          <radialGradient id="globe-atmosphere" cx="50%" cy="50%" r="50%">
            <stop offset="72%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="88%" stopColor="#38bdf8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="globe-ocean" cx="34%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#0c4a6e" />
            <stop offset="42%" stopColor="#082f49" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <radialGradient id="globe-shade" cx="34%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#020617" stopOpacity="0" />
            <stop offset="62%" stopColor="#020617" stopOpacity="0" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS + 26}
          fill="url(#globe-atmosphere)"
          aria-hidden="true"
        />

        {spherePath ? (
          <path d={spherePath} fill="url(#globe-ocean)" aria-hidden="true" />
        ) : null}

        {graticulePath ? (
          <path
            d={graticulePath}
            fill="none"
            stroke="#38bdf8"
            strokeOpacity={0.1}
            strokeWidth={0.6}
            vectorEffect="non-scaling-stroke"
            aria-hidden="true"
          />
        ) : null}

        {countries.map(({ code, feature: countryFeature }) => {
          const d = pathGenerator(countryFeature);
          if (!d) return null;

          const countryStats = stats[code];
          const state = getCountryState(countryStats);
          const isHovered = hovered?.code === code;
          const isSelected = selectedCode === code;
          const isVisible =
            matchesFilter(countryStats, filter) || isSelected;

          return (
            <path
              key={code}
              data-country={code}
              d={d}
              fill={isHovered ? HOVER_FILL[state] : FILL[state]}
              stroke={isSelected ? "#f8fafc" : "#0f172a"}
              strokeWidth={isSelected ? 1.5 : 0.45}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className={cn(
                "cursor-pointer transition-[fill,opacity] duration-150",
                !isVisible && "opacity-20"
              )}
              onPointerEnter={(event) =>
                handleCountryEnter(event, code)
              }
              onPointerLeave={() =>
                setHovered((current) =>
                  current?.code === code ? null : current
                )
              }
              onPointerUp={() => handleCountryClick(code)}
            />
          );
        })}

        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="url(#globe-shade)"
          pointerEvents="none"
          aria-hidden="true"
        />
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="#38bdf8"
          strokeOpacity={0.35}
          strokeWidth={1}
          pointerEvents="none"
          aria-hidden="true"
        />
      </svg>

      {hovered && !isDragging ? (
        <div
          className="bg-popover/95 border-border/70 pointer-events-none absolute z-20 w-max max-w-52 rounded-lg border px-3 py-2 text-xs shadow-xl backdrop-blur"
          style={{ left: tooltipLeft, top: tooltipTop }}
        >
          <p className="text-popover-foreground font-medium">{hoveredName}</p>
          <p className="text-muted-foreground mt-0.5">
            {summarizeStats(stats[hovered.code])}
          </p>
        </div>
      ) : null}

      <div className="absolute right-3 bottom-3 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={autoRotate ? "Pause globe rotation" : "Start globe rotation"}
          className="bg-background/70 backdrop-blur"
          onClick={() => setAutoRotate((value) => !value)}
        >
          {autoRotate ? <Pause /> : <Play />}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Reset globe view"
          className="bg-background/70 backdrop-blur"
          onClick={handleReset}
        >
          <RotateCcw />
        </Button>
      </div>
    </div>
  );
}
