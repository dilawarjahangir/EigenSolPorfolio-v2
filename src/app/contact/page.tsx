import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import PageHero from "@/components/site/PageHero";
import SitePageShell from "@/components/site/SitePageShell";
import styles from "@/components/site/InnerPages.module.css";

export const metadata: Metadata = {
  title: "Contact EigenSol | Start a Project",
  description:
    "Contact EigenSol to discuss a software, web, mobile, AI, design, cloud, or DevOps project.",
};

const contactInfo = [
  {
    icon: Mail,
    title: "Email",
    content: <a href="mailto:info@eigensol.com">info@eigensol.com</a>,
  },
  {
    icon: Phone,
    title: "Phone",
    content: <a href="tel:+923260335144">+92 326 0335144</a>,
  },
  {
    icon: MapPin,
    title: "Office",
    content: (
      <a
        href="https://www.google.com/maps/search/?api=1&query=EigenSol%2C%20Khayaban-e-Amin%2C%20Lahore"
        target="_blank"
        rel="noreferrer noopener"
      >
        3570 N2 Block, Khayaban-e-Amin
        <br />
        Lahore, Pakistan
      </a>
    ),
  },
  {
    icon: Clock,
    title: "Business Hours",
    content: (
      <p>
        Mon-Fri: 9am - 6pm PKT
        <br />
        Response within 24 hours
      </p>
    ),
  },
];

type ContactPageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { message } = await searchParams;

  return (
    <SitePageShell>
      <div className={styles.page}>
        <PageHero
          eyebrow="Get in touch"
          title="Contact EigenSol"
          description="Have a product challenge or a project in mind? Tell us what you are building, and our team will help define the next practical step."
          image="/software-development.webp"
          imageAlt="Software engineering work at EigenSol"
        />

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.infoGrid}>
              {contactInfo.map(({ icon: Icon, title, content }) => (
                <article className={styles.infoItem} key={title}>
                  <span className={styles.infoIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <h2>{title}</h2>
                  {content}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionMuted}>
          <div className={styles.narrowContainer}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionEyebrow}>Start a project</p>
              <div>
                <h2 className={styles.sectionTitle}>Tell us what needs to work better.</h2>
                <p className={styles.sectionLead}>
                  Share the product, timeline, current constraints, and target outcome. The form
                  prepares a structured email so the right EigenSol team member can respond.
                </p>
              </div>
            </div>
            <ContactForm defaultMessage={message} />
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.officeLayout}>
              <div className={styles.officeCopy}>
                <p className={styles.sectionEyebrow}>Lahore office</p>
                <h2>Visit EigenSol.</h2>
                <p>
                  3570 N2 Block, Khayaban-e-Amin
                  <br />
                  Lahore, Pakistan
                </p>
                <a
                  className={styles.textLink}
                  href="https://www.google.com/maps/search/?api=1&query=EigenSol%2C%20Khayaban-e-Amin%2C%20Lahore"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Open in Google Maps
                </a>
              </div>
              <div className={styles.map}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3406.8902921037225!2d74.2763329!3d31.362006499999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919ab00298824f1%3A0x4f7d01845bc268f9!2sEigenSol!5e0!3m2!1sen!2s!4v1773829226419!5m2!1sen!2s"
                  title="EigenSol office location"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </SitePageShell>
  );
}
