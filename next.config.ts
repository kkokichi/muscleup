import path from "node:path";
import type { NextConfig } from "next";

// GitHub Pages（https://<user>.github.io/muscleup/）配信時のみ basePath を付ける
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // GitHub Pages向けの完全静的エクスポート
  output: "export",
  basePath: isGitHubPages ? "/muscleup" : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  // 親ディレクトリのlockfileによるworkspace root誤認識と、
  // 非ASCIIパスでのTurbopackの不具合を避けるため明示する
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
