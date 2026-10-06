/**
 * Resuelve URL de media: local /public/media o CDN via env.
 * No commitear audios/videos pesados, usar bucket.
 */
export function getMediaUrl(src?: string | null): string | null {
  if (!src) return null;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  // Prefijo de ruta (GitHub Pages: /<repo>). Vacío en dominio raíz.
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/$/, "") || "";
  if (base) {
    // si src ya es absoluta desde /media, concatenar
    const clean = src.replace(/^\//, "");
    // si clean ya incluye media/, respetar
    return `${base}/${clean}`;
  }
  // local: asegurar que empiece con / (+ basePath si hay)
  const local = src.startsWith("/") ? src : `/media/${src.replace(/^\/?media\//, "")}`;
  return `${basePath}${local}`;
}

export function isExternalEmbed(src?: string | null): boolean {
  if (!src) return false;
  return src.includes("soundcloud.com") || src.includes("youtube.com") || src.includes("youtu.be");
}
