"use client";

import { motion } from "motion/react";
import { useMode, type Mode } from "./mode-context";

type ToggleButtonProps = {
  id: Mode;
  label: string;
  active: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
};

function ToggleButton({ id, label, active, onSelect, icon }: ToggleButtonProps) {
  // Inactive buttons: fully transparent at all times (no hover bg).
  // Only the text colour responds to hover — lifts from 80% → 100% white.
  const hoverClasses = active
    ? "text-white"
    : "text-white/80 hover:text-white";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      data-mode={id}
      className={[
        "relative flex h-8 cursor-pointer items-center gap-1 rounded-full",
        "pl-2 pr-[10px] py-px text-[14px] font-medium leading-5",
        "outline-none transition-colors duration-200",
        hoverClasses,
      ].join(" ")}
    >
      {/* Shared indicator element — motion will morph it from one button
          to the other when `active` flips, creating the slide-across
          effect instead of a fade. */}
      {active && (
        <motion.span
          layoutId="mode-toggle-indicator"
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            // Matches Figma: the active pill is another 24% black layered
            // on top of the outer pill (for a ≈42% combined feel).
            backgroundColor: "rgba(0,0,0,0.24)",
          }}
          // Blur + subtle scale dip as the indicator swaps buttons — gives
          // a "morphing goo" feel rather than a straight slide. The
          // keyframes run whenever a new active instance mounts.
          initial={{ filter: "blur(6px)", scaleY: 0.78, scaleX: 0.9 }}
          animate={{ filter: "blur(0px)", scaleY: 1, scaleX: 1 }}
          exit={{ filter: "blur(6px)", scaleY: 0.78, scaleX: 0.9 }}
          transition={{
            layout: {
              type: "spring",
              stiffness: 380,
              damping: 32,
              mass: 0.6,
            },
            filter: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
            scaleY: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
            scaleX: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
          }}
        />
      )}
      <span className="relative z-[1] flex items-center gap-1">
        <span className="grid size-5 place-items-center">{icon}</span>
        <span>{label}</span>
      </span>
    </button>
  );
}

function ExploreIcon() {
  // Charging-station glyph — exact port of the Figma source vectors
  // (node I113:3056). Each of the four source paths is wrapped in a `<g>`
  // with `transform="translate(...)"` matching the inset positions the
  // Figma file uses, so the glyph reads identically inside its 20×20 box.
  //
  // Stroke uses currentColor so it tracks the button's `text-*` utility.
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="block"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Vector 1 — station body (inset 16.67%/45.83%/16.67%/16.67%) */}
      <g transform="translate(2.5 2.5)">
        <path
          d="M8.33333 10V2.5C8.33333 1.57953 7.58714 0.833333 6.66667 0.833333H2.5C1.57953 0.833333 0.833333 1.57953 0.833333 2.5V10M8.33333 10V14.1667H0.833333V10M8.33333 10H0.833333"
          strokeWidth="1.66667"
        />
      </g>
      {/* Vector 2 — base rail (inset 83.33%/16.67%/16.67%/16.67%) */}
      <g transform="translate(2.5 15.83)">
        <path d="M0.833333 0.833333H14.1667" strokeWidth="1.66667" />
      </g>
      {/* Vector 3 — connector arm (inset 18.75%/16.67%/33.33%/70.83%) */}
      <g transform="translate(13.33 2.92)">
        <path
          d="M0.833354 6.25002V9.16669C0.833354 9.85704 1.393 10.4167 2.08335 10.4167C2.77371 10.4167 3.33335 9.85704 3.33335 9.16669V3.69731C3.33335 3.20268 3.11365 2.7336 2.73366 2.41694L0.833354 0.833354"
          strokeWidth="1.66667"
        />
      </g>
      {/* Vector 4 — lightning bolt fill (inset 27.08%/54.58%/47.92%/25.42%) */}
      <g transform="translate(5.08 5.42)">
        <path
          d="M2.67893 0.347884C2.67893 0.0215964 2.27875 -0.124505 2.07673 0.128027L0.077377 2.62734C-0.10397 2.85403 0.0537268 3.19439 0.340107 3.19439H1.32107V4.65212C1.32107 4.9784 1.72125 5.12451 1.92327 4.87197L3.92262 2.37266C4.10397 2.14597 3.94627 1.80561 3.65989 1.80561H2.67893V0.347884Z"
          fill="currentColor"
          stroke="none"
        />
      </g>
    </svg>
  );
}

function CreateIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className="block"
    >
      <path
        d="M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="3 4"
      />
    </svg>
  );
}

export function ModeToggle() {
  const { mode, setMode } = useMode();

  return (
    <div
      className="pointer-events-auto flex items-center gap-1 rounded-full p-1"
      style={{
        // Outer pill carries the 24% black backdrop. Inactive buttons stay
        // transparent on top of it so they read as "disabled segments"
        // within the pill. No drop shadow — keeps the chip light.
        backgroundColor: "rgba(0,0,0,0.24)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <ToggleButton
        id="explore"
        label="Explore"
        icon={<ExploreIcon />}
        active={mode === "explore"}
        onSelect={() => setMode("explore")}
      />
      <ToggleButton
        id="create"
        label="Create"
        icon={<CreateIcon />}
        active={mode === "create"}
        onSelect={() => setMode("create")}
      />
    </div>
  );
}
