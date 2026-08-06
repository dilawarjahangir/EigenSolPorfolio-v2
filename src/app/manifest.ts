import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EigenSol",
    short_name: "EigenSol",
    description:
      "Custom software, web, mobile, AI, cloud, and product engineering services.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ff7744",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
