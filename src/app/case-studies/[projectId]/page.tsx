import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetailPage from "@/components/case-studies/ProjectDetailPage";
import { getPortfolioProjectById, portfolioProjects } from "@/data/projects";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export const dynamicParams = false;

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

  const canonicalPath = `/case-studies/${project.id}`;
  const socialImage = project.coverImage ?? project.galleryImages[0] ?? "/logo.webp";
  const socialTitle = `${project.title} Case Study | EigenSol`;

  return {
    title: socialTitle,
    description: project.description,
    keywords: [project.primaryCategory, project.clientName, ...project.tags],
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: socialTitle,
      description: project.description,
      type: "article",
      url: canonicalPath,
      siteName: "EigenSol",
      images: [{ url: socialImage, alt: `${project.title} project by EigenSol` }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: project.description,
      images: [socialImage],
    },
  };
}

export default async function ProjectDetailRoute({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = getPortfolioProjectById(projectId);

  if (!project) notFound();

  const projectIndex = portfolioProjects.findIndex((item) => item.id === project.id);
  const nextProject = portfolioProjects[(projectIndex + 1) % portfolioProjects.length];
  const otherProjects = portfolioProjects.filter((item) => item.id !== project.id);
  const relatedProjects = [
    ...otherProjects.filter((item) => item.primaryCategory === project.primaryCategory),
    ...otherProjects.filter((item) => item.primaryCategory !== project.primaryCategory),
  ]
    .filter((item) => item.id !== nextProject.id)
    .slice(0, 2);

  return (
    <ProjectDetailPage
      project={project}
      projectPosition={projectIndex + 1}
      projectTotal={portfolioProjects.length}
      relatedProjects={relatedProjects}
      nextProject={nextProject}
    />
  );
}
