"use client";

import { useCallback } from "react";
import BackToTopLink from "./BackToTopLink";
import { useFooterScrollTarget } from "./HomeScrollControl";

type FooterBackToTopTargetProps = {
  className: string;
  linkClassName: string;
};

export default function FooterBackToTopTarget({
  className,
  linkClassName,
}: FooterBackToTopTargetProps) {
  const registerFooterTarget = useFooterScrollTarget();
  const targetRef = useCallback(
    (element: HTMLDivElement | null) => registerFooterTarget(element),
    [registerFooterTarget],
  );

  return (
    <div ref={targetRef} id="footer-back-to-top" className={className}>
      <BackToTopLink className={linkClassName}>
        {"EigenSol I\u2019ve gone too far, send me back up \uD83D\uDC46"}
      </BackToTopLink>
    </div>
  );
}
