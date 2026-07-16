"use client";

import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import styles from "./CreativeProjectsSection.module.css";
import ShowcaseSectionHeader from "./ShowcaseSectionHeader";

const projects = [
  {
    number: "01",
    title: "Simple Logistics",
    service: "Supply Chain Platform",
    image: "/agntix-home/project/project-2.jpg",
  },
  {
    number: "02",
    title: "Made Logistics",
    service: "Enterprise Solution",
    image: "/agntix-home/project/project-3.jpg",
  },
  {
    number: "03",
    title: "UX Design System",
    service: "Design Framework",
    image: "/agntix-home/project/project-4.jpg",
  },
  {
    number: "04",
    title: "Mobile Banking App",
    service: "Fintech Solution",
    image: "/agntix-home/project/project-1.jpg",
  },
] as const;

function Arrow({ width, path }: { width: number; path: string }) {
  return (
    <svg
      width={width}
      height="9"
      viewBox={`0 0 ${width} 9`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d={path} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CreativeProjectsCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const section = document.querySelector<HTMLElement>(".studio-project-area");
    const cursor = cursorRef.current;
    const cursorText = cursorTextRef.current;
    const pointerQuery = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");

    if (!section || !cursor || !cursorText || !pointerQuery.matches) return;

    const zones = Array.from(section.querySelectorAll<HTMLElement>("[data-project-cursor]"));
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const position = { ...mouse };

    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: position.x,
      y: position.y,
      width: 14,
      height: 14,
      opacity: 0,
    });
    gsap.set(cursorText, { opacity: 0, scale: 0 });

    const handlePointerMove = (event: PointerEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    const updateCursor = () => {
      position.x += (mouse.x - position.x) * 0.15;
      position.y += (mouse.y - position.y) * 0.15;
      gsap.set(cursor, { x: position.x, y: position.y });
    };

    const showCursor = () => {
      gsap.to(cursor, {
        width: 110,
        height: 110,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(cursorText, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const hideCursor = () => {
      gsap.to(cursor, {
        width: 14,
        height: 14,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(cursorText, {
        opacity: 0,
        scale: 0,
        duration: 0.2,
        ease: "power2.out",
      });
    };

    document.addEventListener("pointermove", handlePointerMove, { passive: true });
    gsap.ticker.add(updateCursor);
    zones.forEach((zone) => {
      zone.addEventListener("pointerenter", showCursor);
      zone.addEventListener("pointerleave", hideCursor);
    });

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      gsap.ticker.remove(updateCursor);
      zones.forEach((zone) => {
        zone.removeEventListener("pointerenter", showCursor);
        zone.removeEventListener("pointerleave", hideCursor);
      });
      gsap.killTweensOf([cursor, cursorText]);
    };
  }, []);

  return (
    <div ref={cursorRef} className={styles.projectCursor} aria-hidden="true">
      <span ref={cursorTextRef}>
        View
        <br />
        Demo
      </span>
    </div>
  );
}

export default function CreativeProjectsSection() {

  return (
    <section id="work" className={`${styles.area} studio-project-area`}>
        <div className={styles.container}>
          <ShowcaseSectionHeader
            subtitle={
              <>
                Our <br /> case studies
              </>
            }
            title="OUR RECENT PROJECTS"
            ctaLabel="Explore work"
            ctaHref="/case-studies"
          />

          <div className={`${styles.projectWrap} studio-project-wrap`}>
            {projects.map((project) => (
              <article className={`${styles.projectItem} studio-project-item`} key={project.number}>
                <div className={styles.row}>
                  <div className={`${styles.column} ${styles.contentColumn}`}>
                    <div className={`${styles.contentWrap} studio-project-content-wrap`}>
                      <div className={`${styles.projectNumber} studio-project-number`}>
                        <span>{project.number}</span>
                        <i>
                          <Arrow width={202} path="M198 8L201.5 4.5L198 1M1 4H201V5H1V4Z" />
                        </i>
                      </div>
                      <div className={`${styles.projectContent} studio-project-content`}>
                        <h4 className={`${styles.projectTitle} studio-project-title-sm`}>
                          <Link href="/case-studies">{project.title}</Link>
                        </h4>
                        <span>{project.service}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`${styles.column} ${styles.imageColumn}`}>
                    <div className={`${styles.cursorZone} not-hide-cursor`} data-project-cursor>
                      <Link className={`${styles.imageLink} cursor-hide`} href="/case-studies">
                        <div className={`${styles.projectThumb} studio-project-thumb`}>
                          <Image
                            className={styles.projectImage}
                            src={project.image}
                            alt={project.title}
                            width={1092}
                            height={630}
                            loading="eager"
                            unoptimized
                            sizes="(min-width: 1600px) 1090px, (min-width: 1200px) 66vw, (min-width: 768px) 930px, calc(100vw - 30px)"
                          />
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
    </section>
  );
}
