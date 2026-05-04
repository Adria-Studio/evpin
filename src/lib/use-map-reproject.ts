"use client";

import { useEffect, useReducer } from "react";
import type { Map as MapboxMap } from "mapbox-gl";

/**
 * Re-renders the caller whenever the given Mapbox map pans or zooms.
 * Use this in any component that projects lng/lat to screen pixels —
 * pins, popups, labels — so those positions track the live map.
 *
 * The dispatch is synchronous (no rAF coalescing): Mapbox updates the
 * canvas in the same tick the `move` event fires, so deferring our
 * React commit to the next frame paints the pins one frame behind the
 * map and produces a visible jitter during drag. Listening to both
 * `move` and `zoom` keeps parity with Mapbox's own event cadence.
 */
export function useMapReproject(map: MapboxMap | null) {
  const [, tick] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    if (!map) return;
    map.on("move", tick);
    map.on("zoom", tick);
    // Paint once with the map's initial viewport so projected children
    // don't start at (0, 0) before the first move event fires.
    tick();
    return () => {
      map.off("move", tick);
      map.off("zoom", tick);
    };
  }, [map]);
}
