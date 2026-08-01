"use client";

import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import FloatingSocialLinks from "./FloatingSocialLinks";
import styles from "./HomeScrollControl.module.css";

type ControlState = "down" | "up";
type RegisterFooterTarget = (element: HTMLElement | null) => void;

const FooterScrollTargetContext = createContext<RegisterFooterTarget>(() => undefined);

export const useFooterScrollTarget = () => useContext(FooterScrollTargetContext);

type HomeScrollControlProps = {
  children: ReactNode;
};

export default function HomeScrollControl({ children }: HomeScrollControlProps) {
  const [footerTarget, setFooterTarget] = useState<HTMLElement | null>(null);
  const registerFooterTarget = useCallback<RegisterFooterTarget>((element) => {
    setFooterTarget(element);
  }, []);

  return (
    <FooterScrollTargetContext.Provider value={registerFooterTarget}>
      {children}
      <FloatingSocialLinks />
      <FloatingScrollControl footerTarget={footerTarget} />
    </FooterScrollTargetContext.Provider>
  );
}

type FloatingScrollControlProps = {
  footerTarget: HTMLElement | null;
};

function FloatingScrollControl({ footerTarget }: FloatingScrollControlProps) {
  const controlRef = useRef<HTMLButtonElement>(null);
  const isDockedRef = useRef(false);
  const [controlState, setControlState] = useState<ControlState>("down");
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    const updateState = () => {
      setControlState(window.scrollY > window.innerHeight * 0.45 ? "up" : "down");
    };

    updateState();
    window.addEventListener("scroll", updateState, { passive: true });

    return () => window.removeEventListener("scroll", updateState);
  }, []);

  useLayoutEffect(() => {
    const control = controlRef.current;

    if (!control || !footerTarget) return;

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeTimeline: gsap.core.Timeline | null = null;

    gsap.set(footerTarget, { autoAlpha: 0 });

    const getMorphGeometry = () => {
      const controlRect = control.getBoundingClientRect();
      const targetRect = footerTarget.getBoundingClientRect();

      return {
        x:
          controlRect.left + controlRect.width / 2 -
          (targetRect.left + targetRect.width / 2),
        y:
          controlRect.top + controlRect.height / 2 -
          (targetRect.top + targetRect.height / 2),
        scaleX: targetRect.width > 0 ? controlRect.width / targetRect.width : 1,
        scaleY: targetRect.height > 0 ? controlRect.height / targetRect.height : 1,
      };
    };

    const dockControl = () => {
      if (isDockedRef.current) return;
      isDockedRef.current = true;
      setIsDocked(true);

      if (reducedMotion) {
        gsap.set(control, { autoAlpha: 0 });
        gsap.set(footerTarget, {
          clearProps: "opacity,visibility,transform,transformOrigin",
        });
        return;
      }

      activeTimeline?.kill();
      gsap.killTweensOf([control, footerTarget]);

      const morph = getMorphGeometry();

      gsap.set(control, { autoAlpha: 1, pointerEvents: "none", scale: 1, rotate: 0 });
      gsap.set(footerTarget, {
        autoAlpha: 0,
        x: morph.x,
        y: morph.y,
        scaleX: morph.scaleX,
        scaleY: morph.scaleY,
        transformOrigin: "center center",
      });

      activeTimeline = gsap
        .timeline({
          onComplete: () => {
            gsap.set(footerTarget, {
              clearProps: "opacity,visibility,transform,transformOrigin",
            });
          },
        })
        .to(
          footerTarget,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 0.65,
            ease: "power3.inOut",
          },
          0,
        )
        .to(
          control,
          {
            autoAlpha: 0,
            scale: 0.55,
            rotate: 180,
            duration: 0.38,
            ease: "power2.inOut",
          },
          0.08,
        );
    };

    const undockControl = () => {
      if (!isDockedRef.current) return;
      isDockedRef.current = false;
      setIsDocked(false);

      if (reducedMotion) {
        gsap.set(control, { clearProps: "opacity,visibility,transform,pointerEvents" });
        gsap.set(footerTarget, {
          autoAlpha: 0,
          clearProps: "transform,transformOrigin",
        });
        return;
      }

      activeTimeline?.kill();
      gsap.killTweensOf([control, footerTarget]);

      const morph = getMorphGeometry();

      gsap.set(control, {
        autoAlpha: 0,
        scale: 0.55,
        rotate: 180,
        pointerEvents: "none",
      });
      gsap.set(footerTarget, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        transformOrigin: "center center",
      });

      activeTimeline = gsap
        .timeline({
          onComplete: () => {
            gsap.set(control, {
              clearProps: "opacity,visibility,transform,pointerEvents",
            });
            gsap.set(footerTarget, {
              autoAlpha: 0,
              clearProps: "transform,transformOrigin",
            });
          },
        })
        .to(
          footerTarget,
          {
            autoAlpha: 0,
            x: morph.x,
            y: morph.y,
            scaleX: morph.scaleX,
            scaleY: morph.scaleY,
            duration: 0.58,
            ease: "power3.inOut",
          },
          0,
        )
        .to(
          control,
          {
            autoAlpha: 1,
            scale: 1,
            rotate: 360,
            duration: 0.4,
            ease: "back.out(1.7)",
          },
          0.18,
        );
    };

    const footerTrigger = ScrollTrigger.create({
      trigger: footerTarget,
      start: () => `top ${Math.round(control.getBoundingClientRect().top)}px`,
      end: "bottom top+=24",
      invalidateOnRefresh: true,
      onEnter: dockControl,
      onLeave: undockControl,
      onEnterBack: dockControl,
      onLeaveBack: undockControl,
    });

    return () => {
      footerTrigger.kill();
      activeTimeline?.kill();
      isDockedRef.current = false;
      gsap.set(footerTarget, {
        clearProps: "opacity,visibility,transform,transformOrigin",
      });
      gsap.set(control, { clearProps: "all" });
    };
  }, [footerTarget]);

  const handleClick = () => {
    const smoother = ScrollSmoother.get();
    const target = controlState === "down" ? "#site-footer" : 0;

    if (smoother) {
      smoother.scrollTo(target, true, "top top");
      return;
    }

    if (target === 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.location.hash = "site-footer";
  };

  return (
    <button
      ref={controlRef}
      className={styles.control}
      type="button"
      onClick={handleClick}
      aria-label={controlState === "down" ? "Scroll to footer" : "Back to top"}
      aria-hidden={isDocked}
      tabIndex={isDocked ? -1 : 0}
    >
      <span className={styles.icon} aria-hidden="true">
        {controlState === "down" ? <ArrowDown /> : <ArrowUp />}
      </span>
    </button>
  );
}
