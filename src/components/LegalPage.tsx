import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CreativeStudioFooter from "./CreativeStudioFooter";
import Header from "./Header";
import styles from "./LegalPage.module.css";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type LegalPageProps = {
  title: string;
  summary: string;
  updatedAt: string;
  sections: LegalSection[];
};

export default function LegalPage({ title, summary, updatedAt, sections }: LegalPageProps) {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroInner}>
            <Link className={styles.backLink} href="/">
              <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.8} />
              <span>Back to home</span>
            </Link>
            <p className={styles.eyebrow}>EigenSol Legal</p>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.summary}>{summary}</p>
            <p className={styles.updated}>Last updated: {updatedAt}</p>
          </div>
        </header>

        <article className={styles.document} aria-label={title}>
          {sections.map((section) => (
            <section className={styles.section} key={section.title}>
              <h2>{section.title}</h2>
              <div className={styles.sectionContent}>
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.items && (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </article>
      </main>
      <CreativeStudioFooter />
    </>
  );
}
