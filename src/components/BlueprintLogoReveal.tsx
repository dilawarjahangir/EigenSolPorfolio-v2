import type { CSSProperties } from "react";
import styles from "./BlueprintLogoReveal.module.css";

type BlueprintLogoRevealProps = {
  size?: number | string;
  duration?: number;
  delay?: number;
  loop?: boolean;
  background?: "transparent" | "light" | "dark";
  className?: string;
};

type AnimationVariables = CSSProperties & {
  "--logo-duration": string;
  "--logo-delay": string;
  "--logo-iterations": string;
};

/*
 * Every shape is explicitly closed with an L command.
 * This ensures the final line is included in the animation.
 */
const topPath = `
  M275.503 0.58881
  L202.656 73.6009
  L104.623 73.6009
  L52.8409 125.416
  L0 72.5413
  L72.4944 0
  L275.503 0.58881
`;

const middlePath = `
  M181.457 97.0443
  L136.736 141.794
  L70.832 141.794
  L114.611 97.9863
  L181.457 97.0443
`;

const bottomPath = `
  M254.319 185.012
  L183.943 255.316
  L70.1405 255.316
  L0 185.247
  L0 97.0443
  L88.1465 185.247
  L254.319 185.012
`;

export default function BlueprintLogoReveal({
  size = 420,
  duration = 4,
  delay = 0,
  loop = false,
  background = "transparent",
  className = "",
}: BlueprintLogoRevealProps) {
  const animationStyles: AnimationVariables = {
    width: typeof size === "number" ? `${size}px` : size,
    "--logo-duration": `${duration}s`,
    "--logo-delay": `${delay}s`,
    "--logo-iterations": loop ? "infinite" : "1",
  };

  return (
    <div
      className={`${styles.reveal} ${styles[background]} ${className}`.trim()}
      style={animationStyles}
    >
      <svg
        className={styles.svg}
        viewBox="-5 -5 286 266"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Animated EigenSol logo outline"
      >
        <g className={styles.logo}>
          <path
            className={`${styles.outline} ${styles.bottomOutline}`}
            d={bottomPath}
          />

          <path
            className={`${styles.outline} ${styles.middleOutline}`}
            d={middlePath}
          />

          <path
            className={`${styles.outline} ${styles.topOutline}`}
            d={topPath}
          />
        </g>
      </svg>
    </div>
  );
}