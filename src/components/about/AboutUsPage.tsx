import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import FunFactsSection from "@/components/FunFactsSection";
import CountUpNumber from "@/components/ui/CountUpNumber";
import AboutTeamCarousel from "./AboutTeamCarousel";
import SelectedWorkRail from "./SelectedWorkRail";
import styles from "./AboutUsPage.module.css";

const capabilities = [
  {
    number: "01",
    title: "Engineering",
    href: "/services/custom-software-development",
    categories: [
      "Custom Software",
      "Web Apps",
      "Mobile Apps",
      "API Integrations",
      "Quality Engineering",
    ],
  },
  {
    number: "02",
    title: "Intelligence",
    href: "/services/ui-ux-design-systems",
    categories: [
      "UI/UX Systems",
      "AI & ML",
      "Computer Vision",
      "NLP",
      "Data",
    ],
  },
  {
    number: "03",
    title: "Cloud & Scale",
    href: "/services/cloud-devops",
    categories: [
      "Cloud",
      "DevOps",
      "Security",
      "Observability",
      "Performance",
    ],
  },
] as const;

const processSteps = [
  {
    number: "01",
    title: "Discovery & Strategy",
    description:
      "We dive deep into your business goals, target audience, and technical requirements.",
  },
  {
    number: "02",
    title: "Design & Prototyping",
    description:
      "We create intuitive user experiences with wireframes, prototypes, and high-fidelity designs.",
  },
  {
    number: "03",
    title: "Development",
    description:
      "We build robust, scalable solutions using modern technologies and proven practices.",
  },
  {
    number: "04",
    title: "Testing & Quality",
    description:
      "Rigorous testing protects quality, performance, and security across every platform.",
  },
] as const;

