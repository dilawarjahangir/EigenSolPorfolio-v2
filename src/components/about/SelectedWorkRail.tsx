"use client";

import Image from "next/image";
import Link from "next/link";
import type { PointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { portfolioProjects } from "@/data/projects";
import styles from "./AboutUsPage.module.css";

const selectedProjects = portfolioProjects.filter((project) => project.coverImage).slice(0, 6);

export default function SelectedWorkRail() {
  const movePreview = (event: PointerEvent<HTMLAnchorElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const preview = event.currentTarget.querySelector<HTMLElement>("[data-project-preview]");

    if (!preview) return;

    preview.style.left = `${event.clientX - bounds.left}px`;
    preview.style.top = `${event.clientY - bounds.top}px`;
  };

  return (
    <section className={styles.selectedWork} aria-label="Selected EigenSol work">
      <div className={styles.selectedWorkContainer}>
        <span className={styles.selectedWorkLabel}>( Selected work )</span>
        <div className={styles.selectedWorkList}>
          {selectedProjects.map((project, index) => (
            <Link
              className={styles.selectedWorkRow}
              href={`/case-studies/${project.id}`}
              onPointerMove={movePreview}
              key={project.id}
            >
              <span className={styles.selectedIndex}>{String(index + 1).padStart(2, "0")}</span>
              <strong>{project.title}</strong>
              <span className={styles.selectedCategory}>{project.primaryCategory}</span>
              <ArrowUpRight className={styles.selectedArrow} aria-hidden="true" size={18} />
              <span className={styles.selectedPreview} data-project-preview aria-hidden="true">
                <Image
                  src={project.coverImage!}
                  alt=""
                  fill
                  sizes="210px"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
