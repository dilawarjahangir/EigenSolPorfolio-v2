import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import ProjectGallery from "@/components/case-studies/ProjectGallery";
import styles from "@/components/case-studies/CaseStudyPages.module.css";
import PageCta from "@/components/site/PageCta";
import PageHero from "@/components/site/PageHero";
import SitePageShell from "@/components/site/SitePageShell";
import { getPortfolioProjectById, portfolioProjects } from "@/data/projects";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export function generateStaticParams() {
  return portfolioProjects.map((project) => ({ projectId: project.id }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { projectId } = await params;
  const project = getPortfolioProjectById(projectId);

  if (!project) {
    return {
      title: "Case Study Not Found | EigenSol",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${project.title} Case Study | EigenSol`,
    description: project.description,
    keywords: [project.primaryCategory, project.clientName, ...project.tags],
    openGraph: {
      title: `${project.title} Case Study | EigenSol`,
      description: project.description,
      images: project.coverImage ? [project.coverImage] : ["/logo.webp"],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = getPortfolioProjectById(projectId);

  if (!project) notFound();

  const caseStudy = project.caseStudy;
  const technologies = project.coreTechnologies ?? project.tags;
  const relatedProjects = portfolioProjects.filter((item) => item.id !== project.id).slice(0, 3);
  const liveLinks =
    project.liveLinks ??
    (project.liveUrl ? [{ label: "Visit live", url: project.liveUrl }] : []);

  return (
    <SitePageShell>
      <article className={styles.page}>
        <PageHero
          eyebrow={`${project.primaryCategory} case study`}
          title={project.title}
          description={project.description}
          image={project.coverImage ?? "/software-development.webp"}
          imageAlt={`${project.title} project by EigenSol`}
          actions={
            <>
              <a href="#gallery">View gallery</a>
              <Link href="/case-studies">
                <ArrowLeft aria-hidden="true" size={16} />
                All projects
              </Link>
              {liveLinks.map((link) => (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  key={`${link.label}-${link.url}`}
                >
                  {link.label}
                  <ExternalLink aria-hidden="true" size={15} />
                </a>
              ))}
            </>
          }
        />

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.overviewLayout}>
              <div>
                <div className={styles.sectionIntro}>
                  <p className={styles.eyebrow}>Project overview</p>
                  <div>
                    <h2 className={styles.title}>Built around a real operating problem.</h2>
                    {!caseStudy && <p className={styles.lead}>{project.description}</p>}
                  </div>
                </div>

                {caseStudy && (
                  <div className={styles.prose}>
                    {caseStudy.overview.map((paragraph) => (
                      <p className={styles.paragraph} key={paragraph}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                <div className={styles.summaryGrid}>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Delivery role</span>
                    <strong>{project.role}</strong>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.label}>Engagement</span>
                    <strong>{project.clientName}</strong>
                  </div>
                </div>
              </div>

              <aside className={styles.snapshot}>
                <h2 className={styles.snapshotTitle}>Project snapshot</h2>
                <dl>
                  <div>
                    <dt>Category</dt>
                    <dd>{project.primaryCategory}</dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>{project.status}</dd>
                  </div>
                  <div>
                    <dt>Screens</dt>
                    <dd>{project.galleryImages.length || "Private"}</dd>
                  </div>
                  <div>
                    <dt>Client</dt>
                    <dd>{project.clientName}</dd>
                  </div>
                  <div>
                    <dt>Public link</dt>
                    <dd>{liveLinks.length ? "Available" : "Private"}</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </section>

        {caseStudy && (
          <>
            <section className={styles.sectionMuted}>
              <div className={styles.container}>
                <div className={styles.sectionIntro}>
                  <p className={styles.eyebrow}>Approach</p>
                  <div>
                    <h2 className={styles.title}>From constraint to working system.</h2>
                    <p className={styles.lead}>
                      The engagement connected product requirements with an implementation that
                      could be maintained, tested, and extended.
                    </p>
                  </div>
                </div>
                <div className={styles.twoColumns}>
                  <div className={styles.textPanel}>
                    <h3>Challenge</h3>
                    <div className={styles.prose}>
                      {caseStudy.challenge.map((paragraph) => (
                        <p className={styles.paragraph} key={paragraph}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className={styles.textPanel}>
                    <h3>Solution</h3>
                    <ul className={styles.bulletList}>
                      {caseStudy.solution.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.container}>
                <div className={styles.sectionIntro}>
                  <p className={styles.eyebrow}>Key features</p>
                  <h2 className={styles.title}>What the product delivers.</h2>
                </div>
                <div className={styles.featuresGrid}>
                  {caseStudy.features.map((feature) => (
                    <div className={styles.feature} key={feature.title}>
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  ))}
                </div>

                {caseStudy.architecture?.length ? (
                  <div className={styles.architecture}>
                    <p className={styles.eyebrow}>Architecture</p>
                    <h3>How the system is connected.</h3>
                    <ul className={styles.bulletList}>
                      {caseStudy.architecture.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className={styles.impactGrid}>
                  {caseStudy.impact.map((item) => (
                    <div className={styles.impact} key={item}>
                      <span className={styles.label}>Impact</span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        <section className={styles.sectionDark}>
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>Technology</p>
              <div>
                <h2 className={`${styles.title} ${styles.titleLight}`}>Core technologies used.</h2>
                <p className={`${styles.lead} ${styles.leadLight}`}>
                  The stack reflects the main frontend, backend, infrastructure, data, or product
                  workflow technologies used for this delivery.
                </p>
              </div>
            </div>
            <div className={styles.technologies}>
              {technologies.map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionMuted} id="gallery">
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>Gallery</p>
              <div>
                <h2 className={styles.title}>Review the product screens.</h2>
                <p className={styles.lead}>
                  Browse the original screens and interfaces available for this project.
                </p>
              </div>
            </div>
            <ProjectGallery title={project.title} images={project.galleryImages} />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>More projects</p>
              <h2 className={styles.title}>Explore more case studies.</h2>
            </div>
            <div className={styles.relatedGrid}>
              {relatedProjects.map((item) => (
                <Link className={styles.related} href={`/case-studies/${item.id}`} key={item.id}>
                  <span className={styles.relatedMedia}>
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={`${item.title} project`}
                        fill
                        sizes="(max-width: 767px) 100vw, 33vw"
                      />
                    ) : (
                      <span className={styles.relatedFallback}>{item.title}</span>
                    )}
                  </span>
                  <span className={styles.relatedContent}>
                    <span>{item.primaryCategory}</span>
                    <h3>{item.title}</h3>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <PageCta
          title="Have a similar product challenge?"
          description="Tell EigenSol what must change, what already exists, and where the delivery needs to go."
          label="Discuss your project"
          href="/contact"
        />
      </article>
    </SitePageShell>
  );
}
