import type { Metadata } from "next";
import { connection } from "next/server";
import BlogCommentModeration from "./BlogCommentModeration";

export const metadata: Metadata = {
  title: { absolute: "Moderate Blog Comment | EigenSol" },
  description: "Review a pending EigenSol blog comment.",
  referrer: "no-referrer",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      noimageindex: true,
    },
  },
};

export default async function BlogCommentModerationPage() {
  await connection();
  return <BlogCommentModeration />;
}
