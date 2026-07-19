import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, Heart, Lightbulb, Shield, Target } from "lucide-react";
import CountUpNumber from "@/components/ui/CountUpNumber";
import PageCta from "@/components/site/PageCta";
import PageHero from "@/components/site/PageHero";
import SitePageShell from "@/components/site/SitePageShell";
import styles from "@/components/site/InnerPages.module.css";

export const metadata: Metadata = {
  title: "About EigenSol | Team and Product Engineering Expertise",
  description:
    "Meet the EigenSol team and learn about the values behind our software, web, mobile, AI, and product engineering work.",
};

const stats = [
  { value: 150, suffix: "+", label: "Projects Delivered" },
  { value: 50, suffix: "+", label: "Global Clients" },
  { value: 12, suffix: "+", label: "Years Experience" },
  { value: 98, suffix: "%", label: "Client Satisfaction" },
];

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "We pursue quality in every engineering decision and every product detail.",
  },
  {
    icon: Heart,
    title: "Passion",
    description: "We care deeply about the work, the people using it, and the result it creates.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We use new technology where it creates clear value, not novelty for its own sake.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description: "We build trust through transparent communication, ownership, and accountability.",
  },
];

const team = [
  {
    name: "Abdullah Ahmad",
    role: "Founder & Software Engineer",
    image: "/team/abdullahPhoto.webp",
    bio: "Strategic leader at EigenSol and AI and software solutions expert.",
    expertise: ["AI", "Software Solutions", "Leadership"],
    linkedin: "https://www.linkedin.com/in/m-abdullah-ahmad/",
  },
  {
    name: "Muhammad Umer",
    role: "Co-Founder & Marketing Expert",
    image: "/team/umernew.webp",
    bio: "Visionary leader and strategic innovator.",
    expertise: ["Leadership", "Strategy", "Innovation"],
  },
  {
    name: "Dilawar Jahangir",
    role: "Co-Founder & Full Stack Web Developer",
    image: "/team/dilawarPhoto.webp",
    bio: "Python, MERN, Next.js, and OpenAI integration specialist.",
    expertise: ["Python", "MERN", "Next.js"],
    linkedin: "https://www.linkedin.com/in/dilawarjahangir/",
  },
  {
    name: "Muhammad Saim",
    role: "Co-Founder, AI Engineer & Researcher",
    image: "/team/saimPhoto.webp",
    bio: "Software engineer focused on computer vision and natural language processing.",
    expertise: ["Python", "Computer Vision", "NLP"],
    linkedin: "https://www.linkedin.com/in/muhammad-saim-81441b229/",
  },
  {
    name: "Abdullah Faisal",
    role: "AI Engineer",
    image: "/team/abdullahFaisalPhoto.webp",
    bio: "Python developer and AI/ML researcher.",
    expertise: ["Python", "AI/ML", "Research"],
    linkedin: "https://www.linkedin.com/in/abdullahfaisal9/",
  },
  {
    name: "Syed Abdul Muhaymin",
    role: "Full-Stack JavaScript Engineer",
    image: "/team/muhayminPhoto.webp",
    bio: "SaaS and internal systems engineer working across React, Node.js, and TypeScript.",
    expertise: ["React", "Node.js", "TypeScript"],
    linkedin: "https://www.linkedin.com/in/syed-muhaymin/",
  },
  {
    name: "Manan Qasim",
    role: "Financial Accountant",
    image: "/team/mannanPhoto.webp",
    bio: "ACCA professional with experience in SAP, Power BI, and financial analysis.",
    expertise: ["ACCA", "SAP", "Power BI"],
    linkedin: "http://linkedin.com/in/manan-qasim-1a7520370/",
  },
];

export default function AboutPage() {
  return (
    <SitePageShell>
      <div className={styles.page}>
        <PageHero
          eyebrow="About EigenSol"
          title="About EigenSol"
          description="We are a product engineering team that turns ambitious ideas into resilient software, intelligent systems, and digital experiences built for real business outcomes."
          image="/team/abdullahPhoto.webp"
          imageAlt="EigenSol founder Abdullah Ahmad"
          imagePosition="center 20%"
        />

        <section className={styles.statsBand} aria-label="EigenSol statistics">
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <div className={styles.stat} key={stat.label}>
                <strong className={styles.statValue}>
                  <CountUpNumber end={stat.value} suffix={stat.suffix} duration={1800} />
                </strong>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.sectionDark}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionEyebrow}>Our values</p>
              <div>
                <h2 className={styles.sectionTitle}>What drives the way we build.</h2>
                <p className={styles.sectionLead}>
                  Strong delivery comes from clear principles: technical rigor, honest collaboration,
                  and a practical focus on what users and businesses actually need.
                </p>
              </div>
            </div>
            <div className={styles.valuesGrid}>
              {values.map(({ icon: Icon, title, description }) => (
                <article className={styles.valueItem} key={title}>
                  <span className={styles.valueIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionEyebrow}>Our team</p>
              <div>
                <h2 className={styles.sectionTitle}>The people behind EigenSol.</h2>
                <p className={styles.sectionLead}>
                  A multidisciplinary team spanning software engineering, artificial intelligence,
                  product strategy, marketing, and finance.
                </p>
              </div>
            </div>
            <div className={styles.teamGrid}>
              {team.map((member) => (
                <article className={styles.teamCard} key={member.name}>
                  <div className={styles.teamMedia}>
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 25vw"
                    />
                  </div>
                  <div className={styles.teamContent}>
                    <h3 className={styles.teamName}>{member.name}</h3>
                    <p className={styles.teamRole}>{member.role}</p>
                    <p className={styles.teamBio}>{member.bio}</p>
                    <div className={styles.tagList}>
                      {member.expertise.map((skill) => (
                        <span className={styles.tag} key={skill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                    {member.linkedin && (
                      <a
                        className={styles.teamSocial}
                        href={member.linkedin}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        LinkedIn
                        <ExternalLink aria-hidden="true" size={13} />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <PageCta
          title="Want to build your career with EigenSol?"
          description="Explore our current openings and find out how you can contribute to products used by teams around the world."
          label="View open positions"
          href="/careers"
        />
      </div>
    </SitePageShell>
  );
}
