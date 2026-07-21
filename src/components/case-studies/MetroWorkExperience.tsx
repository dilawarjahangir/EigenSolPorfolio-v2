"use client";

import gsap from "gsap";
import imagesLoaded from "imagesloaded";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useLayoutEffect, useRef, type ReactNode } from "react";

type MetroWorkExperienceProps = {
  children: ReactNode;
};

export default function MetroWorkExperience({ children }: MetroWorkExperienceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;

    if (!wrapper || !content) return;

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
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
    const splits: SplitText[] = [];
    let initialized = false;

    const initializeAnimations = () => {
      if (initialized) return;
      initialized = true;

      if (reduceMotion) {
        gsap.set(
          content.querySelectorAll<HTMLElement>(
            "[data-metro-thumb], .metro-reveal, .metro-title-invert, .tp_fade_anim, [data-metro-logo-track]",
          ),
          { clearProps: "all", autoAlpha: 1 },
        );
        content.querySelectorAll<HTMLElement>(".metro-title-invert").forEach((title) => {
          title.style.backgroundPositionX = "0%";
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

        media = gsap.matchMedia();
        media.add("(min-width: 991px)", () => {
          const titleBoxes = gsap.utils.toArray<HTMLElement>(".metro-title-box", content);

          titleBoxes.forEach((box) => {
            const scrollingTitles = gsap.utils.toArray<HTMLElement>(
              ".metro-title-scroll",
              box,
            );

            if (scrollingTitles.length === 0) return;

            gsap
              .timeline({
                scrollTrigger: {
                  trigger: box,
                  start: "top 100%",
                  end: "bottom top",
                  scrub: true,
                },
              })
              .fromTo(
                scrollingTitles,
                { xPercent: 50 },
                { xPercent: -20, ease: "power1.out" },
              );
          });

          const projects = gsap.utils.toArray<HTMLElement>("[data-metro-project]", content);

          projects.forEach((project) => {
            const thumb = project.querySelector<HTMLElement>("[data-metro-thumb]");
            if (!thumb) return;

            const isPositive = thumb.dataset.direction === "positive";
            gsap.set(thumb, {
              x: isPositive ? 400 : -400,
              rotation: isPositive ? 10 : -10,
              opacity: 0,
            });

            gsap
              .timeline({
                scrollTrigger: {
                  trigger: project,
                  start: "top 90%",
                  end: "bottom 60%",
                  scrub: 1.5,
                },
              })
              .to(
                thumb,
                {
                  x: 0,
                  rotation: 0,
                  opacity: 1,
                  ease: "power3.out",
                },
                0,
              );
          });
        });

        const revealTargets = gsap.utils.toArray<HTMLElement>(".metro-reveal", content);
        revealTargets.forEach((target) => {
          const split = new SplitText(target, {
            type: "lines,words,chars",
            linesClass: "metro-reveal-line",
          });
          splits.push(split);

          gsap.from(split.chars, {
            y: 80,
            opacity: 0,
            duration: 1.5,
            stagger: 0.02,
            delay: 0.05,
            ease: "circ.out",
            scrollTrigger: {
              trigger: target,
              start: "top 85%",
            },
          });
        });

        const invertTargets = gsap.utils.toArray<HTMLElement>(".metro-title-invert", content);
        invertTargets.forEach((target) => {
          const split = new SplitText(target, {
            type: "lines",
            linesClass: "metro-title-invert-line",
          });
          splits.push(split);

          split.lines.forEach((line) => {
            gsap.to(line, {
              backgroundPositionX: 0,
              ease: "none",
              scrollTrigger: {
                trigger: line,
                start: "top 85%",
                end: "bottom center",
                scrub: 1,
              },
            });
          });
        });

        const logoRows = gsap.utils.toArray<HTMLElement>("[data-metro-logo-row]", content);
        logoRows.forEach((row, index) => {
          const track = row.querySelector<HTMLElement>("[data-metro-logo-track]");
          if (!track) return;

          const overflowDistance = () => Math.min(0, row.offsetWidth - track.scrollWidth);
          const fromX = () => (index % 2 === 0 ? 0 : overflowDistance());
          const toX = () => (index % 2 === 0 ? overflowDistance() : 0);

          gsap.fromTo(
            track,
            { x: fromX },
            {
              x: toX,
              ease: "none",
              scrollTrigger: {
                trigger: row,
                scrub: 0.1,
                invalidateOnRefresh: true,
              },
            },
          );
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
      media?.revert();
      animationContext?.revert();
      splits.forEach((split) => split.revert());
      smoother?.kill();
    };
  }, []);

  return (
    <div id="metro-smooth-wrapper" ref={wrapperRef}>
      <div id="metro-smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
