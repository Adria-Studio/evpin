"use client";

import { motion } from "motion/react";
import { CountUp } from "./count-up";

type Metric = {
  label: string;
  level: "LOW" | "MED" | "HIGH";
  filled: number;
  /** detail line shown below */
  detailPrefix?: string;
  detailSuffix?: string;
  /** number to count up; if omitted shows static detail */
  number?: number;
  /** formatter, e.g. 22% or 58,353 */
  format?: (n: number) => string;
};

export type Placement = "top" | "bottom" | "left" | "right";

type Props = {
  rating: string;
  address: string;
  city: string;
  metrics: Metric[];
  onClose: () => void;
  className?: string;
  placement?: Placement;
  /**
   * Accent scheme for the rating pill + metric bars.
   * - "default": white pill, white bars (charging station, good rating)
   * - "low": yellow pill + yellow bars (charging station, < 3/5)
   * - "ocean": blue pill + blue bars (ocean-click popup, 0/5)
   * Omit to auto-pick between "default" and "low" based on the rating
   * numerical value.
   */
  variant?: "default" | "low" | "ocean";
  /** Hide the CTA button. Used for ocean popups. */
  hideCta?: boolean;
};

const placementTransforms: Record<Placement, { initialX: number; initialY: number; exitX: number; exitY: number }> = {
  top: { initialX: 0, initialY: 8, exitX: 0, exitY: 4 },
  bottom: { initialX: 0, initialY: -8, exitX: 0, exitY: -4 },
  left: { initialX: 8, initialY: 0, exitX: 4, exitY: 0 },
  right: { initialX: -8, initialY: 0, exitX: -4, exitY: 0 },
};

export function StationPopup({
  rating,
  address,
  city,
  metrics,
  onClose,
  className = "",
  placement = "top",
  variant,
  hideCta,
}: Props) {
  const t = placementTransforms[placement];

  // Pick the accent scheme. Explicit `variant` wins; otherwise fall back to
  // "low" for sub-3 ratings, "default" otherwise.
  const ratingNum = parseFloat(rating);
  const resolvedVariant: "default" | "low" | "ocean" =
    variant ??
    (Number.isFinite(ratingNum) && ratingNum < 3 ? "low" : "default");

  const theme =
    resolvedVariant === "ocean"
      ? {
          pillBg: "rgba(96, 165, 250, 0.22)",
          pillText: "#60a5fa",
          barFilled: "#60a5fa",
          barEmpty: "rgba(96, 165, 250, 0.22)",
          levelColor: "#60a5fa",
        }
      : resolvedVariant === "low"
        ? {
            pillBg: "rgba(255, 221, 87, 0.22)",
            pillText: "#ffd648",
            barFilled: "#ffd648",
            barEmpty: "rgba(255,221,87,0.22)",
            levelColor: "#ffd648",
          }
        : {
            pillBg: "white",
            pillText: "#0c0c09",
            barFilled: "rgba(255,255,255,1)",
            barEmpty: "rgba(255,255,255,0.24)",
            levelColor: "#ffffff",
          };

  const BAR_FILLED = theme.barFilled;
  const BAR_EMPTY = theme.barEmpty;
  const LEVEL_COLOR = theme.levelColor;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, x: t.initialX, y: t.initialY, filter: "blur(12px)" }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.94, x: t.exitX, y: t.exitY, filter: "blur(14px)" }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      onClick={(e) => e.stopPropagation()}
      className={`w-[326px] rounded-[20px] p-4 flex flex-col gap-4 text-white ${className}`}
      style={{
        backgroundColor: "rgba(43, 43, 34, 0.68)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        boxShadow:
          "0 2px 6px 0 rgba(0,0,0,0.16), 0 14px 28px 0 rgba(0,0,0,0.22), 0 42px 56px 0 rgba(0,0,0,0.20), 0 90px 80px 0 rgba(0,0,0,0.10)",
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="rounded-full px-2 py-[2px]"
          style={{ backgroundColor: theme.pillBg }}
        >
          <p
            className="text-[14px] font-medium leading-5"
            style={{ color: theme.pillText }}
          >
            {rating}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid size-6 cursor-pointer place-items-center rounded-full bg-white/30 outline-none transition-colors duration-150 focus:outline-none hover:bg-white/45 active:bg-white/55"
          style={{
            // Dropped backdrop-filter here — the popup container already
            // paints a blur underneath, and backdrop-filter on a rounded
            // child occasionally produces a 1px outline artifact in Chrome.
            isolation: "isolate",
          }}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            aria-hidden
            className="pointer-events-none"
          >
            <path
              d="M1.5 1.5l7 7M8.5 1.5l-7 7"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col text-[14px] leading-5">
        <p className="text-white">{address}</p>
        <p className="text-white/50">{city}</p>
      </div>

      {metrics.map((m, mi) => {
        const baseDelay = 120 + mi * 180;
        return (
          <div key={m.label} className="flex flex-col">
            <div className="flex items-center justify-between">
              <p className="text-[14px] leading-5 text-white">{m.label}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-[2px]">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scaleX: 0.2, backgroundColor: BAR_EMPTY }}
                      animate={{
                        opacity: 1,
                        scaleX: 1,
                        backgroundColor: i < m.filled ? BAR_FILLED : BAR_EMPTY,
                      }}
                      transition={{
                        duration: 0.32,
                        delay: (baseDelay + i * 90) / 1000,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="h-2 w-[11px] origin-left rounded-[2px]"
                    />
                  ))}
                </div>
                <p
                  className="text-[12px] leading-4 font-bold tracking-wide"
                  style={{ color: LEVEL_COLOR }}
                >
                  {m.level}
                </p>
              </div>
            </div>
            <p className="text-[14px] leading-5 text-white/50">
              {m.detailPrefix}
              {m.number !== undefined ? (
                <CountUp
                  to={m.number}
                  delay={baseDelay + 320}
                  duration={900}
                  format={m.format}
                />
              ) : null}
              {m.detailSuffix}
            </p>
          </div>
        );
      })}

      {!hideCta && (
        <button
          type="button"
          className="h-8 w-full cursor-pointer rounded-full bg-white text-neutral-950 text-[14px] font-bold leading-5 border border-black/10 shadow-[0_2px_2px_rgba(19,19,19,0.04)] transition-colors duration-150 hover:bg-neutral-200 active:bg-neutral-300"
        >
          Design your station
        </button>
      )}
    </motion.div>
  );
}
