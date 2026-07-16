"use client";

import imagesLoaded from "imagesloaded";
import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useLayoutEffect, useRef, type ReactNode } from "react";

type HomePageExperienceProps = {
  children: ReactNode;
};

export default function HomePageExperience({ children }: HomePageExperienceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;

    if (!wrapper || !content) return;

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
    gsap.config({ nullTargetWarn: false });

    ScrollSmoother.get()?.kill();

    const smoother = ScrollSmoother.create({
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
    let titleSplit: SplitText | null = null;
    let initialized = false;

    const initializeAnimations = () => {
      if (initialized) return;
      initialized = true;

      animationContext = gsap.context(() => {
        media = gsap.matchMedia();

        media.add("(min-width: 1199px)", () => {
          const videoArea = content.querySelector<HTMLElement>(".tp-video-area");
          const videoThumbWrap = content.querySelector<HTMLElement>(".tp-video-thumb-wrap");

          if (videoArea && videoThumbWrap) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: videoArea,
                  scrub: 1,
                  pin: true,
                  start: "top 40px",
                  end: "+=100%",
                },
              })
              .to(videoThumbWrap, {
                scale: 3.2,
                ease: "none",
              });
          }

          const panels = gsap.utils.toArray<HTMLElement>(".tp-service-panel", content);
          const servicePin = content.querySelector<HTMLElement>(".tp-service-pin");

          if (servicePin) {
            panels.forEach((panel, index) => {
              gsap.to(panel, {
                scrollTrigger: {
                  trigger: panel,
                  pin: panel,
                  scrub: 1,
                  start: `top ${150 + index * 120}px`,
                  end: "bottom 120%",
                  endTrigger: servicePin,
                  pinSpacing: false,
                  markers: false,
                },
              });
            });
          }
        });

        media.add("(min-width: 767px)", () => {
          const projectThumbs = gsap.utils.toArray<HTMLImageElement>(".studio-project-thumb img", content);
          const projectFrames = gsap.utils.toArray<HTMLElement>(".studio-project-thumb", content);

          if (projectThumbs.length > 0) {
            gsap.set(projectFrames, { perspective: 60 });

            projectThumbs.forEach((image) => {
              gsap.fromTo(
                image,
                { rotationX: 1.8, z: "0vh" },
                {
                  rotationX: -0.5,
                  z: "-2vh",
                  scrollTrigger: {
                    trigger: image,
                    start: "top+=150px bottom",
                    end: "bottom top",
                    immediateRender: false,
                    scrub: 0.1,
                  },
                },
              );
            });
          }
        });

        const invertTargets = gsap.utils.toArray<HTMLElement>(".tp_text_invert", content);

        if (invertTargets.length > 0) {
          titleSplit = new SplitText(invertTargets, { type: "lines" });
          titleSplit.lines.forEach((line) => {
            gsap.to(line, {
              backgroundPositionX: 0,
              ease: "none",
              scrollTrigger: {
                trigger: line,
                scrub: 1,
                start: "top 85%",
                end: "bottom center",
              },
            });
          });
        }

        const fadeItems = gsap.utils.toArray<HTMLElement>(".tp_fade_anim", content);

        fadeItems.forEach((item) => {
          const offset = item.dataset.fadeOffset ? Number.parseInt(item.dataset.fadeOffset, 10) : 40;
          const duration = item.dataset.duration ? Number.parseFloat(item.dataset.duration) : 0.75;
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
      media?.revert();
      animationContext?.revert();
      titleSplit?.revert();
      smoother.kill();
    };
  }, []);

  return (
    <div id="smooth-wrapper" ref={wrapperRef}>
      <div id="smooth-content" ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
