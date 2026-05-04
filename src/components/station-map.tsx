"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChargingPin } from "./charging-pin";
import { StationPopup, type Placement } from "./station-popup";
import { useMode } from "./mode-context";
import { useHeroMap } from "./hero-map-provider";
import { useMapReproject } from "@/lib/use-map-reproject";

type Station = {
  id: string;
  lng: number;
  lat: number;
  address: string;
  city: string;
  rating: string;
  metrics: {
    label: string;
    level: "LOW" | "MED" | "HIGH";
    filled: number;
    detailPrefix?: string;
    detailSuffix?: string;
    number?: number;
    format?: (n: number) => string;
  }[];
  utilization: { label: string; pct: number; cars: number }[];
  regional: { level: "LOW" | "MED" | "HIGH"; filled: number; percent: number };
};

const pct = (n: number) => `${n}%`;
const commas = (n: number) => n.toLocaleString();
const levelOf = (filled: number) =>
  (filled === 3 ? "HIGH" : filled === 2 ? "MED" : "LOW") as "LOW" | "MED" | "HIGH";

/**
 * Curated pool of real SF neighborhood coordinates. Each entry is placed
 * on an actual street intersection so the pin lands on asphalt regardless
 * of current zoom/pan. On mount we pick 9 of these at random, so every
 * refresh shows the same count of pins placed differently.
 */
type PoolEntry = {
  id: string;
  lng: number;
  lat: number;
  name: string; // short name — "Charging Station" is appended on render
  zip: string;
};

