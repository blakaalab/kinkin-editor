export type VideoProvider = "youtube" | "tiktok";

export interface VideoEmbedSource {
  provider: VideoProvider;
  id: string;
  /** The canonical link: what the document stores and markdown carries. */
  url: string;
  /** The iframe `src`. Built from the id alone, never from the input. */
  embedUrl: string;
  /** Shorts and TikToks are shot vertically and embed at 9:16. */
  portrait: boolean;
  /** The iframe's accessible name. */
  title: string;
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const TIKTOK_ID = /^\d{1,32}$/;
const TIKTOK_HANDLE = /^@[A-Za-z0-9._]{1,64}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

const TIKTOK_HOSTS = new Set(["tiktok.com", "www.tiktok.com", "m.tiktok.com"]);

/** `/embed/abc` is the same video as `/embed/abc/`; empty segments go. */
const pathSegments = (url: URL): string[] =>
  url.pathname.split("/").filter(Boolean);

const toUrl = (input: string): URL | null => {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  try {
    // A pasted link often has no scheme: `youtu.be/abc`.
    const url = new URL(
      /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
};

const youtube = (id: string, portrait: boolean): VideoEmbedSource | null =>
  YOUTUBE_ID.test(id)
    ? {
        provider: "youtube",
        id,
        url: portrait
          ? `https://www.youtube.com/shorts/${id}`
          : `https://www.youtube.com/watch?v=${id}`,
        // The privacy-enhanced host: no cookies until the viewer presses play.
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
        portrait,
        title: "YouTube video",
      }
    : null;

const tiktok = (id: string, handle?: string): VideoEmbedSource | null =>
  TIKTOK_ID.test(id)
    ? {
        provider: "tiktok",
        id,
        // An embed link carries no handle, and the video page needs one; the
        // embed page is the one public page reachable from the id alone.
        url:
          handle && TIKTOK_HANDLE.test(handle)
            ? `https://www.tiktok.com/${handle}/video/${id}`
            : `https://www.tiktok.com/embed/v2/${id}`,
        embedUrl: `https://www.tiktok.com/player/v1/${id}`,
        portrait: true,
        title: "TikTok video",
      }
    : null;

const parseYoutube = (url: URL): VideoEmbedSource | null => {
  const [first, second] = pathSegments(url);

  if (url.hostname === "youtu.be") {
    return first ? youtube(first, false) : null;
  }

  if (!YOUTUBE_HOSTS.has(url.hostname)) {
    return null;
  }

  switch (first) {
    case "watch":
      return youtube(url.searchParams.get("v") ?? "", false);
    case "shorts":
      return second ? youtube(second, true) : null;
    case "embed":
    case "live":
    case "v":
      return second ? youtube(second, false) : null;
    default:
      return null;
  }
};

const parseTiktok = (url: URL): VideoEmbedSource | null => {
  if (!TIKTOK_HOSTS.has(url.hostname)) {
    return null;
  }

  const segments = pathSegments(url);
  const [first, second, third] = segments;

  // `/@handle/video/123`. A `/@handle/photo/123` slideshow has no player.
  if (first?.startsWith("@") && second === "video" && third) {
    return tiktok(third, first);
  }

  // `/embed/123`, `/embed/v2/123`, `/player/v1/123`.
  if (first === "embed" || first === "player") {
    const id = segments.at(-1);
    return id && segments.length <= 3 ? tiktok(id) : null;
  }

  // The old mobile share link: `m.tiktok.com/v/123.html`.
  if (first === "v" && second) {
    return tiktok(second.replace(/\.html$/, ""));
  }

  return null;
};

/**
 * Reads a YouTube or TikTok video link: a watch, share or embed URL, with or
 * without its scheme. Anything else — another site, a channel, a playlist, a
 * TikTok short link that only resolves by following a redirect — is `null`.
 *
 * Every embed is validated through here, on the way into a document and again
 * on the way out, so a node can never render an iframe pointing anywhere else.
 */
export const parseVideoUrl = (input: string): VideoEmbedSource | null => {
  const url = toUrl(input);

  if (!url) {
    return null;
  }

  return parseYoutube(url) ?? parseTiktok(url);
};

/**
 * `vm.tiktok.com/…` and `tiktok.com/t/…` — the links the TikTok app's share
 * sheet hands out. They name no video until followed, which a browser cannot
 * do cross-origin, so they are recognised only to explain why they fail.
 */
export const isTiktokShortLink = (input: string): boolean => {
  const url = toUrl(input);

  if (!url) {
    return false;
  }

  return (
    url.hostname === "vm.tiktok.com" ||
    url.hostname === "vt.tiktok.com" ||
    (TIKTOK_HOSTS.has(url.hostname) && pathSegments(url)[0] === "t")
  );
};

/** Granted to the iframe. `fullscreen` here is what `allowfullscreen` was. */
export const VIDEO_EMBED_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share";

/**
 * YouTube refuses to play (error 153) without a referrer to check the
 * embedding site against, so this must not be tightened to `no-referrer`.
 */
export const VIDEO_EMBED_REFERRER_POLICY = "strict-origin-when-cross-origin";
