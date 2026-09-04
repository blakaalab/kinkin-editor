import type { Node } from "@tiptap/pm/model";

import type { SuggestionItem } from "./index";

export const calculateStartPosition = (
  cursorPosition: number,
  previousNode: Node | null,
  triggerChar?: string,
): number => {
  if (!previousNode?.text || !triggerChar) {
    return cursorPosition;
  }

  const commandText = previousNode.text;
  const triggerCharIndex = commandText.lastIndexOf(triggerChar);

  if (triggerCharIndex === -1) {
    return cursorPosition;
  }

  return cursorPosition - commandText.substring(triggerCharIndex).length;
};

export const filterSuggestionItems = (
  items: SuggestionItem[],
  query: string,
) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items
    .filter(
      (item) =>
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.subtext?.toLowerCase().includes(normalizedQuery) ||
        item.keywords?.some((k) => k.toLowerCase().includes(normalizedQuery)) ||
        item.aliases?.some((a) => a.toLowerCase().includes(normalizedQuery)),
    )
    .sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const scoreA =
        (aTitle === normalizedQuery ? 2 : 0) +
        (aTitle.startsWith(normalizedQuery) ? 1 : 0);
      const scoreB =
        (bTitle === normalizedQuery ? 2 : 0) +
        (bTitle.startsWith(normalizedQuery) ? 1 : 0);
      return scoreB - scoreA;
    });
};
