import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Compass, Layers3, RefreshCw } from "lucide-react";
import type { ServiceOffering } from "@/data/services";
import AnimatedCounter from "./AnimatedCounter";
import styles from "./ServiceDetailsPage.module.css";

const engagementModels = [
  {
    name: "Discovery Sprint",
    value: "2 weeks",
    features: [
      "Stakeholder workshops",
      "Product requirements",
      "User-flow direction",
      "Technical architecture",
      "Risk and dependency review",
      "Delivery roadmap",
    ],
  },
  {
    name: "Project Delivery",
    value: "Scoped",
    features: [
      "Product strategy",
      "UI/UX design",
      "Full-stack engineering",
      "Quality assurance",
      "Production deployment",
      "Launch support",
    ],
  },
  {
    name: "Dedicated Team",
    value: "Monthly",
    features: [
      "Dedicated specialists",
      "Sprint planning",
      "Continuous delivery",
      "DevOps and observability",
      "Product iteration",
      "Ongoing optimization",
    ],
  },
] as const;

const capabilityIcons = [Compass, Layers3, RefreshCw] as const;

type ServiceDetailsPageProps = {
  service: ServiceOffering;
};

export default function ServiceDetailsPage({ service }: ServiceDetailsPageProps) {
  return (
    <div className={styles.page}>
      <ServiceDetailsHero service={service} />
      <ServiceDetailsBanner service={service} />
      <ServiceOverview service={service} />
      <ServiceCapabilities service={service} />
      <ServiceImagePair service={service} />
      <ServiceProcess service={service} />
      <ServiceEngagements />
    </div>
  );
}

