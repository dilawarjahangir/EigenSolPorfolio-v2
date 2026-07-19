import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms and Conditions | EigenSol",
  description: "Terms governing the use of EigenSol's website and professional services.",
};

const sections: LegalSection[] = [
  {
    title: "1. Agreement",
    paragraphs: [
      "These Terms and Conditions govern your use of the EigenSol website and any services provided under a proposal, statement of work, or other written agreement. By using this website, you agree to these terms.",
      "Project-specific agreements take priority where they conflict with these general website terms.",
    ],
  },
  {
    title: "2. Services",
    paragraphs: [
      "EigenSol provides software engineering, web and mobile development, automation, artificial intelligence, DevOps, design, consulting, and related digital services.",
      "The scope, delivery schedule, acceptance criteria, and commercial terms for client work are defined in the applicable proposal or statement of work.",
    ],
  },
  {
    title: "3. Client responsibilities",
    items: [
      "Provide timely access to information, systems, content, and decision-makers needed for delivery.",
      "Confirm that supplied materials may lawfully be used for the project.",
      "Review deliverables and provide feedback within the timeframes agreed for the project.",
      "Maintain appropriate backups and security controls for systems outside EigenSol's control.",
    ],
  },
  {
    title: "4. Fees and payment",
    paragraphs: [
      "Fees, invoicing milestones, taxes, and payment dates are stated in the applicable commercial agreement. Work may be paused when an undisputed invoice remains overdue.",
      "Third-party costs, licenses, hosting, and usage-based services are charged only where included in the agreement or approved by the client.",
    ],
  },
  {
    title: "5. Intellectual property",
    paragraphs: [
      "Ownership of project deliverables is governed by the applicable written agreement. Unless that agreement states otherwise, EigenSol retains ownership of pre-existing tools, reusable methods, libraries, and general know-how.",
      "Website content, branding, graphics, and source material owned by EigenSol may not be copied or redistributed without written permission.",
    ],
  },
  {
    title: "6. Confidentiality",
    paragraphs: [
      "Each party should protect confidential information received from the other and use it only for the agreed purpose. Information that is public, independently developed, or lawfully received from another source is not confidential.",
    ],
  },
  {
    title: "7. Third-party services",
    paragraphs: [
      "Projects may rely on third-party platforms, APIs, hosting providers, open-source software, or other external services. Their availability and terms are controlled by their respective providers.",
    ],
  },
  {
    title: "8. Warranties and liability",
    paragraphs: [
      "EigenSol performs services with reasonable professional care. Except where expressly stated in a written agreement, the website and its content are provided without additional warranties.",
      "Liability limitations, remedies, and exclusions for client projects are defined in the applicable agreement and remain subject to rights that cannot legally be excluded.",
    ],
  },
  {
    title: "9. Termination",
    paragraphs: [
      "Either party may terminate a project only as permitted by its written agreement. Fees for completed work, approved expenses, confidentiality duties, and provisions intended to survive termination remain effective.",
    ],
  },
  {
    title: "10. Changes and contact",
    paragraphs: [
      "These terms may be updated as the website or services change. The current version will be published on this page.",
      "Questions about these terms can be sent to info@eigensol.com.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      summary="These terms explain the rules that apply when you use the EigenSol website or engage with our professional services."
      updatedAt="July 18, 2026"
      sections={sections}
    />
  );
}
