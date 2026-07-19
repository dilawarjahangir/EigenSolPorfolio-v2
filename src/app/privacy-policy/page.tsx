import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | EigenSol",
  description: "How EigenSol collects, uses, protects, and manages personal information.",
};

const sections: LegalSection[] = [
  {
    title: "1. Information we collect",
    paragraphs: [
      "We may collect information you provide directly, including your name, business contact details, company information, project requirements, messages, and files submitted through our website or during a client engagement.",
      "We may also receive basic technical information such as browser type, device information, referring pages, and website usage data.",
    ],
  },
  {
    title: "2. How we use information",
    items: [
      "Respond to enquiries and prepare proposals.",
      "Deliver, support, secure, and improve our services.",
      "Manage client relationships, contracts, invoices, and project communications.",
      "Operate and understand the performance of our website.",
      "Meet legal, accounting, security, and compliance obligations.",
    ],
  },
  {
    title: "3. Cookies and analytics",
    paragraphs: [
      "Our website may use essential cookies and limited analytics technologies to operate correctly and understand aggregate usage. Browser controls can be used to restrict cookies, although some functionality may be affected.",
    ],
  },
  {
    title: "4. Sharing information",
    paragraphs: [
      "We do not sell personal information. Information may be shared with service providers that support hosting, communications, analytics, payments, security, or project delivery, subject to appropriate contractual and confidentiality requirements.",
      "Information may also be disclosed when required by law, to protect legal rights, or in connection with a business reorganization.",
    ],
  },
  {
    title: "5. Retention and security",
    paragraphs: [
      "We retain information for as long as reasonably needed for the purpose it was collected, including project delivery, legal compliance, dispute resolution, and legitimate business records.",
      "We use reasonable administrative and technical safeguards, but no internet transmission or storage system can be guaranteed to be completely secure.",
    ],
  },
  {
    title: "6. Your choices",
    paragraphs: [
      "Depending on your location, you may have rights to request access, correction, deletion, restriction, or a copy of certain personal information. You may also object to some processing or withdraw consent where consent is the basis for processing.",
      "Requests can be sent to info@eigensol.com. We may need to verify your identity before completing a request.",
    ],
  },
  {
    title: "7. International processing",
    paragraphs: [
      "EigenSol and its service providers may process information in countries other than the country where it was collected. Where required, appropriate safeguards are used for international transfers.",
    ],
  },
  {
    title: "8. Children's privacy",
    paragraphs: [
      "Our website and services are intended for businesses and are not directed to children. We do not knowingly collect personal information from children through this website.",
    ],
  },
  {
    title: "9. Policy changes",
    paragraphs: [
      "We may update this policy as our website, services, or legal obligations change. The revised date will be shown at the top of this page.",
    ],
  },
  {
    title: "10. Contact",
    paragraphs: [
      "For privacy questions or requests, contact EigenSol at info@eigensol.com or write to 3570 N2 Block, Khayaban-e-Amin, Lahore, Pakistan.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      summary="This policy explains what information EigenSol collects, why we use it, and the choices available to you."
      updatedAt="July 18, 2026"
      sections={sections}
    />
  );
}
