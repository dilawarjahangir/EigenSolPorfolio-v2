import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import styles from "./ServicesSection.module.css";
import ShowcaseSectionHeader from "./ShowcaseSectionHeader";

const services = [
  {
    id: 1,
    title: "Custom Software",
    href: "/services/custom-software-development",
    image: "/software-development.webp",
    description: [
      "End-to-end software solutions tailored to your unique business",
      "requirements, workflows, and long-term growth goals.",
    ],
    categories: [
      "Enterprise Applications",
      "Legacy Modernization",
      "API Development",
      "Database Design",
    ],
    categoryBreakAfter: 2,
  },
  {
    id: 2,
    title: "Web Applications",
    href: "/services/web-application-development",
    image: "/agntix-home/service/eigensol-responsive-web-applications.webp",
    description: [
      "Modern, scalable web applications built with high-performance",
      "frameworks, dependable architecture, and product thinking.",
    ],
    categories: [
      "React & Next.js",
      "Progressive Web Apps",
      "E-commerce",
      "SaaS Platforms",
    ],
    categoryBreakAfter: 1,
  },
  {
    id: 3,
    title: "Mobile Apps",
    href: "/services/mobile-app-development",
    image: "/agntix-home/service/eigensol-mobile-applications.webp",
    description: [
      "Native and cross-platform mobile solutions for iOS and Android",
      "designed for intuitive use, stability, and scale.",
    ],
    categories: ["iOS", "Android", "React Native", "Flutter"],
    categoryBreakAfter: 1,
  },
  {
    id: 4,
    title: "AI & Machine Learning",
    href: "/services/ai-machine-learning",
    image: "/agntix-home/service/eigensol-ai-chip.webp",
    description: [
      "Practical AI automation and data-driven systems that improve",
      "decisions, workflows, and customer experiences.",
    ],
    categories: ["Machine Learning", "Computer Vision", "NLP", "AI Automation"],
    categoryBreakAfter: 1,
  },
] as const;

export default function ServicesSection() {
  return (
    <section id="services" className={`${styles.serviceArea} tp-service-area`}>
      <div className={styles.headerContainer}>
        <ShowcaseSectionHeader
          subtitle={
            <>
              Our <br /> services
            </>
          }
          title="OUR SERVICES"
          ctaLabel="Explore services"
          ctaHref="/services"
        />
      </div>

      <div className={styles.containerFluid}>
        <div className="tp-service-pin">
          {services.map((service) => {
            const filterId = `buttonFilter${service.id + 1}`;

            return (
              <article
                key={service.id}
                className={`${styles.serviceItem} tp-service-panel`}
              >
                <div className={styles.row}>
                  <div className={styles.numberColumn}>
                    <div className={styles.serviceNumber}>
                      <span>0{service.id}.</span>
                    </div>
                  </div>

                  <div className={styles.contentColumn}>
                    <div className={styles.serviceContent}>
                      <h2 className={styles.serviceTitle}>
                        <Link
                          className={`${styles.textInvert} tp_text_invert`}
                          href={service.href}
                        >
                          {service.title}
                        </Link>
                      </h2>

                      <p>
                        {service.description.map((line, index) => (
                          <Fragment key={line}>
                            {line}
                            {index < service.description.length - 1 && (
                              <>
                                {" "}
                                <br className={styles.descriptionBreak} />
                              </>
                            )}
                          </Fragment>
                        ))}
                      </p>

                      <div className={styles.serviceButton}>
                        <Link className={styles.button} href={service.href}>
                          <span className={styles.buttonFilterBlur}>
                            <ButtonBlurFilter filterId={filterId} />
                          </span>
                          <span
                            className={styles.buttonFilter}
                            style={{ filter: `url(#${filterId})` }}
                          >
                            <span className={styles.buttonText}>See Our Services</span>
                            <span className={styles.buttonCircle}>
                              <ArrowOne />
                            </span>
                          </span>
                        </Link>
                      </div>

                      <div className={styles.serviceCategory}>
                        {service.categories.map((category, index) => (
                          <Fragment key={category}>
                            <span>{category}</span>
                            {index === service.categoryBreakAfter && (
                              <br className={styles.categoryBreak} />
                            )}
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.imageColumn}>
                    <div className={styles.serviceThumb}>
                      <Image
                        className={`${styles.serviceImage} tp_fade_anim`}
                        src={service.image}
                        alt={`${service.title} image`}
                        width={464}
                        height={580}
                        sizes="(min-width: 768px) 33vw, 100vw"
                        data-fade-from="right"
                        data-delay=".2"
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ButtonBlurFilter({ filterId }: { filterId: string }) {
  return (
    <svg width="0" height="0" aria-hidden="true">
      <defs>
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feColorMatrix
            in="blur"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
          />
          <feComposite in="SourceGraphic" in2={filterId} operator="atop" />
          <feBlend in="SourceGraphic" in2={filterId} />
        </filter>
      </defs>
    </svg>
  );
}

function ArrowOne() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M1 9L9 1M9 1H1M9 1V9"
        stroke="currentcolor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
