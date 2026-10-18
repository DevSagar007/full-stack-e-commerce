import type { MetadataRoute } from "next";
import { getAllProductSlugs } from "@/services/product.service";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllProductSlugs();
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    ...slugs.map((slug) => ({ url: `${SITE_URL}/products/${slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
