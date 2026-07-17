"use client";

import Image from "next/image";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import styles from "./ClientTestimonialsSection.module.css";

const quote =
  "\u201cAgntix studio ability to create a high quality UI is stands out. It\u2019s something we placed a premium on. A studio with passionate, professional, fun and full creativity.\u201d";

const testimonials = [
  {
    id: 1,
    name: "Albert Juan",
    position: "CEO & Founder, Archin Studio",
    avatar: "/agntix-home/testimonial/avatars/avatar-1.png",
    tone: "white",
  },
  {
    id: 2,
    name: "Koen Chegg",
    position: "CEO & Founder, Archin Studio",
    avatar: "/agntix-home/testimonial/avatars/avatar-2.png",
    tone: "orange",
  },
  {
    id: 3,
    name: "Warren Daniel",
    position: "CEO & Founder, Archin Studio",
    avatar: "/agntix-home/testimonial/avatars/avatar-3.jpg",
    tone: "black",
  },
  {
    id: 4,
    name: "Elvin Bond",
    position: "CEO & Founder, Archin Studio",
    avatar: "/agntix-home/testimonial/avatars/avatar-4.jpg",
    tone: "white",
  },
  {
    id: 5,
    name: "Abbas",
    position: "CEO & Founder, Archin Studio",
    avatar: "/agntix-home/testimonial/avatars/avatar-5.jpg",
    tone: "gray",
  },
  {
    id: 6,
    name: "Jessamine Mumtaz",
    position: "CEO & Founder, Archin Studio",
    avatar: "/agntix-home/testimonial/avatars/avatar-6.jpg",
    tone: "orange",
  },
  {
    id: 7,
    name: "Koen Chegg",
    position: "CEO & Founder, Archin Studio",
    avatar: "/agntix-home/testimonial/avatars/avatar-2.png",
    tone: "black",
  },
] as const;

const toneClasses = {
  white: styles.whiteCard,
  orange: styles.orangeCard,
  black: styles.blackCard,
  gray: styles.grayCard,
} as const;

function StarIcon() {
  return (
    <svg width="14" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">
      <path
        d="M7 0L8.6458 4.73475L13.6574 4.83688L9.66296 7.86525L11.1145 12.6631L7 9.8L2.8855 12.6631L4.33704 7.86525L0.342604 4.83688L5.3542 4.73475L7 0Z"
        fill="#EF2B10"
      />
    </svg>
  );
}

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
                  <span>Client Reviews</span>
                </h2>
              </div>

              <div className={styles.ratingBox}>
                <div className={styles.rating}>
                  <Image
                    src="/agntix-home/testimonial/testi-logo.png"
                    alt="Clutch"
                    width={34}
                    height={38}
                    loading="eager"
                    unoptimized
                  />
                  <div className={styles.ratingInfo}>
                    <div className={styles.ratingLine}>
                      <span>4.9/5</span>
                      {Array.from({ length: 5 }, (_, index) => (
                        <i key={`rating-star-${index}`}>
                          <StarIcon />
                        </i>
                      ))}
                    </div>
                    <p>Based on 24 reviews on Clutch</p>
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
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <article className={`${styles.card} ${toneClasses[testimonial.tone]}`}>
                <div className={styles.quote}>
                  <p>{quote}</p>
                </div>
                <div className={styles.author}>
                  <div className={styles.avatar}>
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={51}
                      height={51}
                      loading="eager"
                      unoptimized
                    />
                  </div>
                  <div className={styles.authorInfo}>
                    <span>{testimonial.name}</span>
                    <p>{testimonial.position}</p>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
