"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  LockKeyhole,
  Share,
} from "lucide-react";

type TabSpec = { label: string; dotColor: string };

const TABS: TabSpec[] = [
  { label: "AutoCAD", dotColor: "#0c0c09" },
  { label: "AutoCAD", dotColor: "#0c0c09" },
  { label: "AutoCAD", dotColor: "#0c0c09" },
  { label: "AutoCAD", dotColor: "#0c0c09" },
  { label: "AutoCAD", dotColor: "#0c0c09" },
  { label: "AutoCAD", dotColor: "#0c0c09" },
  { label: "AutoCAD", dotColor: "#0c0c09" },
  { label: "AutoCAD", dotColor: "#0c0c09" },
  { label: "AutoCAD", dotColor: "#0c0c09" },
];

export function WorkflowSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [tabsDropped, setTabsDropped] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    // 0 when section top hits viewport top (pin starts),
    // 1 when section bottom hits viewport bottom (pin ends).
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v >= 0.16) {
      setTabsDropped(true);
    } else if (v <= 0.04) {
      setTabsDropped(false);
    }
  });

  return (
    <section
      ref={ref}
      className="relative w-full"
      style={{ backgroundColor: "#f4f4f4" }}
    >
      <div className="relative h-[220vh]">
        <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
          <div className="flex w-[1280px] max-w-full flex-col items-center gap-20 px-6 py-32">
            <div
              className="flex w-full max-w-[768px] flex-col items-center gap-6 text-center"
              data-node-id="299:4671"
            >
              <h2
                className="w-full text-center text-[48px] font-[590] leading-[48px] tracking-[-0.96px] text-black"
                data-node-id="299:4672"
                style={{ fontVariationSettings: "'wdth' 100" }}
              >
                The system of evaluating EV charging sites is broken by design
              </h2>
              <p
                className="max-w-[620px] text-center text-[16px] font-normal leading-6 text-[#5b5b4b]"
                data-node-id="299:4673"
                style={{
                  fontFamily:
                    'Rubik, var(--font-sf-pro), var(--font-inter), sans-serif',
                }}
              >
                From scouting a location to sending the final report, EVPin keeps the proposal process connected and moving forward.
              </p>
            </div>

            <BrowserMockup tabsDropped={tabsDropped} />
          </div>
        </div>

        {/* Tall bottom fade — bleeds into whatever follows. */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[189px]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(244,244,244,0), #f4f4f4)",
          }}
        />
      </div>
    </section>
  );
}

function BrowserMockup({ tabsDropped }: { tabsDropped: boolean }) {
  return (
    <div className="flex w-[1200px] max-w-full flex-col items-center overflow-hidden rounded-[32px] bg-white">
      <div className="flex h-16 w-full items-center justify-between border-b border-black/[0.06] bg-white p-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex h-4 w-[72px] items-center gap-3">
            <span className="size-4 rounded-full bg-[#ff5f57]" />
            <span className="size-4 rounded-full bg-[#febc2e]" />
            <span className="size-4 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex h-7 w-14 items-center justify-center gap-[6px] rounded-full bg-[#f4f4f4] px-2 py-1 text-black/50">
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            <ArrowRight className="size-4" strokeWidth={1.75} />
          </div>
        </div>

        <div className="flex w-[640px] max-w-[48vw] items-center gap-[6px] overflow-hidden rounded-full bg-[#f4f4f4] px-3 py-1">
          <LockKeyhole className="size-4 shrink-0 text-black" strokeWidth={1.75} />
          <span className="truncate text-[14px] font-medium leading-5 text-black/50">
            evpin.com/
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <ToolbarIconButton aria-label="Share">
            <Share className="size-4" strokeWidth={1.75} />
          </ToolbarIconButton>
          <ToolbarIconButton aria-label="Copy">
            <Copy className="size-4" strokeWidth={1.75} />
          </ToolbarIconButton>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{ borderBottomColor: tabsDropped ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.06)" }}
        transition={{
          duration: tabsDropped ? 0.24 : 0.18,
          ease: "easeOut",
          delay: tabsDropped ? 0.24 : 0,
        }}
        className="relative z-10 flex w-full items-center border-b bg-white px-6 py-3"
      >
        <div className="flex min-w-0 flex-1 items-center gap-[6px] overflow-visible">
          {TABS.map((tab, i) => (
            <BrowserTab
              key={`${tab.label}-${i}`}
              tab={tab}
              index={i}
              dropped={tabsDropped}
            />
          ))}
        </div>
      </motion.div>

      <div className="relative h-[632px] w-full overflow-hidden bg-white">
        <motion.div
          initial={false}
          animate={{ opacity: tabsDropped ? 0 : 1 }}
          transition={{
            duration: tabsDropped ? 0.32 : 0.2,
            ease: "easeOut",
          }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[56%]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0), #f4f4f4 86%)",
          }}
        />
        <EvpinLogo visible={tabsDropped} />
      </div>
    </div>
  );
}

function BrowserTab({
  tab,
  index,
  dropped,
}: {
  tab: TabSpec;
  index: number;
  dropped: boolean;
}) {
  const distanceFromCenter = index - (TABS.length - 1) / 2;
  const delay = index * 0.035;
  const spring = {
    type: "spring" as const,
    stiffness: 74,
    damping: 15,
    mass: 1.18,
    delay,
  };

  return (
    <motion.div
      initial={false}
      animate={
        dropped
          ? {
              x: distanceFromCenter * -92,
              y: 430,
              rotate: distanceFromCenter * 16,
              scale: 0.86,
              opacity: 0,
              filter: "blur(8px)",
            }
          : {
              x: 0,
              y: 0,
              rotate: 0,
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
            }
      }
      transition={
        dropped
          ? {
              x: spring,
              y: spring,
              rotate: spring,
              scale: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
              opacity: { duration: 0.2, ease: "easeOut", delay: delay + 0.14 },
              filter: { duration: 0.2, ease: "easeOut", delay: delay + 0.14 },
            }
          : {
              x: spring,
              y: spring,
              rotate: spring,
              scale: { duration: 0.62, ease: [0.22, 1, 0.36, 1], delay },
              opacity: {
                duration: 0.16,
                ease: "easeOut",
                delay: Math.max(0, delay - 0.14),
              },
              filter: {
                duration: 0.24,
                ease: "easeOut",
                delay: delay + 0.42,
              },
            }
      }
      className="relative z-20 flex min-w-0 flex-1 origin-center items-center gap-[6px] overflow-hidden rounded-full bg-[#f4f4f4] px-2 py-1 shadow-none will-change-transform"
    >
      <span
        className="size-4 shrink-0 rounded-full"
        style={{ backgroundColor: tab.dotColor }}
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-[12px] font-semibold leading-4 text-black">
        {tab.label}
      </span>
    </motion.div>
  );
}

function EvpinLogo({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={
        visible
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 0, scale: 0.92, y: 18 }
      }
      transition={
        visible
          ? {
              opacity: { duration: 0.28, ease: "easeOut", delay: 0.72 },
              scale: {
                type: "spring",
                stiffness: 96,
                damping: 14,
                mass: 0.9,
                delay: 0.72,
              },
              y: {
                type: "spring",
                stiffness: 96,
                damping: 14,
                mass: 0.9,
                delay: 0.72,
              },
            }
          : { duration: 0.16, ease: "easeOut" }
      }
      className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4"
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
      <span className="text-[14px] font-medium leading-5 text-black/50">
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
      className="grid size-7 place-items-center rounded-full bg-[#f4f4f4] text-black hover:bg-black/10"
    >
      {children}
    </button>
  );
}