const POOL: PoolEntry[] = [
  { id: "sea-cliff",        lng: -122.4935, lat: 37.7855, name: "Sea Cliff",        zip: "94121" },
  { id: "lincoln-park",     lng: -122.4979, lat: 37.7834, name: "Lincoln Park",     zip: "94121" },
  { id: "outer-richmond-a", lng: -122.4910, lat: 37.7805, name: "Outer Richmond",   zip: "94121" },
  { id: "outer-richmond-b", lng: -122.4831, lat: 37.7762, name: "Balboa St & 25th", zip: "94121" },
  { id: "inner-richmond",   lng: -122.4640, lat: 37.7828, name: "Inner Richmond",   zip: "94118" },
  { id: "laurel-heights",   lng: -122.4486, lat: 37.7857, name: "Laurel Heights",   zip: "94118" },
  { id: "pacific-heights",  lng: -122.4392, lat: 37.7914, name: "Pacific Heights",  zip: "94115" },
  { id: "presidio-gate",    lng: -122.4618, lat: 37.7879, name: "Presidio Gate",    zip: "94118" },
  { id: "anza-vista",       lng: -122.4486, lat: 37.7804, name: "Anza Vista",       zip: "94115" },
  { id: "gg-park-east",     lng: -122.4546, lat: 37.7712, name: "Golden Gate Park", zip: "94117" },
  { id: "gg-park-center",   lng: -122.4658, lat: 37.7719, name: "GGP Conservatory", zip: "94117" },
  { id: "haight",           lng: -122.4459, lat: 37.7703, name: "Haight Ashbury",   zip: "94117" },
  { id: "inner-sunset",     lng: -122.4661, lat: 37.7635, name: "Inner Sunset",     zip: "94122" },
  { id: "outer-sunset",     lng: -122.4980, lat: 37.7604, name: "Outer Sunset",     zip: "94122" },
  { id: "sunset-corridor",  lng: -122.4873, lat: 37.7540, name: "Sunset Corridor",  zip: "94122" },
  { id: "balboa-terrace",   lng: -122.4634, lat: 37.7280, name: "Balboa Terrace",   zip: "94132" },
  { id: "forest-hill",      lng: -122.4661, lat: 37.7451, name: "Forest Hill",      zip: "94127" },
  { id: "golden-gate-hts",  lng: -122.4721, lat: 37.7589, name: "Golden Gate Hts",  zip: "94116" },
  { id: "parkside",         lng: -122.4930, lat: 37.7432, name: "Parkside",         zip: "94116" },
  { id: "richmond-park",    lng: -122.4779, lat: 37.7762, name: "Richmond / 19th",  zip: "94121" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Build 4 labels covering the last 4 weeks, each formatted
 * "`DD Mon — DD Mon`" with the range being 7 consecutive days ending at
 * the relevant boundary. Right-most entry is the week ending *today*.
 */
function lastFourWeekLabels(): string[] {
  const today = new Date();
  const out: string[] = [];
  for (let i = 3; i >= 0; i--) {
    const end = new Date(today);
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    const fmt = (d: Date) => `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
    // Label shows only the week's start date followed by a trailing
    // dash — e.g. "28 Mar -". The end-of-range reads implicitly from the
    // next bar's start date (and for the last bar, from "today").
    out.push(`${fmt(start)} -`);
  }
  return out;
}

function buildUtilization(isLow: boolean) {
  // Yellow (low) stations: their weekly averages sit under the 50-EV
  // threshold so the chart paints yellow.
  const hi = isLow ? 0.45 : 0.95;
  const lo = isLow ? 0.08 : 0.45;
  const maxCars = isLow ? 60 : 360;
  const minCars = isLow ? 10 : 120;
  return lastFourWeekLabels().map((label) => {
    const pct = lo + Math.random() * (hi - lo);
    const cars = Math.round(minCars + pct * (maxCars - minCars));
    return { label, pct, cars };
  });
}

function buildRegional(isLow: boolean) {
  // Low-rated stations also have sparser neighbourhoods around them.
  const percent = isLow ? randInt(8, 28) : randInt(40, 88);
  const filled = percent >= 65 ? 3 : percent >= 35 ? 2 : 1;
  const level = (filled === 3 ? "HIGH" : filled === 2 ? "MED" : "LOW") as
    | "LOW"
    | "MED"
    | "HIGH";
  return { level, filled, percent };
}

/**
 * Build a randomised station from a pool entry. Rating distribution is
 * bimodal: roughly a quarter of the stations end up in the "low" (<3/5)
 * band, which drives:
 *   • the pin rendering yellow
 *   • every metric capped at LOW
 *   • utilisation < 50 cars/day (yellow bars in the chart)
 */
function buildStation(entry: PoolEntry, forceLow = false): Station {
  const score = forceLow
    ? randInt(15, 28) / 10 // 1.5 – 2.8
    : randInt(35, 50) / 10; // 3.5 – 5.0 — clearly healthy
  const rating = `${score.toFixed(1)}/5`;
  const isLow = score < 3;

  const adoptionFilled = isLow ? 1 : score >= 4.3 ? 3 : 2;
  const stationsFilled = isLow ? 1 : score >= 4.5 ? 3 : 2;
  const trafficFilled = isLow ? 1 : score >= 4.1 ? 3 : 2;

  const adoptionPct = isLow ? randInt(4, 11) : randInt(15, 30);
  const nearbyPorts = isLow ? randInt(12, 45) : randInt(120, 320);
  const dailyTraffic = isLow
    ? randInt(6_000, 15_000)
    : randInt(28_000, 62_000);

  return {
    id: entry.id,
    lng: entry.lng,
    lat: entry.lat,
    address: `${entry.name} Charging Station`,
    city: `San Francisco, CA ${entry.zip}`,
    rating,
    metrics: [
      {
        label: "EV adoption",
        level: levelOf(adoptionFilled),
        filled: adoptionFilled,
        number: adoptionPct,
        format: pct,
        detailSuffix: " penetration",
      },
      {
        label: "Nearby stations",
        level: levelOf(stationsFilled),
        filled: stationsFilled,
        number: nearbyPorts,
        format: commas,
        detailSuffix: " DCFC ports within 5mi",
      },
      {
        label: "Avg. daily traffic",
        level: levelOf(trafficFilled),
        filled: trafficFilled,
        number: dailyTraffic,
        format: commas,
        detailSuffix: " vehicles",
      },
    ],
    utilization: buildUtilization(isLow),
    regional: buildRegional(isLow),
  };
}

const DESIRED_COUNT = 9;

// Popup approximate size, used for smart placement. Popup is now taller
// because of the utilisation chart + labels.
const POPUP_W = 326;
const POPUP_H = 540;
const GAP = 15;

/**
 * Pick the placement that keeps the popup fully in the viewport.
 * Each side needs the popup's long axis to fit AND enough cross-axis space
 * to keep the popup's midline near the pin (we allow ±½ of the minor axis
 * to slide off — the real constraint is that the pin rect + popup never
 * pushes past the viewport edge on the cross axis by more than ½ popup
 * minor axis).
 */
function choosePlacement(
  pinRect: DOMRect,
  heroRect: DOMRect | null,
): Placement {
  const top = Math.max(0, heroRect?.top ?? 0);
  const bottom = Math.min(window.innerHeight, heroRect?.bottom ?? window.innerHeight);
  const left = Math.max(0, heroRect?.left ?? 0);
  const right = Math.min(window.innerWidth, heroRect?.right ?? window.innerWidth);

  const spaceTop = pinRect.top - top;
  const spaceBottom = bottom - pinRect.bottom;
  const spaceLeft = pinRect.left - left;
  const spaceRight = right - pinRect.right;

  // Primary-axis threshold includes the 24 px edge guard so the clamp
  // never has to fight the layout — if we pick "top" we're guaranteed
  // the popup will land with ≥ 24 px above its top edge.
  const needPrimary = POPUP_H + GAP + EDGE_GUARD;
  const needSecondaryW = POPUP_W + GAP + EDGE_GUARD;

  if (spaceTop >= needPrimary) return "top";
  if (spaceBottom >= needPrimary) return "bottom";
  if (spaceRight >= needSecondaryW) return "right";
  if (spaceLeft >= needSecondaryW) return "left";

  // Degenerate case — pin is in a cramped corner. Pick whichever side
  // has the most raw space.
  const options: Array<[Placement, number]> = [
    ["top", spaceTop],
    ["bottom", spaceBottom],
    ["right", spaceRight],
    ["left", spaceLeft],
  ];
  options.sort((a, b) => b[1] - a[1]);
  return options[0][0];
}

const placementPositionClass: Record<Placement, string> = {
  top: "absolute bottom-[calc(100%+15px)] left-1/2 -translate-x-1/2",
  bottom: "absolute top-[calc(100%+15px)] left-1/2 -translate-x-1/2",
  left: "absolute right-[calc(100%+15px)] top-1/2 -translate-y-1/2",
  right: "absolute left-[calc(100%+15px)] top-1/2 -translate-y-1/2",
};

const EDGE_GUARD = 24;

/**
 * Clamp the popup's position so it's at least `EDGE_GUARD` px away from
 * BOTH the viewport edges AND the hero section edges. The hero has
 * `overflow: hidden`, so we never want the popup to extend past it even
 * when there's empty viewport space to spare outside it.
 */
function clampedOffset(
  pinRect: DOMRect,
  placement: Placement,
  heroRect: DOMRect | null,
) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pinCx = (pinRect.left + pinRect.right) / 2;
  const pinCy = (pinRect.top + pinRect.bottom) / 2;

  // Allowed ranges — intersection of viewport and hero rects.
  const minX = Math.max(EDGE_GUARD, (heroRect?.left ?? 0) + EDGE_GUARD);
  const maxX = Math.min(
    vw - POPUP_W - EDGE_GUARD,
    (heroRect?.right ?? vw) - POPUP_W - EDGE_GUARD,
  );
  const minY = Math.max(EDGE_GUARD, (heroRect?.top ?? 0) + EDGE_GUARD);
  const maxY = Math.min(
    vh - POPUP_H - EDGE_GUARD,
    (heroRect?.bottom ?? vh) - POPUP_H - EDGE_GUARD,
  );

  if (placement === "top" || placement === "bottom") {
    const desiredLeft = pinCx - POPUP_W / 2;
    const clampedX = Math.max(minX, Math.min(maxX, desiredLeft));
    // Primary-axis guard: in the degenerate corner case where the pin
    // is too close to an edge for either axis to fit cleanly, shift the
    // popup along the primary axis so its top/bottom edge lands at the
    // 24 px guardrail. For healthy pins this is a no-op (popup's natural
    // position is already well inside).
    const desiredTop =
      placement === "top"
        ? pinRect.top - GAP - POPUP_H
        : pinRect.bottom + GAP;
    const clampedY = Math.max(minY, Math.min(maxY, desiredTop));
    return {
      offsetX: clampedX - desiredLeft,
      offsetY: clampedY - desiredTop,
    };
  }
  const desiredTop = pinCy - POPUP_H / 2;
  const clampedY = Math.max(minY, Math.min(maxY, desiredTop));
  const desiredLeft =
    placement === "left"
      ? pinRect.left - GAP - POPUP_W
      : pinRect.right + GAP;
  const clampedX = Math.max(minX, Math.min(maxX, desiredLeft));
  return {
    offsetX: clampedX - desiredLeft,
    offsetY: clampedY - desiredTop,
  };
}

export function StationMap({
  onActiveChange,
}: {
  onActiveChange?: (open: boolean) => void;
} = {}) {
  const { mode } = useMode();
  const { map } = useHeroMap();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Placement>("top");
  const [offset, setOffset] = useState({ offsetX: 0, offsetY: 0 });
  const pinRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Re-render whenever the user drags / zooms the map so each pin's
  // projected pixel position updates. Pins stay anchored to their real
  // lng/lat regardless of viewport state. rAF-coalesced inside the hook.
  useMapReproject(map);

  // Pick a fresh random slice of the pool on every mount. Within the 9
  // chosen stations, 2–3 are forced to the "low" (yellow) bucket so the
  // map always shows a mix of healthy and poor-quality sites.
  //
  // Generated post-mount (not in a lazy initializer) because Math.random
  // would otherwise produce different values on server vs. client and
  // trigger a hydration mismatch. The pins fade in from opacity 0 anyway,
  // so the extra render tick is invisible.
  const [stations, setStations] = useState<Station[]>([]);
  useEffect(() => {
    const picks = shuffle(POOL).slice(0, DESIRED_COUNT);
    const lowCount = randInt(2, 3);
    setStations(picks.map((entry, i) => buildStation(entry, i < lowCount)));
  }, []);

  // Close any open popup the moment we leave explore mode.
  useEffect(() => {
    if (mode !== "explore") setActiveId(null);
  }, [mode]);

  useEffect(() => {
    onActiveChange?.(activeId !== null);
  }, [activeId, onActiveChange]);

  useEffect(() => {
    if (!activeId) return;
    const onDocClick = () => setActiveId(null);
    const id = setTimeout(() => {
      document.addEventListener("click", onDocClick);
    }, 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(id);
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [activeId]);

  const handlePinClick = (s: Station, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeId === s.id) {
      setActiveId(null);
      return;
    }
    const pinEl = pinRefs.current[s.id];
    if (pinEl) {
      const rect = pinEl.getBoundingClientRect();
      const heroEl = pinEl.closest("section");
      const heroRect = heroEl?.getBoundingClientRect() ?? null;
      const p = choosePlacement(rect, heroRect);
      setPlacement(p);
      setOffset(clampedOffset(rect, p, heroRect));
    }
    setActiveId(s.id);
  };

  const total = stations.length;

  return (
    <>
      {stations.map((s, i) => {
        const isActive = activeId === s.id;
        const hidden = mode === "create";
        // Project the station's lng/lat through the live map on every
        // render. If the map isn't ready yet, skip — pins reappear once
        // the basemap loads and forceReproject triggers a re-render.
        if (!map) return null;
        const point = map.project([s.lng, s.lat]);
        return (
          <motion.div
            key={s.id}
            ref={(el) => {
              pinRefs.current[s.id] = el;
            }}
            // Re-enable pointer events on just this pin's bounding box so
            // the button + popup receive clicks even though the parent
            // chain is pointer-events-none (to let the crosshair layer
            // receive hover events on the empty map).
            className={[
              "absolute -translate-x-1/2 -translate-y-1/2",
              hidden ? "pointer-events-none" : "pointer-events-auto",
              isActive ? "z-40" : "z-30",
            ].join(" ")}
            style={{ top: `${point.y}px`, left: `${point.x}px` }}
            // - Scale transforms interfere with backdrop-filter rendering
            //   so we only animate opacity + y.
            // - When `mode` flips to "create" the pins disappear one by
            //   one, right-to-left (reverse index), via a staggered delay.
            //   When flipping back to "explore" they cascade in left-to-right.
            initial={{ opacity: 0, y: -16 }}
            animate={{
              opacity: hidden ? 0 : 1,
              y: hidden ? -8 : 0,
            }}
            transition={{
              delay: hidden
                ? (total - 1 - i) * 0.07 // disappear right-to-left
                : 0.25 + i * 0.12, // original left-to-right cascade
              duration: hidden ? 0.35 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="relative">
              <AnimatePresence>
                {isActive && (
                  <StationPopup
                    key="popup"
                    rating={s.rating}
                    address={s.address}
                    city={s.city}
                    metrics={s.metrics}
                    utilization={s.utilization}
                    regional={s.regional}
                    placement={placement}
                    offsetX={offset.offsetX}
                    offsetY={offset.offsetY}
                    hideCta
                    onClose={() => setActiveId(null)}
                    className={placementPositionClass[placement] + " z-[5]"}
                  />
                )}
              </AnimatePresence>
              {/* z-10 keeps the pin above the popup's drop shadow so the
                  shadow never paints on top of the active pin. */}
              <div className="relative z-10">
                <ChargingPin
                  active={isActive}
                  warning={(() => {
                    const r = parseFloat(s.rating);
                    return Number.isFinite(r) && r < 3;
                  })()}
                  onClick={(e) => handlePinClick(s, e)}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
