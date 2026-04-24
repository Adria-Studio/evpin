"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Home,
  Plus,
  MoreVertical,
  Star,
  X,
} from "lucide-react";

type TabSpec = { label: string; dotColor: string };

/**
 * Faux browser tabs that represent every tool someone stitches together
 * today before evaluating a charging site. Listed left-to-right in tab-
 * strip order; the scroll animation closes them right-to-left.
 */
const TABS: TabSpec[] = [
  { label: "Google Maps",         dotColor: "#4285F4" },
  { label: "PlugShare",           dotColor: "#2aaa4b" },
  { label: "ArcGIS Online",       dotColor: "#006ac9" },
  { label: "data.census.gov",     dotColor: "#112e51" },
  { label: "OpenEI Utility Rates", dotColor: "#e35d22" },
  { label: "DOT Traffic Volumes", dotColor: "#0b3d91" },
  { label: "Utility Rates.xlsx",  dotColor: "#1d6f42" },
  { label: "LinkedIn",            dotColor: "#0a66c2" },
  { label: "Gmail",               dotColor: "#ea4335" },
  { label: "Slack",               dotColor: "#4a154b" },
];

/**
 * "Broken by design" section. Pinned while the user scrolls: as progress
 * moves 0 → 1, the 10 tabs are removed one-by-one from right to left
 * until only the leftmost (active) tab remains, and the EVPin mark fades
 * in at the center of the (otherwise empty) browser content area.
 */
export function WorkflowSection() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    // 0 when section top hits viewport top (pin starts),
    // 1 when section bottom hits viewport bottom (pin ends).
    offset: ["start start", "end end"],
  });

  // Drive tab count from scroll progress. 0 → all 10 tabs, 0.6 → 1 tab
  // (the leftmost survives). Commit to React state only when the rounded
  // count changes so AnimatePresence can run enter/exit transitions
  // between discrete states rather than thrashing every frame.
  const [visibleCount, setVisibleCount] = useState(TABS.length);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const t = Math.max(0, Math.min(1, v / 0.6));
    const n = Math.max(1, Math.round(TABS.length - t * (TABS.length - 1)));
    setVisibleCount((prev) => (prev === n ? prev : n));
  });

  return (
    <section
      ref={ref}
      className="relative w-full"
      style={{ backgroundColor: "#f4f4f0" }}
    >
      {/* Tall scrubber: drives the tab-closing + logo-reveal animation.
          Sized to roughly one extra viewport of scroll travel. */}
      <div className="relative h-[220vh]">
        <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
          <div className="flex w-[1280px] max-w-full flex-col items-center gap-20 px-6">
            <div className="flex w-full max-w-[768px] flex-col items-center gap-4">
              <div
                className="relative inline-flex items-center justify-center rounded-full border border-[#d8d8d0] bg-white px-3 py-1 text-[14px] font-medium leading-5 text-[#0c0c09]"
                style={{ filter: "drop-shadow(0 2px 1px rgba(19,19,19,0.06))" }}
              >
                No more tab-switching
              </div>
              <h2 className="text-center text-[48px] font-semibold leading-[48px] tracking-[-0.96px] text-black">
                The system of evaluating EV charging sites is broken by design
              </h2>
              <p className="max-w-[448px] text-center text-[16px] font-normal leading-6 text-[#5b5b4b]">
                From scouting a location to sending the final report, EVPin keeps the proposal process connected and moving forward.
              </p>
            </div>

            <BrowserMockup
              visibleCount={visibleCount}
              progress={scrollYProgress}
            />
          </div>
        </div>

        {/* Tall bottom fade — bleeds into whatever follows. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[189px]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(244,244,240,0), #ffffff)",
          }}
        />
      </div>
    </section>
  );
}

function BrowserMockup({
  visibleCount,
  progress,
}: {
  visibleCount: number;
  progress: MotionValue<number>;
}) {
  const visibleTabs = TABS.slice(0, visibleCount);

  return (
    <div className="flex h-[640px] w-[1024px] max-w-full flex-col overflow-hidden rounded-[10px] border border-white/30 bg-white">

      {/* Tab strip. `overflow-hidden` clips exiting tabs as they lift up,
          so the + button can slide into the vacated slot without ever
          painting over a half-faded tab during fast scroll. */}
      <div className="flex h-8 w-full items-end gap-[2px] overflow-hidden bg-[#e3e3e3] pl-2 pr-1 pt-[6px]">
        {/* Traffic lights. Dimensions match the Figma Controls frame
            (56.89 × 28.44 at source, 1.125× here): 12 px circles with
            macOS-standard 8 px gaps. `mb-[10px]` puts their center at
            y=16 in the 32 px strip — same vertical center as the
            Figma source after scaling. */}
        <div className="mb-[10px] flex items-center gap-2 pl-[6px] pr-[12px]">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>

        {/* `popLayout` pulls exiting tabs out of normal flow, so the
            remaining tabs + the trailing + button reflow left via their
            `layout` prop. The exit animation is kept short + upward so
            the exiting tab is visually gone (clipped) before the + button
            finishes sliding into its new spot. */}
        <AnimatePresence initial={false} mode="popLayout">
          {visibleTabs.map((tab, i) => (
            <BrowserTab
              key={tab.label}
              tab={tab}
              active={i === 0 && visibleCount === 1}
            />
          ))}
        </AnimatePresence>

        <motion.button
          type="button"
          layout
          // Re-measure on count change so layout animates in BOTH
          // directions (add + remove). Without this, removals sometimes
          // skip the animation because the snapshot is taken before the
          // AnimatePresence commit.
          layoutDependency={visibleCount}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="mb-[2px] grid size-6 shrink-0 place-items-center rounded-full text-[#5b5b4b] hover:bg-black/5"
          aria-label="New tab"
        >
          <Plus className="size-[14px]" strokeWidth={2.5} />
        </motion.button>
      </div>

      {/* Address bar */}
      <div className="flex items-center gap-1 border-b border-[#efeded] bg-white px-2 py-[6px]">
        <ToolbarIconButton aria-label="Back">
          <ArrowLeft className="size-[14px]" strokeWidth={2} />
        </ToolbarIconButton>
        <ToolbarIconButton aria-label="Forward">
          <ArrowRight className="size-[14px]" strokeWidth={2} />
        </ToolbarIconButton>
        <ToolbarIconButton aria-label="Reload">
          <RotateCw className="size-[14px]" strokeWidth={2} />
        </ToolbarIconButton>
        <ToolbarIconButton aria-label="Home">
          <Home className="size-[14px]" strokeWidth={2} />
        </ToolbarIconButton>

        <div className="mx-1 flex h-6 flex-1 items-center gap-2 rounded-full bg-[#efeded] px-[6px]">
          <span className="grid size-[18px] place-items-center rounded-full bg-white">
            <GoogleGlyph />
          </span>
          <span className="flex-1 truncate text-[11px] text-[#1f1f1f]">
            Search on Google or type in a URL
          </span>
          <Star className="size-[14px] text-[#5b5b4b]" strokeWidth={2} />
        </div>

        <div
          className="size-[18px] rounded-full border border-black/5"
          style={{
            background:
              "linear-gradient(to top, #b7bad1, #d1cad6 45%, #d5d8e4)",
          }}
          aria-hidden
        />
        <ToolbarIconButton aria-label="More">
          <MoreVertical className="size-[14px]" strokeWidth={2} />
        </ToolbarIconButton>
      </div>

      {/* Content area — EVPin mark fades in once every tab has closed. */}
      <div className="relative flex-1 bg-[#fbfbfb]">
        <EvpinLogo progress={progress} />
      </div>
    </div>
  );
}

