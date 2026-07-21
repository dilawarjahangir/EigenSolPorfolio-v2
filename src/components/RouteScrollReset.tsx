"use client";

import { ScrollSmoother } from "gsap/ScrollSmoother";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

export default function RouteScrollReset() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    const resetScroll = () => {
      ScrollSmoother.get()?.scrollTo(0, false);
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();
    const frame = window.requestAnimationFrame(resetScroll);
    const timeout = window.setTimeout(resetScroll, 150);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.history.scrollRestoration = previousRestoration;
    };
  }, [pathname]);

  return null;
}
