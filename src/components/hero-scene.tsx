"use client";

import { StationMap } from "./station-map";
import { ClickableMap } from "./clickable-map";
import { HeroMap } from "./hero-map";
import { HeroMapProvider } from "./hero-map-provider";
import { useMode } from "./mode-context";

/**
 * Composes the hero's layered stack:
 *   1. Mapbox basemap (interactive — drag + zoom)
 *   2. Readability scrim
 *   3. Clickable "drop a pin" overlay (create mode only)
 *   4. Charging-station pins + popups
 */
export function HeroScene() {
  return (
    <HeroMapProvider>
      <HeroSceneInner />
    </HeroMapProvider>
  );
}

function HeroSceneInner() {
  const { setPopupOpen } = useMode();

  return (
    <>
      {/* Mapbox basemap. No CSS transforms on the container — the map's
          own drag/zoom math expects an untransformed canvas. */}
      <div className="absolute inset-0">
        <HeroMap />
      </div>

      {/* Readability scrim */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.14) 25%, rgba(0,0,0,0.06) 45%, rgba(0,0,0,0) 60%)",
        }}
      />

      {/* Click-anywhere layer. Only captures pointer events in create
          mode — in explore mode it sits pointer-events-none so drag and
          scroll-zoom reach the Mapbox canvas underneath. */}
      <ClickableMap />

      {/* Station pins + popups. */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <StationMap
          onActiveChange={(open) => setPopupOpen("station", open)}
        />
      </div>
    </>
  );
}
