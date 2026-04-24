"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChargingPin } from "./charging-pin";
import { StationPopup, type Placement } from "./station-popup";
import { useMode } from "./mode-context";

type Station = {
  id: string;
  top: string;
  left: string;
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
};

const pct = (n: number) => `${n}%`;
const commas = (n: number) => n.toLocaleString();

// All pins sit on visible San Francisco streets/land at typical desktop
// widths, and none within 48px of the bottom of the 927px-tall map section
// (max top ≈ 92%).
const stations: Station[] = [
  {
    id: "sea-cliff",
    top: "34%",
    left: "65%",
    address: "Sea Cliff",
    city: "San Francisco, CA 94121",
    rating: "4.3/5",
    metrics: [
      { label: "EV adoption", level: "HIGH", filled: 3, number: 24, format: pct, detailSuffix: " penetration" },
      { label: "Nearby stations", level: "MED", filled: 2, number: 198, format: commas, detailSuffix: " DCFC ports within 5mi" },
      { label: "Avg. daily traffic", level: "MED", filled: 2, number: 36120, format: commas, detailSuffix: " vehicles" },
    ],
  },
  {
    id: "lincoln-park",
    top: "45%",
    left: "62%",
    address: "Lincoln Park",
    city: "San Francisco, CA 94121",
    rating: "4.1/5",
    metrics: [
      { label: "EV adoption", level: "MED", filled: 2, number: 17, format: pct, detailSuffix: " penetration" },
      { label: "Nearby stations", level: "MED", filled: 2, number: 172, format: commas, detailSuffix: " DCFC ports within 5mi" },
      { label: "Avg. daily traffic", level: "MED", filled: 2, number: 28910, format: commas, detailSuffix: " vehicles" },
    ],
  },
  {
    id: "outer-richmond",
    top: "53%",
    left: "69%",
    address: "Outer Richmond",
    city: "San Francisco, CA 94121",
    rating: "2.8/5",
    metrics: [
      { label: "EV adoption", level: "LOW", filled: 1, number: 9, format: pct, detailSuffix: " penetration" },
      { label: "Nearby stations", level: "LOW", filled: 1, number: 42, format: commas, detailSuffix: " DCFC ports within 5mi" },
      { label: "Avg. daily traffic", level: "LOW", filled: 1, number: 18210, format: commas, detailSuffix: " vehicles" },
    ],
  },
  {
    id: "inner-richmond",
    top: "50%",
    left: "82%",
    address: "Inner Richmond",
    city: "San Francisco, CA 94118",
    rating: "4.5/5",
    metrics: [
      { label: "EV adoption", level: "HIGH", filled: 3, number: 26, format: pct, detailSuffix: " penetration" },
      { label: "Nearby stations", level: "HIGH", filled: 3, number: 287, format: commas, detailSuffix: " DCFC ports within 5mi" },
      { label: "Avg. daily traffic", level: "HIGH", filled: 3, number: 58353, format: commas, detailSuffix: " vehicles" },
    ],
  },
  {
    id: "laurel-heights",
    top: "42%",
    left: "88%",
    address: "Laurel Heights",
    city: "San Francisco, CA 94118",
    rating: "2.5/5",
    metrics: [
      { label: "EV adoption", level: "LOW", filled: 1, number: 7, format: pct, detailSuffix: " penetration" },
      { label: "Nearby stations", level: "LOW", filled: 1, number: 29, format: commas, detailSuffix: " DCFC ports within 5mi" },
      { label: "Avg. daily traffic", level: "LOW", filled: 1, number: 12410, format: commas, detailSuffix: " vehicles" },
    ],
  },
  {
    id: "pacific-heights",
    top: "58%",
    left: "90%",
    address: "Pacific Heights",
    city: "San Francisco, CA 94115",
    rating: "4.6/5",
    metrics: [
      { label: "EV adoption", level: "HIGH", filled: 3, number: 28, format: pct, detailSuffix: " penetration" },
      { label: "Nearby stations", level: "MED", filled: 2, number: 221, format: commas, detailSuffix: " DCFC ports within 5mi" },
      { label: "Avg. daily traffic", level: "HIGH", filled: 3, number: 54700, format: commas, detailSuffix: " vehicles" },
    ],
  },
  {
    id: "golden-gate-park",
    top: "73%",
    left: "72%",
    address: "Golden Gate Park",
    city: "San Francisco, CA 94117",
    rating: "4.4/5",
    metrics: [
      { label: "EV adoption", level: "HIGH", filled: 3, number: 22, format: pct, detailSuffix: " penetration" },
      { label: "Nearby stations", level: "MED", filled: 2, number: 251, format: commas, detailSuffix: " DCFC ports within 5mi" },
      { label: "Avg. daily traffic", level: "HIGH", filled: 3, number: 48500, format: commas, detailSuffix: " vehicles" },
    ],
  },
  {
    id: "balboa",
    top: "76%",
    left: "86%",
    address: "Balboa Terrace",
    city: "San Francisco, CA 94132",
    rating: "2.5/5",
    metrics: [
      { label: "EV adoption", level: "LOW", filled: 1, number: 8, format: pct, detailSuffix: " penetration" },
      { label: "Nearby stations", level: "LOW", filled: 1, number: 37, format: commas, detailSuffix: " DCFC ports within 5mi" },
      { label: "Avg. daily traffic", level: "LOW", filled: 1, number: 14920, format: commas, detailSuffix: " vehicles" },
    ],
  },
  {
    id: "sunset",
    top: "82%",
    left: "80%",
    address: "Sunset Corridor",
    city: "San Francisco, CA 94122",
    rating: "2.6/5",
    // Ratings below 3/5 surface as LOW across the board — metrics mirror
    // the overall score so the popup reads coherently.
    metrics: [
      { label: "EV adoption", level: "LOW", filled: 1, number: 10, format: pct, detailSuffix: " penetration" },
      { label: "Nearby stations", level: "LOW", filled: 1, number: 48, format: commas, detailSuffix: " DCFC ports within 5mi" },
      { label: "Avg. daily traffic", level: "LOW", filled: 1, number: 16230, format: commas, detailSuffix: " vehicles" },
    ],
  },
];

