"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
  value: number;
};

export default function AnimatedCounter({ value }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const targetRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let started = false;

    const start = () => {
      if (started) return;
      started = true;

      const increment = Math.max(1, Math.ceil(value / 20));
      const steps = Math.ceil(value / increment);
      const intervalTime = Math.max(30, 500 / steps);

      intervalId = setInterval(() => {
        setCount((current) => {
          const next = current + increment;
          if (next >= value) {
            if (intervalId) clearInterval(intervalId);
            return value;
          }
          return next;
        });
      }, intervalTime);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
      },
      { threshold: 0.1, rootMargin: "50px" },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      if (intervalId) clearInterval(intervalId);
    };
  }, [value]);

  return <span ref={targetRef}>{count}</span>;
}
