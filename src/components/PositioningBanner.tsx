"use client";

import { useLayoutEffect, useRef } from "react";
import { motion, useInView } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import CountUpNumber from "./ui/CountUpNumber";

const backgroundImage = "/positioning-banner/background.webp";
const stats = [
  { value: 10, label: "Years of Excellence" },
  { value: 120, label: "Projects Delivered" },
  { value: 40, label: "Product Experts" },
];

export default function PositioningBanner() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(section, {
        clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 100%)",
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section,
        { clipPath: "polygon(30% 0, 70% 0, 70% 100%, 30% 100%)" },
        {
          clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 100%)",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            scrub: 2,
            start: "top 80%",
            end: "top 60%",
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const renderStatCard = (stat: (typeof stats)[number]) => (
    <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
      <div className="mb-2 font-mono text-4xl font-bold text-white">
        <CountUpNumber end={stat.value} suffix="+" start={isInView} />
      </div>
      <div className="text-white/70">{stat.label}</div>
    </div>
  );

  return (
    <section
      id="solutions"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#101114] bg-cover bg-center bg-no-repeat py-32"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-[#101114]/45" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8 inline-block rounded-full bg-white/5 px-4 py-2 backdrop-blur-sm">
              <span className="font-mono text-sm text-white/70">OUR APPROACH</span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 text-4xl leading-tight font-bold text-white md:text-6xl"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              letterSpacing: "-0.02em",
            }}
          >
            We turn business ideas into reliable digital products
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto max-w-3xl text-lg leading-relaxed text-white/70 md:text-xl"
          >
            As your long-term technology partner, we combine product engineering
            excellence with business acumen. From MVPs to enterprise systems, we build
            software that performs, scales, and drives real outcomes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12"
          >
            <div className="md:hidden">
              <Swiper
                modules={[Pagination]}
                slidesPerView={1.12}
                spaceBetween={16}
                pagination={{ clickable: true }}
                className="positioning-banner-swiper pb-12"
              >
                {stats.map((stat) => (
                  <SwiperSlide key={stat.label} className="h-auto">
                    {renderStatCard(stat)}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="hidden gap-8 md:grid md:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label}>{renderStatCard(stat)}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
