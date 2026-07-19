"use client";

import { ScrollSmoother } from "gsap/ScrollSmoother";
import type { MouseEvent, ReactNode } from "react";

type BackToTopLinkProps = {
  children: ReactNode;
  className?: string;
};

export default function BackToTopLink({ children, className }: BackToTopLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const smoother = ScrollSmoother.get();

    if (smoother) {
      smoother.scrollTo(0, true);
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <a className={className} href="#home" aria-label="Back to top" onClick={handleClick}>
      {children}
    </a>
  );
}
