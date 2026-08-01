import type { PortfolioProject } from "@/data/projects";
import styles from "./CaseStudyPages.module.css";

type ProjectStoryProps = {
  caseStudy?: PortfolioProject["caseStudy"];
  sectionStart: number;
};

export default function ProjectStory({ caseStudy, sectionStart }: ProjectStoryProps) {
  if (!caseStudy) return null;

  return (
    <>
      <section className={styles.approachSection} aria-labelledby="approach-title">
        <div className={styles.containerWide}>
          <div className={`${styles.approachHeading} tp_fade_anim`}>
            <div>
              <span className={styles.sectionIndex} aria-hidden="true">
                {String(sectionStart).padStart(2, "0")}
              </span>
              <p className={styles.eyebrow}>Challenge &amp; response</p>
            </div>
            <h2 id="approach-title">Turning constraints into a working system.</h2>
          </div>

          <div className={styles.narrativeGrid}>
            <article className={`${styles.narrativePanel} ${styles.challengePanel} tp_fade_anim`}>
              <div className={styles.narrativePanelHeading}>
                <span aria-hidden="true">01</span>
                <h3>The challenge</h3>
              </div>
              <div className={styles.narrativeList}>
                {caseStudy.challenge.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
            <article className={`${styles.narrativePanel} ${styles.solutionPanel} tp_fade_anim`}>
              <div className={styles.narrativePanelHeading}>
                <span aria-hidden="true">02</span>
                <h3>The response</h3>
              </div>
              <ol className={styles.solutionList} role="list">
                {caseStudy.solution.map((item, index) => (
                  <li key={item}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <p>{item}</p>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.capabilitiesSection} aria-labelledby="capabilities-title">
        <div className={styles.containerWide}>
          <div className={`${styles.sectionHeading} tp_fade_anim`}>
            <div>
              <span className={styles.sectionIndex} aria-hidden="true">
                {String(sectionStart + 1).padStart(2, "0")}
              </span>
              <p className={styles.eyebrow}>Product capabilities</p>
            </div>
            <div>
              <h2 id="capabilities-title">What the delivery makes possible.</h2>
              <p>Each capability connects a product requirement to something people can use.</p>
            </div>
          </div>

          <div className={styles.capabilityGrid}>
            {caseStudy.features.map((feature, index) => (
              <article
                className={`${styles.capabilityCard} tp_fade_anim`}
                data-delay={String(Math.min(index * 0.06, 0.3))}
                key={feature.title}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>

          {caseStudy.architecture?.length ? (
            <div className={styles.architectureLayout}>
              <div className={`${styles.architectureHeading} tp_fade_anim`}>
                <p className={styles.eyebrow}>System architecture</p>
                <h2>A connected delivery, not isolated features.</h2>
              </div>
              <ol className={styles.architectureSteps} role="list">
                {caseStudy.architecture.map((step, index) => (
                  <li className="tp_fade_anim" key={step}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <div className={styles.impactArea}>
            <div className={`${styles.impactHeading} tp_fade_anim`}>
              <p className={styles.eyebrow}>Delivered impact</p>
              <h2>What changed after the build.</h2>
            </div>
            <ol className={styles.impactList} role="list">
              {caseStudy.impact.map((impact, index) => (
                <li className="tp_fade_anim" key={impact}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <p>{impact}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
