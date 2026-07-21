"use client";

import Image from "next/image";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import styles from "./AboutUsPage.module.css";

const team = [
  {
    name: "Abdullah Ahmad",
    role: "Founder & Software Engineer",
    image: "/team/abdullahPhoto.webp",
    position: "center 20%",
  },
  {
    name: "Muhammad Umer",
    role: "Co-Founder & Marketing Expert",
    image: "/team/umernew.webp",
    position: "center 18%",
  },
  {
    name: "Dilawar Jahangir",
    role: "Co-Founder & Full Stack Developer",
    image: "/team/dilawarPhoto.webp",
    position: "center 18%",
  },
  {
    name: "Muhammad Saim",
    role: "Co-Founder, AI Engineer & Researcher",
    image: "/team/saimPhoto.webp",
    position: "center 20%",
  },
  {
    name: "Abdullah Faisal",
    role: "AI Engineer",
    image: "/team/abdullahFaisalPhoto.webp",
    position: "center 15%",
  },
  {
    name: "Syed Abdul Muhaymin",
    role: "Full-Stack JavaScript Engineer",
    image: "/team/muhayminPhoto.webp",
    position: "center 18%",
  },
  {
    name: "Manan Qasim",
    role: "Financial Accountant",
    image: "/team/mannanPhoto.webp",
    position: "center 18%",
  },
] as const;

export default function AboutTeamCarousel() {
  return (
    <section className={styles.team} aria-labelledby="about-team-title">
      <div className={styles.teamHeadingWrap}>
        <h2 className={styles.teamHeading} id="about-team-title">
          Meet
          <br />
          our team
        </h2>
      </div>
      <div className={styles.teamSliderWrap}>
        <Swiper
          className={styles.teamSlider}
          modules={[Autoplay]}
          loop
          spaceBetween={30}
          speed={8000}
          autoplay={{
            delay: 1,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          allowTouchMove
          breakpoints={{
            0: { slidesPerView: 1 },
            576: { slidesPerView: 1 },
            768: { slidesPerView: 3 },
            992: { slidesPerView: 4 },
            1200: { slidesPerView: 4 },
            1400: { slidesPerView: 5 },
            1600: { slidesPerView: 5 },
          }}
        >
          {team.map((member) => (
            <SwiperSlide key={member.name}>
              <article className={styles.teamCard}>
                <Image
                  className={styles.teamImage}
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1399px) 25vw, 20vw"
                  style={{ objectPosition: member.position }}
                />
                <div className={styles.teamOverlay}>
                  <h3>{member.name}</h3>
                  <span>{member.role}</span>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
