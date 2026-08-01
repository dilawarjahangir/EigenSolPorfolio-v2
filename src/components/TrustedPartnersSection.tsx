"use client";

import Image from "next/image";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import styles from "./TrustedPartnersSection.module.css";

const partners = [
  { src: "/trusted-partners/1016.svg", alt: "1016 Industries" },
  { src: "/trusted-partners/entaai-logo.webp", alt: "Enta AI" },
  { src: "/trusted-partners/hmc-holdings.webp", alt: "HMC Holdings" },
  { src: "/trusted-partners/HotelsTask.webp", alt: "HotelsTask" },
  { src: "/trusted-partners/logo.svg", alt: "A2 Properties", dark: true },
  { src: "/trusted-partners/saitareward.webp", alt: "Saita Reward" },
] as const;

export default function TrustedPartnersSection() {
  return (
    <section className={styles.section} aria-labelledby="trusted-partners-title">
    
      <Swiper
        className={styles.carousel}
        modules={[Autoplay]}
        loop
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        speed={1000}
        breakpoints={{
          0: { slidesPerView: 2 },
          576: { slidesPerView: 3 },
          992: { slidesPerView: 4 },
          1400: { slidesPerView: 5 },
          1600: { slidesPerView: 6 },
        }}
      >
        {[...partners, partners[1]].map((partner, index) => (
          <SwiperSlide key={`${partner.src}-${index}`}>
            <div
              className={`${styles.partner} ${
                "dark" in partner && partner.dark ? styles.partnerDark : ""
              }`}
            >
              <div className={styles.logo}>
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  fill
                  sizes="(max-width: 575px) 50vw, (max-width: 991px) 33vw, 17vw"
                />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
