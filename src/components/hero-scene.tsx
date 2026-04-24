"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { StationMap } from "./station-map";
import { ClickableMap } from "./clickable-map";
import { useMode } from "./mode-context";

/**
 * Groups the basemap and the charging-station pins into a single parallax
 * layer so they move together in lockstep as the cursor drifts across the
 * viewport. The parallax drift freezes while ANY popup is open — whether
 * it's an existing station popup or a create-mode click popup.
 */
export function HeroScene() {
  const { popupOpen, setPopupOpen } = useMode();

  const cx = useMotionValue(0);
  const cy = useMotionValue(0);

  const rawX = useTransform(cx, (v) => -v * 0.012);
  const rawY = useTransform(cy, (v) => -v * 0.012);
  const x = useSpring(rawX, { stiffness: 80, damping: 22, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 80, damping: 22, mass: 0.6 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // Freeze the drift while any popup is visible.
      if (popupOpen) return;
      cx.set(e.clientX - window.innerWidth / 2);
      cy.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [cx, cy, popupOpen]);

  return (
    <>
      {/* Basemap image drifts opposite to cursor */}
      <motion.img
        src="/figma/basemap-new.png"
        alt=""
        draggable={false}
        style={{ x, y, scale: 1.03 }}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
      />

      {/* Readability scrim */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.14) 25%, rgba(0,0,0,0.06) 45%, rgba(0,0,0,0) 60%)",
        }}
      />

      {/* Click-anywhere layer (below pins). */}
      <ClickableMap />

      {/* Pins share the same motion values so they stay glued to the map. */}
      <motion.div
        style={{ x, y, scale: 1.03 }}
        className="pointer-events-none absolute inset-0 z-10"
      >
        <div className="pointer-events-none absolute inset-0">
          <StationMap
            onActiveChange={(open) => setPopupOpen("station", open)}
          />
        </div>
      </motion.div>
    </>
  );
}
