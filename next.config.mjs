/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repository = process.env.GITHUB_REPOSITORY ?? "";
const repoName = repository.split("/")[1] ?? "";
const isUserOrOrgPage = repoName.endsWith(".github.io");
const basePath =
  isGithubActions && repoName && !isUserOrOrgPage ? `/${repoName}` : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
