import type { Metadata } from "next";
import CreativeStudioFooter from "@/components/CreativeStudioFooter";
import Header from "@/components/Header";
import AgntixContactPage from "@/components/contact/AgntixContactPage";
import AgntixInnerPageExperience from "@/components/site/AgntixInnerPageExperience";

export const metadata: Metadata = {
  title: "Contact EigenSol | Start a Project",
  description:
    "Contact EigenSol to discuss a software, web, mobile, AI, design, cloud, or DevOps project.",
};

type ContactPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { message } = await searchParams;

  return (
    <>
      <Header />
      <AgntixInnerPageExperience>
        <main>
          <AgntixContactPage defaultMessage={message} />
        </main>
        <CreativeStudioFooter />
      </AgntixInnerPageExperience>
    </>
  );
}
