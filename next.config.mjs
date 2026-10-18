const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/grammarlyisdead";
export default {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // /f/<id> style public routes live under the same basePath.
  poweredByHeader: false,
  // PostHog reverse proxy (<basePath>/ingest → PostHog) so ad blockers don't drop events; keep /ingest/e/ trailing slashes.
  skipTrailingSlashRedirect: true,
  async rewrites() { return [{ source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" }, { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" }]; },
};
