"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AppWindow,
  ArrowUpRight,
  BrainCircuit,
  Check,
  CloudCog,
  Code2,
  Palette,
  Play,
  Smartphone,
  X,
  type LucideIcon,
} from "lucide-react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useRef, useState } from "react";
import { serviceOfferings, type ServiceSlug } from "@/data/services";
import styles from "./ServiceFourPage.module.css";

type Service = {
  slug: ServiceSlug;
  title: string;
  lines: readonly string[];
  description: string;
  icon: LucideIcon;
};

const serviceIcons: Record<ServiceSlug, LucideIcon> = {
  "custom-software-development": Code2,
  "web-application-development": AppWindow,
  "mobile-app-development": Smartphone,
  "ui-ux-design-systems": Palette,
  "cloud-devops": CloudCog,
  "ai-machine-learning": BrainCircuit,
};

const services: readonly Service[] = serviceOfferings.map((service) => ({
  slug: service.slug,
  title: service.title,
  lines: service.lines,
  description: service.shortDescription,
  icon: serviceIcons[service.slug],
}));

const marqueeItems = [
  "Custom software",
  "Web applications",
  "Mobile products",
  "Product strategy",
  "API integrations",
  "UI/UX systems",
  "Cloud & DevOps",
  "AI engineering",
  "Quality engineering",
  "Data platforms",
  "Discovery sprints",
  "Dedicated teams",
] as const;

const engagementModels = [
  {
    name: "Discovery Sprint",
    value: "2 weeks",
    suffix: "focused",
    description: "Validate the opportunity and define a reliable delivery path.",
    features: [
      "Stakeholder workshops",
      "Product requirements",
      "UX direction",
      "Technical architecture",
      "Delivery roadmap",
    ],
    active: false,
  },
  {
    name: "Project Delivery",
    value: "Scoped",
    suffix: "milestones",
    description: "One accountable team from product definition through launch.",
    features: [
      "Product strategy",
      "UI/UX design",
      "Full-stack development",
      "Quality engineering",
      "Launch support",
    ],
    active: true,
  },
  {
    name: "Dedicated Team",
    value: "Monthly",
    suffix: "capacity",
    description: "Flexible long-term engineering capacity for evolving products.",
    features: [
      "Dedicated specialists",
      "Sprint planning",
      "Continuous delivery",
      "DevOps and observability",
      "Ongoing optimization",
    ],
    active: false,
  },
] as const;

const processSteps = [
  ["01", "Discovery &", "research"],
  ["02", "Strategy &", "architecture"],
  ["03", "Design &", "prototyping"],
  ["04", "Build, launch &", "improve"],
] as const;

const partners = [
  { src: "/trusted-partners/1016.svg", alt: "1016 Industries" },
  { src: "/trusted-partners/entaai-logo.webp", alt: "Enta AI" },
  { src: "/trusted-partners/hmc-holdings.webp", alt: "HMC Holdings" },
  { src: "/trusted-partners/HotelsTask.webp", alt: "HotelsTask" },
  { src: "/trusted-partners/logo.svg", alt: "A2 Properties", dark: true },
  { src: "/trusted-partners/saitareward.webp", alt: "Saita Reward" },
] as const;

export default function ServiceFourPage() {
  return (
    <div className={styles.page}>
      <ServiceHero />
      <ServiceBanner />
      <SmartSolutions />

      <div className={styles.roundedSurface}>
        <InteractiveServices />
        <CapabilityMarquees />
        <EngagementModels />
      </div>

      <WorkingProcess />
      <PartnerCarousel />
    </div>
  );
}

