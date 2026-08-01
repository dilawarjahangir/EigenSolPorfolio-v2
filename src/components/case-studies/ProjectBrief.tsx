import type { PortfolioProject } from "@/data/projects";
import styles from "./CaseStudyPages.module.css";

type ProjectBriefProps = {
  project: PortfolioProject;
};

export default function ProjectBrief({ project }: ProjectBriefProps) {
  const overview = project.caseStudy?.overview ?? [project.description];
  const facts = [
    { label: "Client", value: project.clientName },
    { label: "Delivery role", value: project.role },
    { label: "Discipline", value: project.primaryCategory },
    { label: "Project status", value: project.status },
  ];

  return (
    <section className={styles.briefSection} id="project-overview" aria-labelledby="overview-title">
      <div className={styles.containerWide}>
        <div className={styles.briefLayout}>
          <div className={`${styles.stickyHeading} tp_fade_anim`}>
            <span className={styles.sectionIndex} aria-hidden="true">01</span>
            <p className={styles.eyebrow}>Project brief</p>
            <h2 id="overview-title">Inside the build.</h2>
          </div>
          <div className={styles.briefContent}>
            <div className={`${styles.overviewProse} tp_fade_anim`}>
              {overview.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <dl className={styles.factsGrid}>
              {facts.map((fact, index) => (
                <div
                  className="tp_fade_anim"
                  data-delay={String(index * 0.06)}
                  key={fact.label}
                >
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
