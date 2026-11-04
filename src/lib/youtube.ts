/**
 * YOUTUBE — extracción, validación y URLs de embed/miniatura.
 *
 * Acepta: youtube.com/watch?v=ID, youtu.be/ID, /shorts/ID, /live/ID,
 * /embed/ID, /v/ID y el ID crudo (11 caracteres alfanuméricos, guion y guion bajo).
 * Un ID inválido devuelve null: nunca rompe la página.
 *
 * Nota: no se hace ningún request a YouTube desde acá; las URLs solo se arman
 * para renderizarlas en el cliente tras el primer clic del usuario.
 */

const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const EMBED_ORIGIN = "https://www.intheloop.agency";

/** Extrae el ID de video de una URL de YouTube o devuelve el ID crudo si ya lo es. */
export function extractYouTubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = input.trim();
  if (!s) return null;

  // ID crudo
  if (YT_ID_RE.test(s)) return s;

  // https://(www.)youtube.com(-nocookie).com/watch?v=ID&...
  let m = s.match(/[?&]v=([^#&?]+)/);
  if (m?.[1] && YT_ID_RE.test(m[1])) return m[1];

  // https://youtu.be/ID...
  m = s.match(/youtu\.be\/([^#&?]+)/i);
  if (m?.[1] && YT_ID_RE.test(m[1])) return m[1];

  // /shorts/ID, /live/ID, /embed/ID, /v/ID
  m = s.match(/(?:shorts|live|embed|v)\/([^#&?]+)/i);
  if (m?.[1] && YT_ID_RE.test(m[1])) return m[1];

  return null;
}

export function isValidYouTubeId(input: string | null | undefined): boolean {
  return extractYouTubeId(input) !== null;
}

export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeThumbnailMaxres(id: string): string {
  return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

/**
 * URL del iframe de YouTube (sin cookies de seguimiento).
 * El parámetro `autoplay` solo se activa tras un clic del usuario (Modo Cine),
 * por lo que nunca hay reproducción automática al cargar la página ni al hacer scroll.
 */
export function youtubeEmbedUrl(
  id: string,
  { autoplay = false }: { autoplay?: boolean } = {}
): string {
  const params = new URLSearchParams({
    rel: "0",
    playsinline: "1",
    enablejsapi: "1",
    origin: EMBED_ORIGIN,
  });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

let apiPromise: Promise<void> | null = null;

/**
 * Carga la IFrame API de YouTube bajo demanda (solo tras el primer clic).
 * Nunca se ejecuta al cargar la página ni al hacer scroll.
 */
export function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("sin window"));
  if (window.YT?.loaded) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const prevOnReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevOnReady?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("No se pudo cargar la API de YouTube"));
    document.head.appendChild(script);
  });
  return apiPromise;
}

/** Tipos del objeto YT global (inyectado por https://www.youtube.com/iframe_api). */
declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        options?: {
          videoId?: string;
          host?: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: unknown) => void;
            onStateChange?: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => {
        playVideo: () => void;
        pauseVideo: () => void;
        seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
        destroy: () => void;
        getVideoEmbedCode: () => string;
      };
      loaded: boolean;
      PlayerState?: {
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export {};
