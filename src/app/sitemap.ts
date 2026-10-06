import type { MetadataRoute } from "next";
import { loadTracks, loadVideos, loadShows } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.intheloop.agency";
  const now = new Date();

  const staticRoutes = [
    { url: `${baseUrl}/es`, lastModified: now },
    { url: `${baseUrl}/en`, lastModified: now },
    { url: `${baseUrl}/es#music`, lastModified: now },
    { url: `${baseUrl}/es#videos`, lastModified: now },
    { url: `${baseUrl}/es#shows`, lastModified: now },
    { url: `${baseUrl}/es#booking`, lastModified: now },
  ];

  const tracks = loadTracks();
  const videos = loadVideos();
  const shows = loadShows();

  const trackRoutes = tracks.map((t) => ({
    url: `${baseUrl}/es#${t.id}`,
    lastModified: t.date ? new Date(t.date) : now,
  }));

  const videoRoutes = videos.map((v) => ({
    url: `${baseUrl}/es#${v.id}`,
    lastModified: v.date ? new Date(v.date) : now,
  }));

  const showRoutes = shows.map((s) => ({
    url: `${baseUrl}/es#${s.id}`,
    lastModified: s.date ? new Date(s.date) : now,
  }));

  return [...staticRoutes, ...trackRoutes, ...videoRoutes, ...showRoutes];
}
