"use client";

import { useEffect, useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import { useHeroMap } from "./hero-map-provider";

/**
 * Mapbox basemap used as the hero backdrop. Framed so the Pacific covers
 * the left half of the viewport and the Richmond / Sunset districts sit on
 * the right — matches the framing of the old static `basemap-new.png`.
 *
 * The map is non-interactive — drag/zoom/rotate/pitch are all disabled
 * so the hero stays anchored to the framed SF viewport. The Explore /
 * Create modes still drive their own interactions on the layers above.
 *
 * Performance: mapbox-gl is imported dynamically so ~500 KB of library
 * code is split out of the main client chunk — the hero copy, CTAs, and
 * nav become interactive before the map library finishes loading.
 */
export function HeroMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { setMap } = useHeroMap();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.warn(
        "[HeroMap] NEXT_PUBLIC_MAPBOX_TOKEN is not set — map will not render.",
      );
      return;
    }

    let map: MapboxMap | undefined;
    let cancelled = false;

    (async () => {
      const { default: mapboxgl } = await import("mapbox-gl");
      if (cancelled) return;
      mapboxgl.accessToken = token;

      map = new mapboxgl.Map({
        container,
        // Mapbox Standard — vivid greens, rich water, labelled streets
        // and POIs. Closest built-in style to Apple Maps' look.
        style: "mapbox://styles/mapbox/standard",
        center: [-122.535, 37.762],
        zoom: 13,
        logoPosition: "bottom-right",
        // Fully locked: no drag, scroll-zoom, double-click zoom, touch
        // pinch, keyboard, or rotate/pitch. The hero owns the framing.
        interactive: false,
      });

      map.on("load", () => {
        // Standard style's default lightPreset is already "day", so we
        // only need to hide the 3D objects so the hero reads as flat.
        try {
          map!.setConfigProperty("basemap", "show3dObjects", false);
        } catch {
          /* older styles / SDKs don't expose setConfigProperty — ignore */
        }
        setMap(map!);
      });
    })();

    return () => {
      cancelled = true;
      if (map) {
        setMap(null);
        map.remove();
      }
    };
  }, [setMap]);

  return <div ref={containerRef} className="h-full w-full" />;
}
