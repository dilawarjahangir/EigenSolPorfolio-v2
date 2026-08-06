"use client";

import Image from "next/image";
import Link from "next/link";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import styles from "./ClientTestimonialsSection.module.css";

const projectProofs = [
  {
    id: "hmc-holding",
    summary:
      "A multi-page advisory platform connecting service discovery, calculators, gated project access, SEO content, and structured inquiry workflows.",
    project: "HMC Holding",
    client: "HMC Holding · UAE business advisory",
    image: "/projects/hmc-holding/Screenshot 2026-03-18 201158.webp",
    href: "/case-studies/hmc-holding",
    tone: "white",
  },
  {
    id: "a2prop",
    summary:
      "A full-stack Dubai real-estate platform combining live inventory, multilingual content, CRM-connected lead capture, and premium property discovery.",
    project: "A2 Properties",
    client: "A2 Properties · Dubai real estate",
    image: "/projects/a2properties/A2-prop-cover.webp",
    href: "/case-studies/a2prop",
    tone: "orange",
  },
  {
    id: "eigenmc",
    summary:
      "A production motor-carrier intelligence SaaS with large-scale FMCSA data ingestion, advanced search, lead workflows, exports, quotas, and administration.",
    project: "EigenMC",
    client: "EigenSol product · Logistics intelligence",
    image: "/projects/eigenmc/1.webp",
    href: "/case-studies/eigenmc",
    tone: "black",
  },
  {
    id: "1016-visualizer",
    summary:
      "An interactive automotive parts visualizer and dealer-ordering system using vehicle imagery, SVG highlights, material options, invoices, and catalog workflows.",
    project: "1016 Visualizer",
    client: "1016 Industries · Automotive",
    image: "/projects/1016/Screenshot 2026-03-18 193425.webp",
    href: "/case-studies/1016-visualizer",
    tone: "white",
  },
  {
    id: "sleep-tracking",
    summary:
      "A mobile-first sleep-wellness platform connecting overnight audio capture, event detection, analytics, protected media, subscriptions, and admin operations.",
    project: "ExceedSleep",
    client: "Confidential client · Sleep wellness",
    image: "/projects/sleep-tracking/sleep-tracking-cover.webp",
    href: "/case-studies/sleep-tracking",
    tone: "gray",
  },
  {
    id: "zainather",
    summary:
      "A consultation-first medical website with structured patient contact flows, professional CV access, practical care tools, SEO, and custom-domain deployment.",
    project: "zainather.com",
    client: "Dr. Zain Ather · Medical services",
    image: "/projects/zainather/1.webp",
    href: "/case-studies/zainather",
    tone: "orange",
  },
] as const;

const toneClasses = {
  white: styles.whiteCard,
  orange: styles.orangeCard,
  black: styles.blackCard,
  gray: styles.grayCard,
} as const;

export default function ClientTestimonialsSection() {
  return (
    <section className={`${styles.area} tp-testimonial-area`} aria-labelledby="reviews-heading">
      <div className={styles.globeLayer} aria-hidden="true">
        <Image
          className={styles.globe}
          src="/agntix-home/testimonial/global.png"
          alt=""
          width={1000}
          height={921}
          loading="eager"
          unoptimized
        />
        <Image
          className={styles.globeOverlay}
          src="/agntix-home/testimonial/overlay.png"
          alt=""
          width={1000}
          height={921}
          loading="eager"
          unoptimized
        />
      </div>

      <div className={styles.container}>
        <div className={`${styles.row} ${styles.centeredRow}`}>
          <div className={`${styles.column} ${styles.headingColumn}`}>
            <div className={styles.titleWrap}>
              <div className={styles.titleBox}>
                <h2 id="reviews-heading" className={styles.title}>
                  <span>Proven Work</span>
                </h2>
              </div>

              <div className={styles.ratingBox}>
                <div className={styles.rating}>
                  <Image
                    src="/only-logo.svg"
                    alt="EigenSol"
                    width={34}
                    height={38}
                    loading="eager"
                    unoptimized
                  />
                  <div className={styles.ratingInfo}>
                    <div className={styles.ratingLine}>
                      <span>Selected delivery</span>
                    </div>
                    <p>Six documented products and case studies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sliderWrap}>
        <Swiper
          className={`${styles.slider} tp-testimonial-slider-active`}
          modules={[Autoplay]}
          loop
          autoplay={false}
          spaceBetween={0}
          speed={1000}
          a11y={{ enabled: false }}
          breakpoints={{
            1600: { slidesPerView: 6 },
            1400: { slidesPerView: 5 },
            1200: { slidesPerView: 4 },
            992: { slidesPerView: 4 },
            768: { slidesPerView: 3 },
            576: { slidesPerView: 1 },
            0: { slidesPerView: 1 },
          }}
        >
          {projectProofs.map((project) => (
            <SwiperSlide key={project.id}>
              <article className={`${styles.card} ${toneClasses[project.tone]}`}>
                <div className={styles.quote}>
                  <p>{project.summary}</p>
                </div>
                <div className={styles.author}>
                  <div className={styles.avatar}>
                    <Image
                      src={project.image}
                      alt={`${project.project} project`}
                      width={51}
                      height={51}
                      loading="eager"
                    />
                  </div>
                  <div className={styles.authorInfo}>
                    <span>{project.project}</span>
                    <p>{project.client}</p>
                  </div>
                </div>
                <Link className={styles.projectLink} href={project.href}>
                  View case study
                </Link>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
