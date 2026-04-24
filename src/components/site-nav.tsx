"use client";

import { useEffect, useState } from "react";

/**
 * Site-wide sticky navigation.
 *
 * - Sits at the top of the hero visually transparent so the map/sky shows
 *   through.
 * - Once the user starts scrolling, fades in a 16% black scrim with a
 *   backdrop blur and a hairline white bottom border — the same treatment
 *   described in the Figma scroll spec.
 */
export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 w-full transition-[background-color,backdrop-filter,box-shadow] duration-200 ease-out"
      style={{
        backgroundColor: scrolled ? "rgba(0,0,0,0.32)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        // 0.5px hairline below the nav once the user has scrolled.
        boxShadow: scrolled ? "inset 0 -0.5px 0 rgba(255,255,255,0.12)" : "none",
      }}
    >
      <div className="mx-auto flex w-[1280px] max-w-full items-center justify-between py-6">
        <div className="flex items-center gap-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/figma/nav-logo.svg"
            alt="EVPin"
            width={23}
            height={32}
            className="h-8 w-auto"
            draggable={false}
          />
          <nav className="flex items-center gap-6 text-[14px] font-bold leading-5 text-white tracking-[-0.01em]">
            <a href="#" className="transition-colors hover:text-white/80">Home</a>
            <a href="#" className="transition-colors hover:text-white/80">Tracker</a>
            <a href="#" className="transition-colors hover:text-white/80">Pricing</a>
            <a href="#" className="transition-colors hover:text-white/80">Spexbook</a>
            <a href="#" className="transition-colors hover:text-white/80">Changelog</a>
          </nav>
        </div>
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="h-[34px] cursor-pointer rounded-full bg-black/25 px-4 text-[14px] font-medium leading-5 text-white transition-colors duration-150 hover:bg-black/55 active:bg-black/70"
            style={{
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            Log In
          </button>
          <button
            type="button"
            className="h-[34px] cursor-pointer rounded-full bg-white px-4 text-[14px] font-medium leading-5 text-neutral-950 transition-colors duration-150 hover:bg-neutral-200 active:bg-neutral-300"
          >
            Create Account
          </button>
        </div>
      </div>
    </header>
  );
}
