"use client";

import gsap from "gsap";
import imagesLoaded from "imagesloaded";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, type ReactNode } from "react";

type AgntixInnerPageExperienceProps = {
  children: ReactNode;
};

export default function AgntixInnerPageExperience({
  children,
}: AgntixInnerPageExperienceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;

    if (!wrapper || !content) return;

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    gsap.config({ nullTargetWarn: false });
    ScrollSmoother.get()?.kill();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smoother = reduceMotion
      ? null
      : ScrollSmoother.create({
          wrapper,
          content,
          smooth: 2,
          effects: true,
          smoothTouch: 0.1,
          normalizeScroll: false,
          ignoreMobileResize: true,
        });

    let animationContext: gsap.Context | null = null;
    let initialized = false;

    const initializeAnimations = () => {
      if (initialized) return;
      initialized = true;

      if (reduceMotion) {
        gsap.set(content.querySelectorAll<HTMLElement>(".tp_fade_anim"), {
          clearProps: "all",
          autoAlpha: 1,
        });
        return;
      }

      animationContext = gsap.context(() => {
        const fadeItems = gsap.utils.toArray<HTMLElement>(".tp_fade_anim", content);

        fadeItems.forEach((item) => {
          const offset = item.dataset.fadeOffset
            ? Number.parseInt(item.dataset.fadeOffset, 10)
            : 40;
          const duration = item.dataset.duration
            ? Number.parseFloat(item.dataset.duration)
            : 0.75;
          const direction = item.dataset.fadeFrom || "bottom";
          const onScroll = item.dataset.onScroll !== "0";
          const delay = item.dataset.delay ? Number.parseFloat(item.dataset.delay) : 0.15;
          const ease = item.dataset.ease || "power2.out";

          gsap.from(item, {
            opacity: 0,
            duration,
            delay,
            ease,
            x: direction === "left" ? -offset : direction === "right" ? offset : 0,
            y: direction === "top" ? -offset : direction === "bottom" ? offset : 0,
            scrollTrigger: onScroll
              ? {
                  trigger: item,
                  start: "top 85%",
                }
              : undefined,
          });
        });
      }, content);

      ScrollTrigger.refresh();
    };

    const imageLoader = imagesLoaded(wrapper, { background: true });
    imageLoader.on("always", initializeAnimations);

    const refreshScrollTriggers = () => ScrollTrigger.refresh();
    window.addEventListener("load", refreshScrollTriggers);

    return () => {
      window.removeEventListener("load", refreshScrollTriggers);
      imageLoader.off("always", initializeAnimations);
      animationContext?.revert();
      smoother?.kill();
    };
  }, []);

  return (
    <div id="inner-smooth-wrapper" ref={wrapperRef}>
      <div id="inner-smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
