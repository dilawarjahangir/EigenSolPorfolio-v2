"use client";

import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import imagesLoaded from "imagesloaded";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import styles from "./ServiceFourExperience.module.css";

type ServiceFourExperienceProps = {
  children: ReactNode;
};

export default function ServiceFourExperience({ children }: ServiceFourExperienceProps) {
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
        gsap.set(
          content.querySelectorAll<HTMLElement>(
            ".service4-fade, .tp_fade_anim, .service4-image-reveal, .tp_img_reveal",
          ),
          { clearProps: "all", autoAlpha: 1 },
        );
        return;
      }

      animationContext = gsap.context(() => {
        const fadeItems = gsap.utils.toArray<HTMLElement>(
          ".service4-fade, .tp_fade_anim",
          content,
        );

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

        const revealItems = gsap.utils.toArray<HTMLElement>(
          ".service4-image-reveal, .tp_img_reveal",
          content,
        );

        revealItems.forEach((reveal) => {
          const image = reveal.querySelector("img");
          if (!image) return;

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: reveal,
              start: "top 70%",
            },
          });

          timeline.set(reveal, { autoAlpha: 1 });
          timeline.from(reveal, {
            duration: 1.5,
            xPercent: -100,
            ease: "power2.out",
          });
          timeline.from(
            image,
            {
              duration: 1.5,
              xPercent: 100,
              scale: 1.5,
              ease: "power2.out",
            },
            "-=1.5",
          );
        });
      }, content);

      ScrollTrigger.refresh();
    };

    const imageLoader = imagesLoaded(wrapper, { background: true });
    imageLoader.on("always", initializeAnimations);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      imageLoader.off("always", initializeAnimations);
      animationContext?.revert();
      smoother?.kill();
    };
  }, []);

  return (
    <div id="service-smooth-wrapper" ref={wrapperRef}>
      <div id="service-smooth-content" className={styles.content} ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
