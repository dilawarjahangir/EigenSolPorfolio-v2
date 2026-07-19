"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import {
  portfolioProjects,
  projectFilters,
  type ProjectCategory,
} from "@/data/projects";
import styles from "./CaseStudiesExplorer.module.css";

type ActiveFilter = "All" | ProjectCategory;

export default function CaseStudiesExplorer() {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("All");
  const projects =
    activeFilter === "All"
      ? portfolioProjects
      : portfolioProjects.filter((project) => project.primaryCategory === activeFilter);

  return (
    <>
      <div className={styles.filterBar}>
        <div className={styles.filters} aria-label="Filter case studies">
          {projectFilters.map((filter) => (
            <button
              type="button"
              className={activeFilter === filter ? styles.filterActive : styles.filter}
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              key={filter}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid} aria-live="polite">
        {projects.map((project) => (
          <article className={styles.card} key={project.id}>
            <Link
              className={styles.media}
              href={`/case-studies/${project.id}`}
              aria-label={`Read the ${project.title} case study`}
            >
              {project.coverImage ? (
                <Image
                  src={project.coverImage}
                  alt={`${project.title} project`}
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 33vw"
                />
              ) : (
                <span className={styles.fallback}>
                  <span>{project.primaryCategory}</span>
                  <strong>{project.title}</strong>
                </span>
              )}
              <span className={styles.mediaAction}>
                Open case study
                <ArrowRight aria-hidden="true" />
              </span>
            </Link>

            <div className={styles.content}>
              <div className={styles.badges}>
                <span>{project.primaryCategory}</span>
                <span data-status={project.status}>{project.status}</span>
              </div>
              <h2>
                <Link href={`/case-studies/${project.id}`}>{project.title}</Link>
              </h2>
              <p className={styles.description}>{project.description}</p>
              <div className={styles.tags}>
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <dl className={styles.meta}>
                <div>
                  <dt>Role</dt>
                  <dd>{project.role}</dd>
                </div>
                <div>
                  <dt>Client</dt>
                  <dd>{project.clientName}</dd>
                </div>
              </dl>
              <div className={styles.actions}>
                <Link className={styles.details} href={`/case-studies/${project.id}`}>
                  View details
                  <ArrowRight aria-hidden="true" />
                </Link>
                {project.liveUrl ? (
                  <a
                    className={styles.live}
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Visit live
                    <ExternalLink aria-hidden="true" />
                  </a>
                ) : (
                  <span className={styles.private}>No public link</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
