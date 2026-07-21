"use client";

import gsap from "gsap";
import imagesLoaded from "imagesloaded";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, type ReactNode } from "react";

type AboutUsExperienceProps = {
  children: ReactNode;
};

export default function AboutUsExperience({ children }: AboutUsExperienceProps) {
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
    let media: gsap.MatchMedia | null = null;
    let initialized = false;

    const initializeAnimations = () => {
      if (initialized) return;
      initialized = true;

      if (reduceMotion) {
        gsap.set(content.querySelectorAll<HTMLElement>(".tp_fade_anim"), {
          clearProps: "all",
          autoAlpha: 1,
        });
        gsap.set(content.querySelectorAll<HTMLElement>(".tp-text-bounce"), {
          clearProps: "all",
          autoAlpha: 1,
        });
        ScrollTrigger.refresh();
        return;
      }

      animationContext = gsap.context(() => {
        media = gsap.matchMedia();

        media.add("(min-width: 1200px)", () => {
          const panelWrap = content.querySelector<HTMLElement>(".tp-funfact-panel-wrap");
          const panels = gsap.utils.toArray<HTMLElement>(".tp-funfact-panel", content);

          if (!panelWrap || panels.length === 0) return;

          gsap.to(panels, {
            xPercent: -100 * (panels.length - 1),
            ease: "none",
            scrollTrigger: {
              trigger: panelWrap,
              start: "top 70px",
              pin: true,
              scrub: 1,
              end: () => `+=${panelWrap.clientWidth}`,
            },
          });
        });

        media.add("(min-width: 1199px)", () => {
          const pinAreas = gsap.utils.toArray<HTMLElement>(".about-panel-pin-area", content);

          pinAreas.forEach((area) => {
            const pins = gsap.utils.toArray<HTMLElement>(".about-panel-pin", area);

            pins.forEach((pin) => {
              ScrollTrigger.create({
                trigger: pin,
                pin,
                scrub: 1,
                start: "top 10%",
                end: "bottom 99%",
                endTrigger: area,
                pinSpacing: false,
              });
            });
          });
        });

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

        const bounceItems = gsap.utils.toArray<HTMLElement>(".tp-text-bounce", content);

        if (bounceItems.length > 0) {
          gsap.set(bounceItems, { y: 100, opacity: 0 });

          bounceItems.forEach((item) => {
            const trigger = item.closest<HTMLElement>(".tp-text-bounce-trigger");

            if (!trigger) return;

            gsap.to(item, {
              y: 0,
              opacity: 1,
              duration: 1,
              delay: item.dataset.delay ? Number.parseFloat(item.dataset.delay) : 0.15,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger,
                start: "top center",
              },
            });
          });
        }
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
      media?.revert();
      animationContext?.revert();
      smoother?.kill();
    };
  }, []);

  return (
    <div id="about-smooth-wrapper" ref={wrapperRef}>
      <div id="about-smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
