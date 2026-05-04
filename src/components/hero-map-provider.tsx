"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type mapboxgl from "mapbox-gl";

type HeroMapCtx = {
  map: mapboxgl.Map | null;
  setMap: (m: mapboxgl.Map | null) => void;
};

const HeroMapContext = createContext<HeroMapCtx | null>(null);

export function HeroMapProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  return (
    <HeroMapContext.Provider value={{ map, setMap }}>
      {children}
    </HeroMapContext.Provider>
  );
}

export function useHeroMap() {
  const ctx = useContext(HeroMapContext);
  if (!ctx) throw new Error("useHeroMap must be used inside HeroMapProvider");
  return ctx;
}
