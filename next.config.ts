import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 親ディレクトリのlockfileによるworkspace root誤認識と、
  // 非ASCIIパスでのTurbopackの不具合を避けるため明示する
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
