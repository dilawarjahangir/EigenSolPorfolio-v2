import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import styles from "./ServicesSection.module.css";
import ShowcaseSectionHeader from "./ShowcaseSectionHeader";

const services = [
  {
    id: 1,
    title: "Web Design",
    image: "/agntix-home/service/service-1.jpg",
    description: [
      "Whether you need stunning visuals for your website, captivating graphics",
      "for your marketing materials, or innovative UI/UX designs for your app, our",
      "team of experts is here to turn your vision into reality.",
    ],
    categories: ["UX Design", "User Testing", "Motion Design", "Product Prototype"],
    categoryBreakAfter: 2,
  },
  {
    id: 2,
    title: "Product Design",
    image: "/agntix-home/service/service-2.jpg",
    description: [
      "Our product design services focus on creating intuitive and aesthetically",
      "pleasing products that resonate with your audience and stand out",
      "in the market.",
    ],
    categories: [
      "UX Design",
      "User Testing",
      "Product Prototype",
      "Mobile UI",
      "Software UI design",
      "Web app design",
    ],
    categoryBreakAfter: null,
  },
  {
    id: 3,
    title: "Web Development",
    image: "/agntix-home/service/service-3.jpg",
    description: [
      "From website development and e-commerce platforms to custom",
      "software and mobile apps, our development team has the expertise to",
      "bring your ideas to life.",
    ],
    categories: ["UX Design", "Frontend", "Backend", "E-commerce", "No Code / Low Code"],
    categoryBreakAfter: 3,
  },
  {
    id: 4,
    title: "Branding",
    image: "/agntix-home/service/service-4.jpg",
    description: [
      "It's the core of your company's identity. It guides all business decisions,",
      "ensuring a consistent and impactful presence in the market.",
    ],
    categories: [
      "Research & Insights",
      "Unique Ways",
      "Value Proposition",
      "Naming",
      "Verbal Identity",
    ],
    categoryBreakAfter: 2,
  },
] as const;

export default function ServicesSection() {
  return (
    <section id="down" className={`${styles.serviceArea} tp-service-area`}>
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
                          href="/services"
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
                        <Link className={styles.button} href="/services">
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