function BrowserTab({ tab, active }: { tab: TabSpec; active: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -14, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      // Fast upward lift + fade so the exiting tab clears the + button's
      // path quickly; the tab strip's `overflow-hidden` crops the lifted
      // tab so it can't paint over the traffic lights either.
      exit={{ opacity: 0, y: -18, scale: 0.9 }}
      transition={{
        duration: 0.18,
        ease: [0.22, 1, 0.36, 1],
        layout: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
      }}
      // `flex-1 min-w-0` lets every tab share the free space in the strip
      // equally and shrink below its content width; `max-w` caps each
      // tab's width so a lone surviving tab doesn't stretch across the
      // whole toolbar. Many tabs → narrow (truncated labels), few tabs →
      // capped-wide, with empty strip to the right of the + button
      // (Chrome-like).
      className={[
        "flex h-[26px] min-w-0 max-w-[224px] flex-1 items-center gap-[6px] overflow-hidden rounded-t-md px-[10px] text-[11px] font-medium text-[#1f1f1f]",
        active ? "bg-white" : "bg-white/70",
      ].join(" ")}
    >
      <span
        className="size-3 shrink-0 rounded-sm"
        style={{ backgroundColor: tab.dotColor }}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate">{tab.label}</span>
      <X
        className="size-[10px] shrink-0 text-[#5b5b4b]"
        strokeWidth={2.5}
      />
    </motion.div>
  );
}

function EvpinLogo({ progress }: { progress: MotionValue<number> }) {
  // Tabs finish collapsing down to one at progress = 0.6. Start the
  // reveal a beat after so the logo fades in *into* the freshly quiet
  // browser rather than competing with the final tab exit.
  const opacity = useTransform(progress, [0.62, 0.8], [0, 1]);
  const scale = useTransform(progress, [0.62, 0.88], [0.9, 1]);
  const y = useTransform(progress, [0.62, 0.88], [16, 0]);

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-4"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/figma/nav-logo.svg"
        alt="EVPin"
        width={56}
        height={77}
        className="h-[72px] w-auto"
        draggable={false}
        style={{ filter: "invert(1)" }}
      />
      <span className="text-[14px] font-medium leading-5 text-[#5b5b4b]">
        EVPin
      </span>
    </motion.div>
  );
}

function ToolbarIconButton({
  children,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  "aria-label": string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className="grid size-6 place-items-center rounded-full text-[#5b5b4b] hover:bg-black/5"
    >
      {children}
    </button>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-[10px]" aria-hidden>
      <path fill="#4285F4" d="M23 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h6.2c-.3 1.5-1.1 2.8-2.4 3.7v3h3.9c2.3-2.1 3.6-5.2 3.6-8.7z" />
      <path fill="#34A853" d="M12 23c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1C3.4 20.3 7.4 23 12 23z" />
      <path fill="#FBBC05" d="M5.4 13.4c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V6H1.4C.5 7.6 0 9.5 0 11.2s.5 3.6 1.4 5.2l4-2.9z" />
      <path fill="#EA4335" d="M12 4.5c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.1 15.2 0 12 0 7.4 0 3.4 2.7 1.4 6.6l4 3.1C6.3 6.9 8.9 4.5 12 4.5z" />
    </svg>
  );
}
