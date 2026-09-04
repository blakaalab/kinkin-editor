import imageLoadingPlaceholder from "@/assets/image-loading-placeholder.svg";

const COMPLETE_IMG_TAG =
  /<img\s+[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?[^>]*\/?>/gi;
const ALT_ATTR = /alt="([^"]*)"/i;

const IMAGE_PLACEHOLDER = `![image-loading-placeholder](${imageLoadingPlaceholder})`;

/** Convert streamed img tags to markdown and replace incomplete images with placeholders. */
function safeSearchEnd(text: string): number {
  let inside = false;
  let idx = 0;
  let boundary = text.length;

  while (idx < text.length) {
    const fence = text.indexOf("```", idx);
    if (fence === -1) break;
    if (!inside) {
      inside = true;
      boundary = fence;
    } else {
      inside = false;
      boundary = text.length;
    }
    idx = fence + 3;
  }

  return boundary;
}

export function preprocessStreamedContent(buffer: string): string {
  let result = buffer.replace(COMPLETE_IMG_TAG, (_match, src, _alt, offset) => {
    if (offset < safeSearchEnd(buffer)) {
      const altMatch = _match.match(ALT_ATTR);
      const alt = altMatch?.[1] ?? "";
      return `![${alt}](${src})`;
    }
    return _match;
  });

  let safe = safeSearchEnd(result);

  // Handle incomplete <img ... tags (only outside code blocks)
  const incompleteImgIdx = result.slice(0, safe).lastIndexOf("<img");
  if (incompleteImgIdx !== -1) {
    const afterImg = result.slice(incompleteImgIdx, safe);
    if (!afterImg.includes(">")) {
      result =
        result.slice(0, incompleteImgIdx) +
        IMAGE_PLACEHOLDER +
        result.slice(safe);
      safe = safeSearchEnd(result);
    }
  }

  // Handle incomplete markdown images: ![...](...
  const lastMdImg = result.slice(0, safe).lastIndexOf("![");
  if (lastMdImg !== -1) {
    const afterMdImg = result.slice(lastMdImg, safe);
    const parenOpen = afterMdImg.indexOf("](");
    if (parenOpen === -1) {
      result =
        result.slice(0, lastMdImg) + IMAGE_PLACEHOLDER + result.slice(safe);
    } else {
      const afterParen = afterMdImg.slice(parenOpen + 2);
      if (!afterParen.includes(")")) {
        result =
          result.slice(0, lastMdImg) + IMAGE_PLACEHOLDER + result.slice(safe);
      }
    }
  }

  return result;
}