export default function AboutUsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="about-title">
        <Image
          className={styles.heroShape}
          src="/agntix-about-us/about-us-shape.png"
          alt=""
          width={65}
          height={65}
          aria-hidden="true"
          priority
        />
        <div className={styles.heroContainer}>
          <div className={styles.heroInner}>
            <div className={`${styles.heroContent} tp_fade_anim`} data-delay=".3">
              <h1 className={styles.heroTitle} id="about-title">
                Building the Future,
                <br />
                One Product at a Time
              </h1>
              <div className={styles.heroMeta}>
                <span className={styles.eyebrow}>About EigenSol</span>
                <ArrowLine />
                <p>
                  We&apos;re a team of designers, developers, and strategists passionate about
                  creating exceptional digital experiences that drive real business results.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.marquee} aria-label="About EigenSol">
        <div className={styles.marqueeTrack} aria-hidden="true">
          {Array.from({ length: 8 }, (_, index) => (
            <span key={index}>About EigenSol</span>
          ))}
        </div>
      </section>

      <section className={styles.banner} aria-label="EigenSol collaboration">
        <Image
          className={styles.bannerImage}
          src="/agntix-about-us/about-us-banner.jpg"
          alt="A product team collaborating in a studio"
          width={1920}
          height={960}
          sizes="100vw"
          data-speed=".8"
          priority
        />
      </section>

      <section className={styles.intro}>
        <div className={styles.standardContainer}>
          <div className={`${styles.introBox} about-bounce-trigger`}>
            <Image
              className={styles.rotatingShape}
              src="/agntix-about-us/about-rotating-shape.png"
              alt=""
              width={144}
              height={144}
              aria-hidden="true"
            />
            <div className={styles.introGrid}>
              <div>
                <span className={`${styles.sectionEyebrow} tp_fade_anim`}>Who we are</span>
              </div>
              <div className={styles.introContent}>
                <div className={`${styles.introStatement} tp_fade_anim`}>
                  We build resilient software, smarter workflows, and digital products that scale
                  with your business.
                </div>
                <div className={styles.introLower}>
                  <div className={styles.introImageWrap}>
                    <Image
                      className={styles.introImage}
                      src="/agntix-about-us/about-intro.jpg"
                      alt="Creative professional representing the EigenSol team"
                      width={306}
                      height={718}
                      sizes="(max-width: 767px) 100vw, 315px"
                      data-speed=".8"
                      style={{ width: "100%", height: "auto" }}
                    />
                  </div>
                  <div className={styles.introFacts}>
                    <div className={styles.avatarInfo}>
                      <Image
                        className="tp_fade_anim"
                        data-delay=".3"
                        data-fade-from="right"
                        src="/agntix-about-us/about-avatars.png"
                        alt=""
                        width={140}
                        height={54}
                        aria-hidden="true"
                      />
                      <p>
                        One multidisciplinary team for product strategy, design, engineering,
                        artificial intelligence, and long-term support.
                      </p>
                    </div>
                    <div className={styles.counterGrid}>
                      <div className={`${styles.counter} tp_fade_anim`} data-delay=".3">
                        <strong>
                          <CountUpNumber end={98} suffix="%" duration={1800} />
                        </strong>
                        <span>Client satisfaction and repeat work</span>
                      </div>
                      <div className={`${styles.counter} tp_fade_anim`} data-delay=".5">
                        <strong>
                          <CountUpNumber end={150} suffix="+" duration={1800} />
                        </strong>
                        <span>Products and projects delivered</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.services} aria-labelledby="about-services-title">
        <div className={styles.wideContainer}>
          <div className={styles.servicesTop}>
            <div>
              <span className={styles.dotEyebrow}>Our Services</span>
            </div>
            <div>
              <h2 className={styles.servicesHeading} id="about-services-title">
                How we take your
                <br />
                business to the next level
              </h2>
            </div>
            <div className={styles.servicesSummary}>
              <p>
                We turn ambitious ideas into reliable digital products with one accountable team
                from strategy through launch.
              </p>
              <Link className={styles.orangeButton} href="/services">
                <span>Explore services</span>
                <span className={styles.orangeButtonIcon}>
                  <ArrowUpRight aria-hidden="true" size={16} />
                </span>
              </Link>
            </div>
          </div>

          <div className={styles.capabilityList}>
            {capabilities.map((capability) => (
              <article className={`${styles.capability} tp_fade_anim`} key={capability.title}>
                <div className={styles.capabilityContent}>
                  <span className={styles.capabilityNumber}>({capability.number})</span>
                  <div>
                    <h3 className={styles.capabilityTitle}>
                      <Link href={capability.href}>{capability.title}</Link>
                    </h3>
                    <div className={styles.capabilityCategories}>
                      {capability.categories.map((category) => (
                        <span key={category}>{category}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <Link
                  className={styles.capabilityLink}
                  href={capability.href}
                  aria-label={`Explore ${capability.title}`}
                >
                  <ArrowUpRight aria-hidden="true" size={18} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FunFactsSection />

      <section
        className={`${styles.process} about-panel-pin-area`}
        aria-labelledby="about-process-title"
      >
        <div className={styles.standardContainer}>
          <div className={styles.processGrid}>
            <div className={`${styles.processHeadingWrap} about-panel-pin`}>
              <span className={styles.sectionEyebrow}>How we work</span>
              <h2 className={styles.processHeading} id="about-process-title">
                Our
                <br />
                product thinking process
              </h2>
            </div>
            <div className={styles.processCards}>
              {processSteps.map((step) => (
                <article
                  className={`${styles.processCard} about-panel-pin`}
                  key={step.number}
                >
                  <div className={styles.processNumber}>
                    <span />
                    <i>{step.number}</i>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AboutTeamCarousel />
      <SelectedWorkRail />
    </div>
  );
}

function ArrowLine() {
  return (
    <svg
      className={styles.arrowLine}
      aria-hidden="true"
      width="81"
      height="9"
      viewBox="0 0 81 9"
      fill="none"
    >
      <rect y="4" width="80" height="1" fill="currentColor" />
      <path
        d="M77 7.96366L80.5 4.48183L77 1"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
