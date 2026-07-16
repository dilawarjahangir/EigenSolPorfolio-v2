"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

type CountUpNumberProps = {
  end: number;
  suffix?: string;
  duration?: number;
  start?: boolean;
};

export default function CountUpNumber({
  end,
  suffix = "",
  duration = 5000,
  start = true,
}: CountUpNumberProps) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const hasStartedRef = useRef(false);
  const isVisible = useInView(counterRef, { once: true, amount: 0.6 });
  const [value, setValue] = useState(0);
  const shouldStart = start && isVisible;

  useEffect(() => {
    if (!shouldStart || hasStartedRef.current) return;
    hasStartedRef.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frameId = window.requestAnimationFrame(() => setValue(end));
      return () => window.cancelAnimationFrame(frameId);
    }

    let frameId = window.requestAnimationFrame(() => {
      setValue(0);
      const startedAt = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(end * eased));

        if (progress < 1) {
          frameId = window.requestAnimationFrame(tick);
        }
      };

      frameId = window.requestAnimationFrame(tick);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [duration, end, shouldStart]);

  return (
    <span ref={counterRef}>
      {value}
      {suffix}
    </span>
  );
}
