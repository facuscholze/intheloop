import type { MetadataRoute } from "next";

// Requerido por output: "export"
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.intheloop.agency").replace(/\/$/, "");
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const baseUrl = `${origin}${basePath}`;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/_next/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
