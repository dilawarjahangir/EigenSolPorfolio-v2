import type { Metadata } from "next";
import CaseStudiesExplorer from "@/components/case-studies/CaseStudiesExplorer";
import styles from "@/components/case-studies/CaseStudyPages.module.css";
import PageCta from "@/components/site/PageCta";
import PageHero from "@/components/site/PageHero";
import SitePageShell from "@/components/site/SitePageShell";

export const metadata: Metadata = {
  title: "Case Studies | Web, Mobile and AI Projects | EigenSol",
  description:
    "Explore EigenSol case studies across web platforms, mobile products, AI solutions, and custom business software.",
};

const stats = [
  ["150+", "Projects delivered"],
  ["50+", "Global clients"],
  ["98%", "Client satisfaction"],
  ["12+", "Years experience"],
];

export default function CaseStudiesPage() {
  return (
    <SitePageShell>
      <div className={styles.page}>
        <PageHero
          eyebrow="EigenSol projects"
          title="EigenSol Case Studies"
          description="Explore the products, platforms, mobile experiences, and intelligent systems we have delivered for real organizations and operating teams."
          image="/projects/htask/htask-cover.webp"
          imageAlt="HTask dashboard built by EigenSol"
        />

        <section className={styles.catalog}>
          <div className={styles.container}>
            <CaseStudiesExplorer />
          </div>
        </section>

        <section className={styles.stats} aria-label="EigenSol project statistics">
          <div className={styles.statsGrid}>
            {stats.map(([value, label]) => (
              <div className={styles.stat} key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <PageCta
          title="Ready to build the next case study?"
          description="Bring us the business problem, the technical constraints, and the outcome you need. We will help turn them into a product plan."
          label="Start your project"
          href="/contact"
        />
      </div>
    </SitePageShell>
  );
}