// Popup approximate size, used for smart placement
const POPUP_W = 326;
const POPUP_H = 420;
const GAP = 15;

function choosePlacement(pinRect: DOMRect): Placement {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spaceTop = pinRect.top;
  const spaceBottom = vh - pinRect.bottom;
  const spaceLeft = pinRect.left;
  const spaceRight = vw - pinRect.right;

  // Prefer top (matches Figma), fall back based on space
  if (spaceTop >= POPUP_H + GAP) return "top";
  if (spaceBottom >= POPUP_H + GAP) return "bottom";
  if (spaceRight >= POPUP_W + GAP) return "right";
  if (spaceLeft >= POPUP_W + GAP) return "left";
  return spaceBottom > spaceTop ? "bottom" : "top";
}

const placementPositionClass: Record<Placement, string> = {
  top: "absolute bottom-[calc(100%+15px)] left-1/2 -translate-x-1/2",
  bottom: "absolute top-[calc(100%+15px)] left-1/2 -translate-x-1/2",
  left: "absolute right-[calc(100%+15px)] top-1/2 -translate-y-1/2",
  right: "absolute left-[calc(100%+15px)] top-1/2 -translate-y-1/2",
};

export function StationMap({
  onActiveChange,
}: {
  onActiveChange?: (open: boolean) => void;
} = {}) {
  const { mode } = useMode();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Placement>("top");
  const pinRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
      setPlacement(choosePlacement(pinEl.getBoundingClientRect()));
    }
    setActiveId(s.id);
  };

  const total = stations.length;

  return (
    <>
      {stations.map((s, i) => {
        const isActive = activeId === s.id;
        const hidden = mode === "create";
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
            style={{ top: s.top, left: s.left }}
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
                    placement={placement}
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
