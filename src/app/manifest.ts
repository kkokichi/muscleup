import type { MetadataRoute } from "next";

const basePath = process.env.GITHUB_PAGES === "true" ? "/muscleup" : "";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MuscleUp",
    short_name: "MuscleUp",
    description: "ジムが楽しくなる筋トレ記録アプリ",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    orientation: "portrait",
    icons: [
      {
        src: `${basePath}/muscleup-icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
