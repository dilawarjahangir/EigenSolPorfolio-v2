import Image from "next/image";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import AgntixContactForm from "./AgntixContactForm";
import styles from "./AgntixContactPage.module.css";

type AgntixContactPageProps = {
  defaultMessage?: string;
};

type ContactCard = {
  title: string;
  image: string;
  email: string;
  phone: string;
  href: string;
  label: string;
  speed: string;
  offset?: boolean;
  featured?: boolean;
};

const officeMap =
  "https://www.google.com/maps/search/?api=1&query=EigenSol%2C%20Khayaban-e-Amin%2C%20Lahore";

const contactCards: ContactCard[] = [
  {
    title: "Lahore Headquarters",
    image: "/agntix-contact/contact-us-thumb-1.jpg",
    email: "info@eigensol.com",
    phone: "+92 326 0335144",
    href: officeMap,
    label: "View Location",
    speed: "1.2",
  },
  {
    title: "Project Inquiries",
    image: "/agntix-contact/contact-location-2.jpg",
    email: "info@eigensol.com",
    phone: "+92 326 0335144",
    href: "mailto:info@eigensol.com?subject=New%20project%20inquiry",
    label: "Start a Project",
    speed: ".9",
    offset: true,
    featured: true,
  },
  {
    title: "Delivery Partnerships",
    image: "/agntix-contact/contact-location-3.jpg",
    email: "info@eigensol.com",
    phone: "+92 326 0335144",
    href: "mailto:info@eigensol.com?subject=Delivery%20partnership",
    label: "Plan a Partnership",
    speed: "1.2",
  },
];

export default function AgntixContactPage({
  defaultMessage,
}: AgntixContactPageProps) {
  return (
    <div className={styles.contactPage}>
      <section className={styles.contactHero} aria-labelledby="contact-title">
        <div className={styles.container1230}>
          <div className={styles.heroInner}>
            <div className={`${styles.heroHeading} tp_fade_anim`} data-delay=".3">
              <div className={styles.subtitleRow}>
                <span className={`${styles.subtitle} tp_fade_anim`}>Contact us</span>
                <ArrowRight aria-hidden="true" />
              </div>
              <h1 id="contact-title">
                Let&apos;s build something
                <span className={styles.titleShape}>
                  <Image
                    src="/agntix-contact/about-us-4-shape-1.png"
                    alt=""
                    width={65}
                    height={65}
                    aria-hidden="true"
                    priority
                  />
                </span>
                <br />{" "}
                amazing together
              </h1>
            </div>

            <div className={`${styles.heroDescription} tp_fade_anim`}>
              <p>
                Have a project in mind? We&apos;d love to hear about it. Drop us a line and
                we&apos;ll get back to you within 24 hours.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.heroBottom}>
          <div className={styles.container}>
            <a className={styles.exploreLink} href="#contact-form">
              <ArrowDown aria-hidden="true" />
              Scroll to explore
            </a>
            <p>See our Lahore office on the map</p>
          </div>
        </div>
      </section>

      <section className={styles.formSection} id="contact-form">
        <div className={styles.container1750}>
          <div className={styles.formShell}>
            <div className={styles.map}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3406.8902921037225!2d74.2763329!3d31.362006499999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919ab00298824f1%3A0x4f7d01845bc268f9!2sEigenSol!5e0!3m2!1sen!2s!4v1773829226419!5m2!1sen!2s"
                title="EigenSol office location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className={styles.mapMarker} aria-hidden="true">
                <span>
                  <Image
                    src="/agntix-contact/map-icon.svg"
                    alt=""
                    width={24}
                    height={28}
                  />
                </span>
              </div>
            </div>

            <div className={styles.formWrap}>
              <h2>Start Your Project</h2>
              <AgntixContactForm defaultMessage={defaultMessage} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.supportSection}>
        <div className={styles.supportContainer}>
          <div className={styles.supportBanner}>
            <p className="tp_fade_anim">
              Or contact our team directly below. Business hours are Monday to Friday, 9am to 6pm
              PKT, and we aim to respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.contactCardsSection} aria-label="EigenSol contact options">
        <div className={styles.container1230}>
          <div className={styles.contactCards}>
            {contactCards.map((card) => (
              <article
                className={`${styles.contactCard} ${card.offset ? styles.cardOffset : ""}`}
                data-speed={card.speed}
                key={card.title}
              >
                <div className={styles.cardImage}>
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="(min-width: 992px) 370px, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardDetails}>
                    <h2>{card.title}</h2>
                    <a href={`mailto:${card.email}`}>{card.email}</a>
                    <a href="tel:+923260335144">{card.phone}</a>
                  </div>
                  <a
                    className={`${styles.cardButton} ${
                      card.featured ? styles.cardButtonFeatured : ""
                    }`}
                    href={card.href}
                    target={card.href === officeMap ? "_blank" : undefined}
                    rel={card.href === officeMap ? "noreferrer noopener" : undefined}
                  >
                    <span>
                      <span>{card.label}</span>
                      <span aria-hidden="true">{card.label}</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
