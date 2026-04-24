"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Mode = "explore" | "create";

type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => void;
  /** Any popup (station or create-mode placement) currently visible? */
  popupOpen: boolean;
  /**
   * Each popup source (e.g. "station", "click") reports its own open/closed
   * state. The context aggregates them — `popupOpen` is true if ANY source
   * is open. Using a source key avoids race conditions when two components
   * both try to drive a single boolean.
   */
  setPopupOpen: (source: string, open: boolean) => void;
};

const ModeContext = createContext<Ctx | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("explore");
  const [openSources, setOpenSources] = useState<Record<string, boolean>>({});

  const setPopupOpen = useCallback((source: string, open: boolean) => {
    setOpenSources((prev) => {
      if (!!prev[source] === open) return prev;
      return { ...prev, [source]: open };
    });
  }, []);

  const popupOpen = useMemo(
    () => Object.values(openSources).some(Boolean),
    [openSources],
  );

  const value = useMemo(
    () => ({ mode, setMode, popupOpen, setPopupOpen }),
    [mode, popupOpen, setPopupOpen],
  );

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

/**
 * Safe accessor — returns the current mode/popup state or inert fallbacks
 * when consumed outside the provider.
 */
export function useMode(): Ctx {
  const ctx = useContext(ModeContext);
  if (ctx) return ctx;
  return {
    mode: "explore",
    setMode: () => {},
    popupOpen: false,
    setPopupOpen: () => {},
  };
}
