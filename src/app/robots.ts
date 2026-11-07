import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://apiwatch.dev";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/status", "/login", "/register"],
      disallow: ["/dashboard/", "/monitors/", "/settings/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
