import Image from "next/image";
import Link from "next/link";
import { ScanSearch, Waypoints } from "lucide-react";
import type { PortfolioProject } from "@/data/projects";
import styles from "./MetroWorkPage.module.css";

type MetroProjectRowProps = {
  project: PortfolioProject;
  index: number;
};

export default function MetroProjectRow({ project, index }: MetroProjectRowProps) {
  const detailHref = `/case-studies/${project.id}`;
  const mediaFirst = index % 2 !== 0;
  const isPortrait = project.id === "sleep-tracking";

  return (
    <article
      className={styles.project}
      data-layout={mediaFirst ? "media-left" : "media-right"}
      data-metro-project
    >
      <div className={styles.projectRow}>
        <div className={styles.mediaColumn}>
          <Link
            className={styles.mediaLink}
            href={detailHref}
            aria-label={`View ${project.title} case study`}
          >
            <div
              className={styles.projectMedia}
              data-direction={index % 2 === 0 ? "positive" : "negative"}
              data-metro-thumb
            >
              {project.coverImage ? (
                <Image
                  className={isPortrait ? styles.portraitImage : styles.projectImage}
                  src={project.coverImage}
                  alt={`${project.title} project by EigenSol`}
                  fill
                  sizes="(min-width: 1400px) 960px, (min-width: 1200px) 665px, calc(100vw - 60px)"
                  priority={index === 0}
                />
              ) : (
                <div className={styles.noMediaPanel}>
                  <div className={styles.noMediaGrid} aria-hidden="true" />
                  <div className={styles.noMediaIcons} aria-hidden="true">
                    <ScanSearch />
                    <Waypoints />
                  </div>
                  <p>EigenSol</p>
                  <span>Computer Vision / Robotics</span>
                </div>
              )}
            </div>
          </Link>
        </div>

        <div className={styles.contentColumn}>
          <div className={styles.projectContent}>
            <h2 className={styles.projectTitle}>
              <Link href={detailHref}>
                <span className="metro-reveal">{project.title}</span>
              </Link>
            </h2>
            <p className={`${styles.projectTags} metro-reveal`}>
              {project.tags.slice(0, 3).join(", ")}
            </p>
            <Link className={styles.projectButton} href={detailHref}>
              View project
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
