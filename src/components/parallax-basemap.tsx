"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/**
 * Basemap that drifts a few pixels opposite to the cursor — adds a subtle
 * depth cue without distracting from the content. The movement is clamped
 * via a low multiplier so it never exceeds ≈ 12px even on ultra-wide
 * displays, and smoothed with a spring so there's no jitter.
 */
export function ParallaxBasemap() {
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);

  // Move opposite to cursor by a small fraction, spring-damped.
  const rawX = useTransform(cx, (v) => -v * 0.012);
  const rawY = useTransform(cy, (v) => -v * 0.012);
  const x = useSpring(rawX, { stiffness: 80, damping: 22, mass: 0.6 });
  const y = useSpring(rawY, { stiffness: 80, damping: 22, mass: 0.6 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cx.set(e.clientX - window.innerWidth / 2);
      cy.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [cx, cy]);

  return (
    <motion.img
      src="/figma/basemap-new.png"
      alt=""
      draggable={false}
      style={{ x, y, scale: 1.03 }}
      className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
    />
  );
}
