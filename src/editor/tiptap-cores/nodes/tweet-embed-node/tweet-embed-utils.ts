export interface TweetEmbedSource {
  id: string;
  /** The canonical link: what the document stores and markdown carries. */
  url: string;
  /** The iframe `src`. Built from the id alone, never from the input. */
  embedUrl: string;
}

const TWEET_ID = /^\d{1,20}$/;
const HANDLE = /^[A-Za-z0-9_]{1,15}$/;

const POST_HOSTS = new Set([
  "x.com",
  "www.x.com",
  "mobile.x.com",
  "twitter.com",
  "www.twitter.com",
  "mobile.twitter.com",
]);

/** Where the embed is served from, and the only origin its messages count from. */
export const TWEET_EMBED_ORIGIN = "https://platform.twitter.com";

const pathSegments = (url: URL): string[] =>
  url.pathname.split("/").filter(Boolean);

const toUrl = (input: string): URL | null => {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  try {
    // A pasted link often has no scheme: `x.com/user/status/123`.
    const url = new URL(
      /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`,
    );
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
};

const tweet = (id: string, handle?: string): TweetEmbedSource | null =>
  TWEET_ID.test(id)
    ? {
        id,
        // `/i/status/…` reaches the post without knowing who wrote it.
        url:
          handle && HANDLE.test(handle) && handle !== "i"
            ? `https://x.com/${handle}/status/${id}`
            : `https://x.com/i/status/${id}`,
        // `dnt`: X is asked not to use the embed for personalisation.
        embedUrl: `${TWEET_EMBED_ORIGIN}/embed/Tweet.html?id=${id}&dnt=true`,
      }
    : null;

/**
 * Reads a link to a post on X (or Twitter, as it was): `x.com/user/status/123`,
 * with or without its scheme, on any of the old and new hosts, including
 * `/i/web/status/123` and the `/photo/1` and `/video/1` links into a post's
 * media. The embed iframe's own `platform.twitter.com/embed/Tweet.html?id=…`
 * is read too, so pasted embed code works. Anything else — a profile, a list,
 * a search, a `t.co` short link — is `null`.
 *
 * Every embed is validated through here, on the way into a document and again
 * on the way out, so a node can never render an iframe pointing anywhere else.
 */
export const parseTweetUrl = (input: string): TweetEmbedSource | null => {
  const url = toUrl(input);

  if (!url) {
    return null;
  }

  if (url.origin === TWEET_EMBED_ORIGIN) {
    const [first, second] = pathSegments(url);
    return first === "embed" && second === "Tweet.html"
      ? tweet(url.searchParams.get("id") ?? "")
      : null;
  }

  if (!POST_HOSTS.has(url.hostname)) {
    return null;
  }

  const [first, second, third, fourth] = pathSegments(url);

  // `/i/web/status/123`.
  if (first === "i" && second === "web" && third === "status" && fourth) {
    return tweet(fourth);
  }

  // `/user/status/123`, `/i/status/123`, and the older `/statuses/`.
  if (first && (second === "status" || second === "statuses") && third) {
    return tweet(third, first);
  }

  return null;
};

/**
 * The height an embed asks for, from a message its iframe posted: once it has
 * laid out the post, and again whenever that changes — a photo loading, a
 * longer translation. `null` for any other message.
 *
 * The caller must check the message came from the iframe it is resizing.
 */
export const readTweetEmbedHeight = (event: MessageEvent): number | null => {
  if (event.origin !== TWEET_EMBED_ORIGIN) {
    return null;
  }

  let data: unknown = event.data;

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }

  const message = (data as { "twttr.embed"?: unknown } | null)?.[
    "twttr.embed"
  ] as { method?: unknown; params?: unknown } | undefined;

  if (
    message?.method !== "twttr.private.resize" ||
    !Array.isArray(message.params)
  ) {
    return null;
  }

  const height = (message.params[0] as { height?: unknown } | undefined)
    ?.height;

  return typeof height === "number" && Number.isFinite(height) && height > 0
    ? Math.ceil(height)
    : null;
};

/**
 * Lets the X posts in rendered HTML grow to fit. An embedded post only knows
 * its height once it has loaded, and says so in a message to the page; until
 * something listens, it shows at a fixed height that may cut it off.
 *
 * Call it once the HTML is in the DOM, with the element it was rendered into.
 * It returns a function that stops listening — call it when that element goes.
 * Posts added to the element later are picked up without calling it again.
 */
export const resizeTweetEmbeds = (
  root: ParentNode = document,
): (() => void) => {
  const onMessage = (event: MessageEvent) => {
    const height = readTweetEmbedHeight(event);

    if (height === null) {
      return;
    }

    for (const iframe of root.querySelectorAll<HTMLIFrameElement>(
      '[data-type="tweetEmbed"] iframe',
    )) {
      if (iframe.contentWindow === event.source) {
        iframe.style.height = `${height}px`;
        return;
      }
    }
  };

  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
};
