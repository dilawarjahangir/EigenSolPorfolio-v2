import type { ReactNode } from "react";
import CreativeStudioFooter from "../CreativeStudioFooter";
import Header from "../Header";

type SitePageShellProps = {
  children: ReactNode;
};

export default function SitePageShell({ children }: SitePageShellProps) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <CreativeStudioFooter />
    </>
  );
}