function ServiceDetailsHero({ service }: ServiceDetailsPageProps) {
  return (
    <section className={styles.hero} aria-labelledby="service-detail-title">
      <Image
        className={styles.heroShapeRight}
        src="/agntix-service-details/about-shape.png"
        alt=""
        width={163}
        height={260}
        priority
        data-speed=".8"
      />
      <Image
        className={styles.heroShapeLeft}
        src="/agntix-service-details/about-shape-2.png"
        alt=""
        width={202}
        height={400}
        priority
        data-speed="1.1"
      />

      <div className={styles.container1230}>
        <div className={styles.heroTop}>
          <div className={`${styles.heroHeading} tp_fade_anim`} data-delay=".3">
            <h1 id="service-detail-title" className={styles.heroTitle}>
              <span className={styles.heroLine}>{service.hero.lines[0]}</span>
              <span className={styles.heroLine}>{service.hero.lines[1]}</span>
              <span className={`${styles.heroLine} ${styles.heroFinalLine}`}>
                {service.hero.lines[2]}
                <span className={styles.heroBadge}>
                  {service.hero.badge}
                  <BadgeSpark />
                </span>
              </span>
              <HeroSketch />
            </h1>
          </div>

          <div className={styles.heroDescription}>
            <p>{service.hero.description}</p>
          </div>
        </div>

        <div className={styles.metrics}>
          {service.metrics.map((metric, index) => (
            <div
              className={`${styles.metric} tp_fade_anim`}
              data-delay={`.${index * 2 + 3}`}
              key={`${metric.value}-${metric.label.join("-")}`}
            >
              <strong>
                <AnimatedCounter value={metric.value} />
                {metric.suffix}
              </strong>
              <p>
                {metric.label[0]}
                <br />
                {metric.label[1]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceDetailsBanner({ service }: ServiceDetailsPageProps) {
  return (
    <section className={styles.banner} aria-label={`${service.title} visual`}>
      <Image
        src="/agntix-service-details/service-details-banner.jpg"
        alt="Creative technology concept in the EigenSol service detail"
        fill
        priority
        sizes="100vw"
        data-speed=".8"
      />
    </section>
  );
}

function ServiceOverview({ service }: ServiceDetailsPageProps) {
  return (
    <section className={styles.overview} aria-labelledby="service-overview-title">
      <div className={styles.container1230}>
        <div className={styles.overviewHeading}>
          <h2
            id="service-overview-title"
            className={`${styles.overviewTitle} tp_fade_anim`}
            data-delay=".3"
          >
            Service Overview
          </h2>
        </div>

        <div className={styles.overviewGrid}>
          <div className={styles.overviewContent}>
            <p>{service.overview.description}</p>
            <h3>{service.overview.approachTitle}</h3>
            <ul>
              {service.overview.steps.map((step) => (
                <li key={step}>
                  <span aria-hidden="true">
                    <Check />
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.overviewMedia}>
            <div className={`${styles.imageReveal} tp_img_reveal`}>
              <Image
                src="/agntix-service-details/service-details-thumb-1.jpg"
                alt={`EigenSol team planning ${service.title.toLowerCase()}`}
                width={510}
                height={562}
                loading="eager"
                sizes="(max-width: 991px) 100vw, 510px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceCapabilities({ service }: ServiceDetailsPageProps) {
  return (
    <section className={styles.capabilities} aria-label={`${service.title} capabilities`}>
      <div className={styles.container1230}>
        <div className={styles.capabilityGrid}>
          {service.capabilities.map((capability, index) => {
            const Icon = capabilityIcons[index];

            return (
              <article
                className={`${styles.capabilityCard} tp_fade_anim`}
                data-delay={`.${index * 2 + 3}`}
                key={capability.title}
              >
                <div className={styles.capabilityIcon}>
                  <Icon aria-hidden="true" strokeWidth={1.25} />
                </div>
                <div className={styles.capabilityContent}>
                  <h3>
                    <Link href="/contact">{capability.title}</Link>
                  </h3>
                  <ul>
                    {capability.categories.map((category) => (
                      <li key={category}>+ {category}</li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ServiceImagePair({ service }: ServiceDetailsPageProps) {
  return (
    <section className={styles.imagePair} aria-label={`${service.title} collaboration`}>
      <div className={styles.container1430}>
        <div className={styles.imagePairGrid}>
          <div className={styles.imagePairItem}>
            <div className={`${styles.imageReveal} tp_img_reveal`}>
              <Image
                src="/agntix-service-details/service-details-thumb-2.jpg"
                alt={`EigenSol specialists delivering ${service.title.toLowerCase()}`}
                width={674}
                height={450}
                loading="eager"
                sizes="(max-width: 991px) 100vw, 50vw"
              />
            </div>
          </div>
          <div className={styles.imagePairItem}>
            <div className={`${styles.imageReveal} tp_img_reveal`}>
              <Image
                src="/agntix-service-details/service-details-thumb-3.jpg"
                alt={`Collaborative review for ${service.title.toLowerCase()}`}
                width={674}
                height={450}
                loading="eager"
                sizes="(max-width: 991px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceProcess({ service }: ServiceDetailsPageProps) {
  return (
    <section className={styles.process} aria-labelledby="service-process-title">
      <div className={styles.container1350}>
        <div className={`${styles.processHeading} tp_fade_anim`} data-delay=".3">
          <span className={styles.processSubtitle}>
            <span aria-hidden="true" />
            Working Process
          </span>
          <h2 id="service-process-title" className={styles.processTitle}>
            {service.process.title[0]}
            <br />
            {service.process.title[1]}
          </h2>
        </div>

        <div className={`${styles.processBox} tp_fade_anim`} data-delay=".5">
          <div className={styles.processGrid}>
            {service.process.steps.map((step) => (
              <article className={styles.processItem} key={step.number}>
                <span className={styles.processNumber}>{step.number}</span>
                <h3>
                  {step.title[0]}
                  <br />
                  {step.title[1]}
                </h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className={styles.processCta}>
          <span>
            Don&apos;t hesitate to collaborate with expertise -
            <Link href="/contact">
              <ArrowRight aria-hidden="true" />
              Let&apos;s Talk
            </Link>
          </span>
        </div>
      </div>
    </section>
  );
}

function ServiceEngagements() {
  return (
    <section className={styles.engagements} aria-labelledby="engagement-plans-title">
      <div className={styles.container1230}>
        <div className={`${styles.engagementHeading} tp_fade_anim`}>
          <div className={styles.engagementEyebrow}>
            <span aria-hidden="true" />
            <strong>Engagement plans</strong>
            <ArrowRight aria-hidden="true" />
          </div>
          <h2 id="engagement-plans-title">
            Flexible
            <br />
            engagement plans
          </h2>
        </div>

        <div className={styles.engagementRows}>
          {engagementModels.map((model) => (
            <article className={`${styles.engagementRow} tp_fade_anim`} key={model.name}>
              <h3>{model.name}</h3>
              <ul>
                {model.features.map((feature) => (
                  <li key={feature}>
                    <Check aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <strong>{model.value}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroSketch() {
  return (
    <svg className={styles.heroSketch} viewBox="0 0 123 130" aria-hidden="true">
      <path d="M58.28 1.154c5.022 13.148 12.769 53.199-10.172 65.943-11.925 6.331-36.397 10.209-45.73-23.162-3.521-12.588 7.238-23.044 29.711-15.096 12.966 4.587 44.331 15.208 58.49 41.238 7.472 13.738 13.587 41.763 8.596 59.594m0 0c1.767-8.657 8.953-25.176 23.562-21.998m-23.562 21.998c1.006-5.693-2.123-19.657-22.69-29.973M75.364 33.243c5.115 2.426 21.28 13.231 26.446 31.046" />
    </svg>
  );
}

function BadgeSpark() {
  return (
    <svg viewBox="0 0 22 21" aria-hidden="true">
      <path d="M1.95 15.964c-1.6-.377-1.778-2.484-.264-3.139l.245-.106c4.713-2.036 8.352-5.96 10.029-10.813.521-1.509 2.731-1.56 3.291-.076l6.019 15.983c.107.283.132.591.07.89a1.72 1.72 0 0 1-.42.802 1.76 1.76 0 0 1-.79.485 1.84 1.84 0 0 1-.932.028L1.95 15.964Z" />
    </svg>
  );
}