function ServiceHero() {
  return (
    <section className={styles.hero} aria-labelledby="service-page-title">
      <div className={styles.heroGlow} aria-hidden="true">
        <Image
          src="/agntix-service-4/service-4-bg.png"
          alt=""
          width={782}
          height={1092}
          priority
        />
      </div>

      <div className={styles.heroArrow} aria-hidden="true">
        <svg viewBox="0 0 84 84">
          <path d="M36.376 0.599c3.93 8.387 10.948 34.299-3.494 43.77-7.521 4.731-23.395 8.457-31.131-12.994-2.918-8.092 3.639-15.474 18.772-11.342 8.731 2.384 29.829 7.841 40.377 24.242 5.567 8.656 10.933 26.754 8.518 38.697m0 0c.742-5.767 4.661-16.955 14.402-15.574M69.418 82.972c.385-3.785-2.342-12.798-16.338-18.576M49.137 20.835c3.474 1.345 14.605 7.656 18.855 19.099" />
        </svg>
      </div>

      <div className={styles.container1320}>
        <div className={styles.heroGrid}>
          <div
            className={`${styles.heroTitleWrap} service4-fade`}
            data-delay=".3"
          >
            <h1 id="service-page-title" className={styles.heroTitle}>
              Full-Stack Software
              <br />
              {" "}Development Expertise
            </h1>
          </div>
          <div className={`${styles.heroCopy} service4-fade`} data-delay=".5">
            <p>
              From initial concept to final deployment, we provide end-to-end software development
              services that transform your vision into reality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceBanner() {
  return (
    <section className={styles.banner} aria-label="EigenSol services overview">
      <div className={styles.container1320}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-current="page">Services</span>
        </nav>
      </div>
      <div className={styles.bannerImage}>
        <Image
          src="/agntix-service-4/service-4-banner.jpg"
          alt="A product team collaborating in a bright studio"
          width={1976}
          height={1319}
          sizes="100vw"
          priority
          data-speed=".8"
        />
      </div>
    </section>
  );
}

function SmartSolutions() {
  return (
    <section className={styles.solutions} aria-labelledby="smart-solutions-title">
      <div className={styles.container1320}>
        <div className={styles.solutionsHeader}>
          <div>
            <p className={`${styles.pillLabel} service4-fade`}>
              <span aria-hidden="true" />
              Our Smart Solutions
            </p>
          </div>
          <div className={`${styles.solutionsHeadingWrap} service4-fade`}>
            <h2 id="smart-solutions-title" className={styles.solutionsTitle}>
              Tailored engineering across software, web, mobile, design, cloud, and artificial
              intelligence.
            </h2>
          </div>
        </div>

        <Swiper
          className={styles.solutionSwiper}
          modules={[Pagination]}
          loop={false}
          autoplay={false}
          spaceBetween={30}
          pagination={{ clickable: true }}
          breakpoints={{
            0: { slidesPerView: 1 },
            576: { slidesPerView: 1 },
            768: { slidesPerView: 1.5 },
            992: { slidesPerView: 2 },
            1200: { slidesPerView: 2 },
            1400: { slidesPerView: 3 },
            1600: { slidesPerView: 3 },
          }}
        >
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <SwiperSlide key={service.title}>
                <article className={styles.solutionCard}>
                  <div className={styles.solutionIcon}>
                    <Icon aria-hidden="true" strokeWidth={1.25} />
                  </div>
                  <div className={styles.solutionCardContent}>
                    <h3>
                      <Link
                        className={styles.underlineLink}
                        href={`/services/${service.slug}`}
                      >
                        {service.title}
                      </Link>
                    </h3>
                    <p>{service.description}</p>
                  </div>
                  <Link className={styles.cardLink} href={`/services/${service.slug}`}>
                    View details
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}

function InteractiveServices() {
  return (
    <section className={styles.serviceRowsSection} aria-labelledby="service-capabilities-title">
      <div className={styles.container1230}>
        <div className={styles.serviceRowsHeading}>
          <p className="service4-fade" data-delay=".3">
            Services
          </p>
          <h2 id="service-capabilities-title" className="service4-fade" data-delay=".5">
            Building reliable products through exceptional{" "}
            <span>
              services
              <TitleUnderline />
            </span>
          </h2>
        </div>

        <div className={styles.serviceRows}>
          {services.map((service, index) => (
            <article className={`${styles.serviceRow} service4-fade`} key={service.title}>
              <Image
                className={styles.serviceRowBackground}
                src="/agntix-service-4/service-hover.jpg"
                alt=""
                fill
                sizes="(max-width: 1230px) 100vw, 1230px"
              />
              <div className={styles.serviceRowInner}>
                <div className={styles.serviceRowIdentity}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>
                    <Link href={`/services/${service.slug}`}>
                      {service.lines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </Link>
                  </h3>
                </div>
                <div className={styles.serviceRowSummary}>
                  <p>{service.description}</p>
                  <Link
                    className={styles.roundArrow}
                    href={`/services/${service.slug}`}
                    aria-label={`View ${service.title}`}
                  >
                    <span>
                      <ArrowUpRight aria-hidden="true" />
                      <ArrowUpRight aria-hidden="true" />
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilityMarquees() {
  return (
    <section className={styles.marqueeArea} aria-label="EigenSol capabilities">
      <MarqueeRow items={marqueeItems} />
      <MarqueeRow items={marqueeItems} reverse />
    </section>
  );
}

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: readonly string[];
  reverse?: boolean;
}) {
  return (
    <div className={`${styles.marqueeRow} ${reverse ? styles.marqueeRowReverse : ""}`}>
      <div className={styles.marqueeTrack}>
        {[0, 1].map((copy) => (
          <div className={styles.marqueeSet} aria-hidden={copy === 1} key={copy}>
            {items.map((item) => (
              <span className={styles.marqueeItem} key={`${copy}-${item}`}>
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function EngagementModels() {
  return (
    <section className={styles.engagements} aria-labelledby="engagement-models-title">
      <div className={styles.priceShape} aria-hidden="true">
        <Image
          src="/agntix-service-4/service-4-price-shape.png"
          alt=""
          width={920}
          height={753}
        />
      </div>
      <div className={styles.container1230}>
        <div className={styles.centeredHeading}>
          <p className="service4-fade" data-delay=".3">
            Flexible engagement
          </p>
          <h2 id="engagement-models-title" className="service4-fade" data-delay=".5">
            Choose the right way
            <br />
            to build with us
          </h2>
        </div>

        <div className={styles.engagementGrid}>
          {engagementModels.map((model) => (
            <article
              className={`${styles.engagementCard} ${
                model.active ? styles.engagementCardActive : ""
              }`}
              key={model.name}
            >
              <div className={styles.engagementHead}>
                <span className={styles.engagementName}>{model.name}</span>
                <h3>
                  {model.value} <i>/ {model.suffix}</i>
                </h3>
                <p>{model.description}</p>
              </div>
              <ul className={styles.engagementFeatures}>
                {model.features.map((feature) => (
                  <li key={feature}>
                    <span>
                      <Check aria-hidden="true" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link className={styles.engagementButton} href="/contact">
                Start a conversation
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkingProcess() {
  return (
    <section className={styles.process} aria-labelledby="working-process-title">
      <div className={styles.container1230}>
        <div className={styles.processHeading}>
          <p className="service4-fade" data-delay=".3">
            Process
          </p>
          <h2 id="working-process-title" className="service4-fade" data-delay=".5">
            A proven methodology
            <br />
            {" "}for a clear{" "}
            <span>
              working
              <TitleUnderline />
            </span>
            <br />
            {" "}delivery process
          </h2>
        </div>

        <div className={styles.processGrid}>
          <div className={styles.processList}>
            {processSteps.map(([number, firstLine, secondLine]) => (
              <div className={styles.processStep} key={number}>
                <span>{number}</span>
                <p>
                  {firstLine}
                  <br />
                  {secondLine}
                </p>
              </div>
            ))}
          </div>

          <div className={styles.processMedia}>
            <p className={styles.processCopy}>
              From discovery and strategy through design, development, testing, and launch, we
              deliver incremental value and keep every decision connected to your goals.
            </p>
            <div className={styles.processImageFrame}>
              <div className="service4-image-reveal">
                <Image
                  src="/agntix-service-4/service-4-thumb-1.png"
                  alt="A collaborative product team reviewing work"
                  width={715}
                  height={520}
                  sizes="(max-width: 991px) 100vw, 715px"
                />
              </div>
            </div>
            <ServiceVideoButton />
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceVideoButton() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      void videoRef.current?.play().catch(() => undefined);
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const close = () => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setOpen(false);
  };

  return (
    <>
      <button
        className={styles.processVideoButton}
        type="button"
        aria-label="Play EigenSol showreel"
        onClick={() => setOpen(true)}
      >
        <Play aria-hidden="true" fill="currentColor" />
      </button>

      <dialog
        className={styles.videoDialog}
        ref={dialogRef}
        aria-label="EigenSol showreel"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <div className={styles.videoDialogInner}>
          <button
            className={styles.videoDialogClose}
            type="button"
            aria-label="Close video"
            onClick={close}
          >
            <X aria-hidden="true" />
          </button>
          <video ref={videoRef} controls playsInline preload="metadata">
            <source src="https://html.aqlova.com/videos/liko/liko.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </dialog>
    </>
  );
}

function PartnerCarousel() {
  return (
    <section className={styles.partners} aria-label="Trusted partners">
      <Swiper
        className={styles.partnerSwiper}
        modules={[Autoplay]}
        loop
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        spaceBetween={0}
        speed={1000}
        breakpoints={{
          0: { slidesPerView: 2 },
          576: { slidesPerView: 3 },
          768: { slidesPerView: 3 },
          992: { slidesPerView: 4 },
          1200: { slidesPerView: 4 },
          1400: { slidesPerView: 5 },
          1600: { slidesPerView: 6 },
        }}
      >
        {[...partners, partners[1]].map((partner, index) => (
          <SwiperSlide key={`${partner.src}-${index}`}>
            <div
              className={`${styles.partnerItem} ${
                "dark" in partner && partner.dark ? styles.partnerItemDark : ""
              }`}
            >
              <div className={styles.partnerLogo}>
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  fill
                  loading="eager"
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

function TitleUnderline() {
  return (
    <svg className={styles.titleUnderline} viewBox="0 0 216 11" aria-hidden="true">
      <path d="M2 8.7C49.3 3.4 126.7.2 214 3.4" />
    </svg>
  );
}
