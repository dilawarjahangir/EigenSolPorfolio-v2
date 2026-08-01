import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import AgntixInnerPageExperience from "@/components/site/AgntixInnerPageExperience";
import type { PortfolioProject } from "@/data/projects";
import ProjectBrief from "./ProjectBrief";
import ProjectDetailHero from "./ProjectDetailHero";
import ProjectGallery from "./ProjectGallery";
import ProjectNextProject from "./ProjectNextProject";
import ProjectStory from "./ProjectStory";
import styles from "./CaseStudyPages.module.css";

type ProjectDetailPageProps = {
  project: PortfolioProject;
  projectPosition: number;
  projectTotal: number;
  relatedProjects: PortfolioProject[];
  nextProject: PortfolioProject;
};

export default function ProjectDetailPage({
  project,
  projectPosition,
  projectTotal,
  relatedProjects,
  nextProject,
}: ProjectDetailPageProps) {
  const heroImage = project.coverImage ?? project.galleryImages[0];
  const galleryImages = heroImage
    ? project.galleryImages.filter((image) => image !== heroImage)
    : project.galleryImages;
  const technologies = project.coreTechnologies ?? project.tags;
  const hasGallery = galleryImages.length > 0;
  const storyStartNumber = hasGallery ? 3 : 2;
  const technologyNumber = project.caseStudy
    ? storyStartNumber + 2
    : hasGallery
      ? 3
      : 2;
  const liveLinks =
    project.liveLinks ??
    (project.liveUrl ? [{ label: "Visit live project", url: project.liveUrl }] : []);

  return (
    <>
      <Header />
      <AgntixInnerPageExperience waitForImages={false}>
        <main>
          <article className={styles.page}>
            <ProjectDetailHero
              project={project}
              heroImage={heroImage}
              liveLinks={liveLinks}
              position={projectPosition}
              total={projectTotal}
            />

            <ProjectBrief project={project} />

            {hasGallery && (
              <section className={styles.gallerySection} id="gallery" aria-labelledby="gallery-title">
                <div className={styles.containerWide}>
                  <div className={`${styles.sectionHeading} tp_fade_anim`}>
                    <div>
                      <span className={styles.sectionIndex} aria-hidden="true">02</span>
                      <p className={styles.eyebrow}>Visual showcase</p>
                    </div>
                    <div>
                      <h2 id="gallery-title">The product, frame by frame.</h2>
                      <p>
                        Explore {galleryImages.length} additional public
                        {galleryImages.length === 1 ? " screen" : " screens"} from the delivery.
                      </p>
                    </div>
                  </div>
                  <ProjectGallery
                    key={project.id}
                    title={project.title}
                    images={galleryImages}
                    aspectRatio={project.imageAspectRatio}
                    initialOrientation={
                      project.primaryCategory === "Mobile" ? "portrait" : "landscape"
                    }
                  />
                </div>
              </section>
            )}

            <ProjectStory caseStudy={project.caseStudy} sectionStart={storyStartNumber} />

            <section className={styles.technologySection} aria-labelledby="technology-title">
              <div className={styles.containerWide}>
                <div className={styles.technologyLayout}>
                  <div className={`${styles.technologyHeading} tp_fade_anim`}>
                    <span className={styles.sectionIndex} aria-hidden="true">
                      {String(technologyNumber).padStart(2, "0")}
                    </span>
                    <p className={styles.eyebrow}>Built with</p>
                    <h2 id="technology-title">A stack selected for the work.</h2>
                  </div>
                  <ul
                    className={styles.technologyList}
                    role="list"
                    aria-label={`${project.title} technologies`}
                  >
                    {technologies.map((technology, index) => (
                      <li
                        className="tp_fade_anim"
                        data-delay={String(Math.min(index * 0.025, 0.3))}
                        key={technology}
                      >
                        <span aria-hidden="true">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {technology}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            <ProjectNextProject
              project={nextProject}
              relatedProjects={relatedProjects}
            />

            <section className={styles.closingCta} aria-labelledby="project-cta-title">
              <div className={styles.containerWide}>
                <div className={styles.closingCtaInner}>
                  <div>
                    <p className={styles.eyebrow}>Start a conversation</p>
                    <h2 id="project-cta-title">Have a product challenge worth solving?</h2>
                  </div>
                  <div className={styles.closingCtaAction}>
                    <p>
                      Tell us what needs to change, what already exists, and where the product
                      needs to go next.
                    </p>
                    <Link href="/contact">
                      Discuss your project
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </article>
        </main>
        <CreativeStudioFooter />
      </AgntixInnerPageExperience>
    </>
  );
}
