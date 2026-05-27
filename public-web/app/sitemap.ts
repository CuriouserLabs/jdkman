import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "./site";

const routes = [
  "/",
  "/download",
  "/getting-started",
  "/guides/switch-java-version-windows",
  "/guides/fix-java-home-path-windows",
  "/guides/manage-multiple-jdks-windows",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/download" ? 0.9 : 0.8,
  }));
}
