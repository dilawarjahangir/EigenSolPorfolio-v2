import Image from "next/image";
import { Fragment } from "react";
import styles from "./FunFactsSection.module.css";

type FunFactImage = {
  src: string;
  delay?: number;
};

type FunFactPanel = {
  id: number;
  tone: "orange" | "pink" | "yellow";
  subtitle: string;
  title: readonly string[];
  images: readonly FunFactImage[];
  secondaryImages?: readonly FunFactImage[];
  bigImage?: FunFactImage;
  number: string;
};

const placeholder = "/agntix-home/funfact/funfact-placeholder.png";

const panels: readonly FunFactPanel[] = [
  {
    id: 1,
    tone: "orange",
    subtitle: "( Nice! )",
    title: ["projects", "completed", "in 24 countries"],
    images: [
      { src: "/agntix-home/funfact/funfact-1.png", delay: 0.3 },
      { src: placeholder, delay: 0.5 },
      { src: placeholder, delay: 0.7 },
      { src: placeholder, delay: 0.9 },
      { src: placeholder, delay: 1 },
      { src: "/agntix-home/funfact/funfact-2.png", delay: 1.1 },
      { src: "/agntix-home/funfact/funfact-3.png", delay: 1.2 },
      { src: placeholder, delay: 1.3 },
    ],
    secondaryImages: [
      { src: placeholder, delay: 1.4 },
      { src: "/agntix-home/funfact/funfact-4.png", delay: 1.5 },
      { src: "/agntix-home/funfact/funfact-5.png", delay: 1.6 },
      { src: placeholder, delay: 1.7 },
    ],
    bigImage: { src: "/agntix-home/funfact/funfact-6.png", delay: 0.7 },
    number: "106",
  },
  {
    id: 2,
    tone: "pink",
    subtitle: "( Ho Ho! )",
    title: ["Clients", "satisfied and", "repeating"],
    images: [
      { src: "/agntix-home/funfact/funfact-1.png", delay: 0.3 },
      { src: "/agntix-home/funfact/funfact-8.png", delay: 0.5 },
      { src: "/agntix-home/funfact/funfact-9.png", delay: 0.7 },
      { src: placeholder, delay: 0.9 },
      { src: placeholder, delay: 1 },
      { src: "/agntix-home/funfact/funfact-2.png", delay: 1.1 },
      { src: placeholder, delay: 1.2 },
      { src: placeholder, delay: 1.3 },
    ],
    secondaryImages: [
      { src: placeholder, delay: 1.4 },
      { src: "/agntix-home/funfact/funfact-4.png", delay: 1.5 },
      { src: placeholder, delay: 1.6 },
      { src: "/agntix-home/funfact/funfact-5.png", delay: 1.7 },
    ],
    bigImage: { src: "/agntix-home/funfact/funfact-7.png", delay: 0.7 },
    number: "96",
  },
  {
    id: 3,
    tone: "yellow",
    subtitle: "( Holy Moly! )",
    title: ["Performing video"],
    images: [
      { src: "/agntix-home/funfact/funfact-1.png" },
      { src: "/agntix-home/funfact/funfact-2.png" },
      { src: "/agntix-home/funfact/funfact-3.png" },
      { src: "/agntix-home/funfact/funfact-4.png" },
      { src: placeholder },
      { src: placeholder },
      { src: placeholder },
      { src: placeholder },
    ],
    number: "#1Top",
  },
];

const toneClasses = {
  orange: "",
  pink: styles.pink,
  yellow: styles.yellow,
} as const;

const titleScales: Record<string, number> = {
  projects: 0.90797,
  completed: 0.91184,
  "in 24 countries": 0.8928,
  Clients: 0.89923,
  "satisfied and": 0.89362,
  repeating: 0.90159,
  "Performing video": 0.90151,
};

function renderImage(image: FunFactImage, secondary = false) {
  const animationClass = image.delay === undefined ? "" : "tp_fade_anim";

  return (
    <div
      className={`${secondary ? styles.secondaryImageCell : styles.topImageCell}`}
    >
      <div
        className={`${styles.imageWrap} ${animationClass}`}
        data-delay={image.delay}
      >
        <Image
          className={styles.smallImage}
          src={image.src}
          alt=""
          aria-hidden="true"
          width={146}
          height={146}
          loading="eager"
          unoptimized
        />
      </div>
    </div>
  );
}

export default function FunFactsSection() {
  return (
    <section className={`${styles.area} tp-funfact-area`} aria-label="Company achievements">
      <div className={`${styles.panelWrap} tp-funfact-panel-wrap`}>
        {panels.map((panel) => (
          <article className={`${styles.panel} tp-funfact-panel`} key={panel.id}>
            <div
              className={`${styles.panelInner} ${toneClasses[panel.tone]} tp-text-bounce-trigger`}
            >
              <div className={styles.container}>
                <div className={styles.row}>
                  <div className={`${styles.column} ${styles.halfColumn}`}>
                    <div className={styles.imageGrid}>
                      {panel.images.map((image, index) => (
                        <Fragment key={`${panel.id}-top-${image.src}-${image.delay}-${index}`}>
                          {renderImage(image)}
                        </Fragment>
                      ))}
                    </div>
                  </div>

                  <div className={`${styles.column} ${styles.halfColumn}`}>
                    <div className={styles.contentWrap}>
                      <div>
                        <span className={styles.subtitle}>{panel.subtitle}</span>
                        <h3 className={styles.title}>
                          {panel.title.map((line, index) => (
                            <Fragment key={line}>
                              <span style={{ transform: `scaleX(${titleScales[line]})` }}>
                                {line}
                              </span>
                              {index < panel.title.length - 1 && <br />}
                            </Fragment>
                          ))}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.bottomWrap}>
                  <div className={styles.row}>
                    {(panel.secondaryImages || panel.bigImage) && (
                      <div className={`${styles.column} ${styles.halfColumn}`}>
                        <div className={styles.row}>
                          {panel.secondaryImages && (
                            <div className={`${styles.column} ${styles.secondaryColumn}`}>
                              <div className={styles.imageGrid}>
                                {panel.secondaryImages.map((image, index) => (
                                  <Fragment
                                    key={`${panel.id}-secondary-${image.src}-${image.delay}-${index}`}
                                  >
                                    {renderImage(image, true)}
                                  </Fragment>
                                ))}
                              </div>
                            </div>
                          )}

                          {panel.bigImage && (
                            <div className={`${styles.column} ${styles.bigImageColumn}`}>
                              <div
                                className={`${styles.bigImageWrap} tp-text-bounce`}
                                data-delay={panel.bigImage.delay}
                              >
                                <Image
                                  src={panel.bigImage.src}
                                  alt=""
                                  aria-hidden="true"
                                  width={300}
                                  height={300}
                                  loading="eager"
                                  unoptimized
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className={`${styles.column} ${styles.halfColumn}`}>
                      <div className={styles.contentWrap}>
                        <div className={styles.number} aria-label={panel.number}>
                          <span aria-hidden="true">
                            {panel.number.split("").map((character, index) => (
                              <span
                                key={`${panel.id}-${character}`}
                                className={
                                  panel.number.includes("#")
                                    ? styles.staticCharacter
                                    : `${styles.numberCharacter} tp-text-bounce`
                                }
                                data-delay={1 + index * 0.3}
                              >
                                {character}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
