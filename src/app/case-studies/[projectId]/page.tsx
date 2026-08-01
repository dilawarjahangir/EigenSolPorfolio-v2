import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetailPage from "@/components/case-studies/ProjectDetailPage";
import JsonLd from "@/components/seo/JsonLd";
import { getPortfolioProjectById, portfolioProjects } from "@/data/projects";
import { breadcrumbJsonLd, buildPageMetadata, creativeWorkJsonLd } from "@/lib/seo";

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

  const socialImage = project.coverImage ?? project.galleryImages[0] ?? "/logo.webp";
  const socialTitle = `${project.title} Case Study | EigenSol`;

  return buildPageMetadata({
    title: socialTitle,
    description: project.description,
    path: `/case-studies/${project.id}`,
    image: socialImage,
  });
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
    <>
      <JsonLd
        data={[
          creativeWorkJsonLd(project),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Case Studies", path: "/case-studies" },
            { name: project.title, path: `/case-studies/${project.id}` },
          ]),
        ]}
      />
      <ProjectDetailPage
        project={project}
        projectPosition={projectIndex + 1}
        projectTotal={portfolioProjects.length}
        relatedProjects={relatedProjects}
        nextProject={nextProject}
      />
    </>
  );
}
