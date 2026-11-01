/** Accept a YouTube ID or a public watch/share/shorts/live URL from the CMS. */
export function youtubeIdFromValue(value: string): string | null {
  const input = value.trim();
  if (/^[\w-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.split("/")[1];
    if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
      id = url.searchParams.get("v");
      if (!id && /^\/(embed|shorts|live)\//.test(url.pathname)) id = url.pathname.split("/")[2];
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function cinemaSource(video: { src: string | null; previewSrc: string | null }): string | null {
  return video.src || video.previewSrc || null;
}
