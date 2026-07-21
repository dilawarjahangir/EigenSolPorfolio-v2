import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import PageCta from "@/components/site/PageCta";
import PageHero from "@/components/site/PageHero";
import SitePageShell from "@/components/site/SitePageShell";
import styles from "@/components/site/InnerPages.module.css";

export const metadata: Metadata = {
  title: "Careers at EigenSol",
  description:
    "Explore careers at EigenSol, our engineering culture, employee benefits, and current open positions.",
};

const values = [
  ["Innovation First", "We encourage experimentation and embrace new technologies."],
  ["Ownership Culture", "Take full ownership of your projects from concept to deployment."],
  ["Work-Life Balance", "We believe in a sustainable pace and avoiding burnout."],
  ["Diverse & Inclusive", "We celebrate diversity and create an environment where everyone belongs."],
];

const benefits = [
  ["Competitive Salary", "Compensation aligned with role scope, experience, and market expectations."],
  ["Health & Wellness", "Support for healthy routines and a sustainable approach to work."],
  ["Flexible Work", "Flexible collaboration built around accountability and delivery."],
  ["Learning Budget", "Support for courses, certifications, conferences, and technical growth."],
  ["Latest Technology", "Modern tools and equipment suited to the work you are responsible for."],
  ["Team Events", "Regular opportunities to learn, collaborate, and spend time together."],
];

export default function CareersPage() {
  return (
    <SitePageShell>
      <div className={styles.page}>
        <PageHero
          eyebrow="Join Our Team"
          title="Build Your Career. Build the Future."
          description="Join a team of talented, passionate people working on ambitious software, product, and artificial intelligence projects."
          image="/team/umernew.webp"
          imageAlt="EigenSol team member"
          imagePosition="center 18%"
        />

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionEyebrow}>Why EigenSol</p>
              <div>
                <h2 className={styles.sectionTitle}>More than a role on a project.</h2>
                <p className={styles.sectionLead}>
                  EigenSol gives people room to make decisions, deepen their craft, and see how
                  their work affects the full product.
                </p>
              </div>
            </div>
            <div className={styles.valuesGrid}>
              {values.map(([title, description], index) => (
                <article className={styles.valueItem} key={title}>
                  <span className={styles.valueIcon}>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionMuted}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionEyebrow}>Benefits & perks</p>
              <div>
                <h2 className={styles.sectionTitle}>Support for doing your best work.</h2>
              </div>
            </div>
            <div className={styles.benefitsGrid}>
              {benefits.map(([title, description]) => (
                <article className={styles.benefit} key={title}>
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
              <p className={styles.sectionEyebrow}>Open positions</p>
              <div>
                <h2 className={styles.sectionTitle}>Join our growing team.</h2>
                <p className={styles.sectionLead}>
                  Current openings are listed below. We also welcome strong general applications.
                </p>
              </div>
            </div>
            <div className={styles.jobList}>
              <article className={styles.job}>
                <div>
                  <h3>Python Software Engineer</h3>
                  <div className={styles.jobMeta}>
                    <span>Engineering</span>
                    <span>
                      <MapPin aria-hidden="true" /> Lahore, Pakistan
                    </span>
                    <span>
                      <Clock aria-hidden="true" /> Full-time
                    </span>
                  </div>
                </div>
                <a
                  className={styles.primaryButton}
                  href="mailto:info@eigensol.com?subject=Application%20for%20Python%20Software%20Engineer"
                >
                  Apply now
                  <ArrowUpRight aria-hidden="true" size={17} />
                </a>
              </article>
            </div>
            <p className={styles.sectionLead}>
              Do not see the right role?{" "}
              <Link href="/contact?message=I%20would%20like%20to%20send%20my%20resume%20to%20EigenSol.">
                Send us your resume.
              </Link>
            </p>
          </div>
        </section>

        <PageCta
          title="Ready to make an impact with us?"
          description="Introduce yourself, share the work you are proud of, and tell us what you want to build next."
          label="Get in touch"
          href="/contact"
        />
      </div>
    </SitePageShell>
  );
}
