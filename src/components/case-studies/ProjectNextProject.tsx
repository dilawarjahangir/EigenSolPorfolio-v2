import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { PortfolioProject } from "@/data/projects";
import styles from "./CaseStudyPages.module.css";

type ProjectNextProjectProps = {
  project: PortfolioProject;
  relatedProjects: PortfolioProject[];
};

export default function ProjectNextProject({
  project,
  relatedProjects,
}: ProjectNextProjectProps) {
  const image = project.coverImage ?? project.galleryImages[0];

  return (
    <section className={styles.nextSection} aria-labelledby="next-project-title">
      <div className={styles.containerWide}>
        <div className={`${styles.nextTopline} tp_fade_anim`}>
          <p className={styles.eyebrow}>Continue exploring</p>
          <nav aria-label="Related case studies">
            {relatedProjects.map((related) => (
              <Link href={`/case-studies/${related.id}`} key={related.id}>
                {related.title}
              </Link>
            ))}
          </nav>
        </div>

        <Link className={`${styles.nextProject} tp_fade_anim`} href={`/case-studies/${project.id}`}>
          <span className={styles.nextProjectMedia}>
            {image ? (
              <Image
                src={image}
                alt={`${project.title} project preview`}
                fill
                sizes="(max-width: 767px) 100vw, (max-width: 1540px) 94vw, 1460px"
              />
            ) : (
              <span className={styles.nextProjectFallback}>{project.title}</span>
            )}
          </span>
          <span className={styles.nextProjectScrim} aria-hidden="true" />
          <span className={styles.nextProjectContent}>
            <span>
              Next case study <b>{project.primaryCategory}</b>
            </span>
            <h2 id="next-project-title">{project.title}</h2>
            <span className={styles.nextProjectArrow}>
              View project
              <ArrowUpRight aria-hidden="true" />
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}
