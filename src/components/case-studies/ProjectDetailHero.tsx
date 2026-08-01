import type { CSSProperties } from "react";
import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { PortfolioProject } from "@/data/projects";
import styles from "./CaseStudyPages.module.css";

type ProjectDetailHeroProps = {
  project: PortfolioProject;
  heroImage?: string;
  liveLinks: Array<{ label: string; url: string }>;
  position: number;
  total: number;
};

export default function ProjectDetailHero({
  project,
  heroImage,
  liveLinks,
  position,
  total,
}: ProjectDetailHeroProps) {
  const mediaRatio = project.imageAspectRatio ??
    (project.primaryCategory === "Mobile" ? "4 / 3" : "16 / 9");
  const mediaStyle = { "--project-media-ratio": mediaRatio } as CSSProperties;

  return (
    <header className={styles.hero}>
      <div className={styles.heroGrid} aria-hidden="true" />
      <div className={styles.containerWide}>
        <div className={`${styles.heroNavigation} tp_fade_anim`} data-on-scroll="0">
          <Link href="/case-studies">
            <ArrowLeft aria-hidden="true" />
            Back to selected work
          </Link>
          <span>
            Case study {String(position).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <div className={styles.heroCopy}>
          <div
            className={`${styles.heroEyebrow} tp_fade_anim`}
            data-on-scroll="0"
            data-delay="0.08"
          >
            <span>{project.primaryCategory}</span>
            <span>{project.status}</span>
          </div>
          <h1 className="tp_fade_anim" data-on-scroll="0" data-delay="0.12">
            {project.title}
          </h1>
          <div
            className={`${styles.heroSummary} tp_fade_anim`}
            data-on-scroll="0"
            data-delay="0.2"
          >
            <p>{project.description}</p>
            <div className={styles.heroActions}>
              <a href="#project-overview">
                {project.caseStudy ? "Explore the case study" : "Explore the project"}
                <ArrowUpRight aria-hidden="true" />
              </a>
              {liveLinks.map((link) => (
                <a
                  className={styles.heroActionSecondary}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  key={`${link.label}-${link.url}`}
                >
                  {link.label}
                  <ExternalLink aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`${styles.heroMedia} tp_fade_anim`}
          data-on-scroll="0"
          data-delay="0.28"
          data-speed="0.96"
          style={mediaStyle}
        >
          {heroImage ? (
            <Image
              className={styles.heroImage}
              data-fit={project.primaryCategory === "Mobile" ? "contain" : "cover"}
              src={heroImage}
              alt={`${project.title} project interface`}
              fill
              sizes="(max-width: 767px) 100vw, (max-width: 1540px) 94vw, 1460px"
              preload
            />
          ) : (
            <div className={styles.heroMediaFallback}>
              <span>Private visual archive</span>
              <strong>{project.title}</strong>
              <p>Engineering detail is available even when the project screens are not public.</p>
            </div>
          )}
          <div className={styles.heroMediaLabel}>
            <span>EigenSol / Selected work</span>
            <span>{project.clientName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
