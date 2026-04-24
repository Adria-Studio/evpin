"use client";

import { useEffect, useState } from "react";

type Props = {
  to: number;
  duration?: number;
  delay?: number;
  format?: (n: number) => string;
};

export function CountUp({ to, duration = 900, delay = 120, format }: Props) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let raf = 0;
    let start = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const tick = (t: number) => {
      if (!start) start = t;
      const progress = Math.min(1, (t - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    timeoutId = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [to, duration, delay]);

  return <>{format ? format(val) : val.toLocaleString()}</>;
}
