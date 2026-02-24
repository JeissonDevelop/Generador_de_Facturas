/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repository = process.env.GITHUB_REPOSITORY ?? "";
const repoName = repository.split("/")[1] ?? "";
const isUserOrOrgPage = repoName.endsWith(".github.io");
const useStaticExport = process.env.NEXT_STATIC_EXPORT === "true";
const basePath =
  useStaticExport && isGithubActions && repoName && !isUserOrOrgPage
    ? `/${repoName}`
    : "";

const nextConfig = {
  output: useStaticExport ? "export" : undefined,
  trailingSlash: useStaticExport,
  basePath: useStaticExport ? basePath : undefined,
  assetPrefix: useStaticExport ? basePath || undefined : undefined,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
