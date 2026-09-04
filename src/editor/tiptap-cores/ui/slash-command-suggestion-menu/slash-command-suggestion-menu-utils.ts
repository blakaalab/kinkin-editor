import type { Transaction } from "@tiptap/pm/state";
import type { Step } from "@tiptap/pm/transform";
import type { Editor } from "@tiptap/react";
import {
  CaseSensitive,
  CodeXml,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  ImageIcon,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Smile,
  Table2,
  TextQuote,
} from "lucide-react";

import { isNodeInSchema } from "../../lib/tiptap-utils";
import { addEmojiTrigger } from "../../ui/emoji-suggestion-menu/emoji-suggestion-menu-utils";
import type { SuggestionItem } from "../../ui/suggestion-menu";

interface TransactionSliceNode {
  type: string;
  text?: string;
  content?: TransactionSliceNode[];
}

const sliceNodeContainsChar = (
  node: TransactionSliceNode,
  char: string,
): boolean => {
  if (node.type === "text" && node.text?.includes(char)) {
    return true;
  }

  if (node.content) {
    return node.content.some((n) => sliceNodeContainsChar(n, char));
  }

  return false;
};

const getSliceNodeLength = (node: TransactionSliceNode): number => {
  if (node.type === "text") {
    return node.text?.length || 0;
  }

  if (node.content) {
    return (
      node.content.reduce((acc, child) => acc + getSliceNodeLength(child), 0) +
      2
    );
  }

  return 1;
};

export const wasSpaceJustTyped = (transaction: Transaction): boolean => {
  if (!transaction.docChanged) {
    return false;
  }

  for (let i = 0; i < transaction.steps.length; i++) {
    const step = transaction.steps[i] as Step;
    const stepJson = step.toJSON() as {
      stepType?: string;
      slice?: { content?: TransactionSliceNode[] };
    };

    if (
      stepJson.stepType === "replace" &&
      stepJson.slice?.content?.some((n) => sliceNodeContainsChar(n, " "))
    ) {
      return true;
    }
  }

  return false;
};

export const isSlashJustInserted = (
  transaction: Transaction,
  slashPos: number,
): boolean => {
  if (!transaction.docChanged) {
    return false;
  }

  for (let i = 0; i < transaction.steps.length; i++) {
    const step = transaction.steps[i] as Step;
    const stepJson = step.toJSON() as {
      stepType?: string;
      from?: number;
      slice?: { content?: TransactionSliceNode[] };
    };

    if (stepJson.stepType === "replace" && stepJson.from !== undefined) {
      const slice = stepJson.slice;

      if (slice?.content?.some((n) => sliceNodeContainsChar(n, "/"))) {
        const insertedLength = slice.content.reduce(
          (acc, node) => acc + getSliceNodeLength(node),
          0,
        );

        if (
          slashPos >= stepJson.from &&
          slashPos < stepJson.from + insertedLength
        ) {
          return true;
        }
      }
    }
  }

  return false;
};

export const getCurrentNodeTitle = (editor: Editor): string | null => {
  if (editor.isActive("heading", { level: 1 })) {
    return "Heading 1";
  }
  if (editor.isActive("heading", { level: 2 })) {
    return "Heading 2";
  }
  if (editor.isActive("heading", { level: 3 })) {
    return "Heading 3";
  }
  if (editor.isActive("heading", { level: 4 })) {
    return "Heading 4";
  }
  if (editor.isActive("bulletList")) {
    return "Bullet list";
  }
  if (editor.isActive("orderedList")) {
    return "Numbered list";
  }
  if (editor.isActive("taskList")) {
    return "Task list";
  }
  if (editor.isActive("blockquote")) {
    return "Quote";
  }
  if (editor.isActive("codeBlock")) {
    return "Code";
  }
  if (editor.isActive("paragraph")) {
    return "Paragraph";
  }

  return null;
};

export interface SlashMenuConfig {
  enabledItems?: SlashMenuItemType[];
  customItems?: SuggestionItem[];
}

const menuItemTexts = {
  text: {
    title: "Paragraph",
    aliases: ["p", "paragraph", "text"],
    badge: CaseSensitive,
  },
  heading_1: {
    title: "Heading 1",
    aliases: ["h", "heading1", "h1", "#"],
    badge: Heading1,
    shortcut: "#",
  },
  heading_2: {
    title: "Heading 2",
    aliases: ["h2", "heading2", "subheading", "##"],
    badge: Heading2,
    shortcut: "##",
  },
  heading_3: {
    title: "Heading 3",
    aliases: ["h3", "heading3", "subheading", "###"],
    badge: Heading3,
    shortcut: "###",
  },
  heading_4: {
    title: "Heading 4",
    aliases: ["h4", "heading4", "####"],
    badge: Heading4,
    shortcut: "####",
  },
  bullet_list: {
    title: "Bullet list",
    aliases: ["ul", "li", "list", "bulletlist", "bullet list", "-"],
    badge: List,
    shortcut: "-",
  },
  ordered_list: {
    title: "Numbered list",
    aliases: ["ol", "li", "list", "numberedlist", "numbered list", "1."],
    badge: ListOrdered,
    shortcut: "1.",
  },
  task_list: {
    title: "Task list",
    aliases: ["tasklist", "task list", "todo", "checklist", "[]"],
    badge: ListChecks,
    shortcut: "[]",
  },
  quote: {
    title: "Quote",
    aliases: ["quote", "blockquote", ">"],
    badge: TextQuote,
    shortcut: ">",
  },
  code_block: {
    title: "Code",
    aliases: ["code", "pre", "```"],
    badge: CodeXml,
    shortcut: "```",
  },
  emoji: {
    title: "Emoji",
    aliases: ["emoji", "emoticon", "smiley", ":"],
    badge: Smile,
    shortcut: ":",
  },
  table: {
    title: "Table",
    aliases: ["table", "grid", "spreadsheet"],
    badge: Table2,
  },
  image: {
    title: "Image",
    aliases: ["image", "img", "photo", "picture", "upload"],
    badge: ImageIcon,
  },
  divider: {
    title: "Horizontal line",
    aliases: ["hr", "horizontal", "line", "separator", "—", "-"],
    badge: Minus,
    shortcut: "---",
  },
};

type SlashMenuItemType = keyof typeof menuItemTexts;

const menuItemSections: SlashMenuItemType[][] = [
  ["text", "heading_1", "heading_2", "heading_3", "heading_4"],
  ["bullet_list", "ordered_list", "task_list"],
  ["code_block", "quote"],
  ["table", "image"],
  ["emoji", "divider"],
];

const getMenuItemImplementations = () => ({
  text: {
    check: (editor: Editor) => isNodeInSchema("paragraph", editor),
    action: ({ editor }: { editor: Editor }) => {
      editor.chain().focus().setParagraph().run();
    },
  },
  heading_1: {
    check: (editor: Editor) => isNodeInSchema("heading", editor),
    action: ({ editor }: { editor: Editor }) => {
      editor.chain().focus().setHeading({ level: 1 }).run();
    },
  },
  heading_2: {
    check: (editor: Editor) => isNodeInSchema("heading", editor),
    action: ({ editor }: { editor: Editor }) => {
      editor.chain().focus().setHeading({ level: 2 }).run();
    },
  },
  heading_3: {
    check: (editor: Editor) => isNodeInSchema("heading", editor),
    action: ({ editor }: { editor: Editor }) => {
      editor.chain().focus().setHeading({ level: 3 }).run();
    },
  },
  heading_4: {
    check: (editor: Editor) => isNodeInSchema("heading", editor),
    action: ({ editor }: { editor: Editor }) => {
      editor.chain().focus().setHeading({ level: 4 }).run();
    },
  },
  bullet_list: {
    check: (editor: Editor) => isNodeInSchema("bulletList", editor),
    action: ({ editor }: { editor: Editor }) => {
      if (editor.isActive("bulletList")) {
        return;
      }
      editor.chain().focus().toggleBulletList().run();
    },
  },
  ordered_list: {
    check: (editor: Editor) => isNodeInSchema("orderedList", editor),
    action: ({ editor }: { editor: Editor }) => {
      if (editor.isActive("orderedList")) {
        return;
      }
      editor.chain().focus().toggleOrderedList().run();
    },
  },
  task_list: {
    check: (editor: Editor) => isNodeInSchema("taskList", editor),
    action: ({ editor }: { editor: Editor }) => {
      if (editor.isActive("taskList")) {
        return;
      }
      editor.chain().focus().toggleTaskList().run();
    },
  },
  quote: {
    check: (editor: Editor) => isNodeInSchema("blockquote", editor),
    action: ({ editor }: { editor: Editor }) => {
      if (editor.isActive("blockquote")) {
        return;
      }
      editor.chain().focus().toggleBlockquote().run();
    },
  },
  code_block: {
    check: (editor: Editor) => isNodeInSchema("codeBlock", editor),
    action: ({ editor }: { editor: Editor }) => {
      if (editor.isActive("codeBlock")) {
        return;
      }
      editor.chain().focus().setCodeBlock().run();
    },
  },
  emoji: {
    check: (editor: Editor) =>
      editor.extensionManager.extensions.some(
        (ext) => ext.name === "emoji" || ext.name === "emojiPicker",
      ),
    action: ({ editor }: { editor: Editor }) => addEmojiTrigger(editor),
  },
  table: {
    check: (editor: Editor) => isNodeInSchema("table", editor),
    action: ({ editor }: { editor: Editor }) => {
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  divider: {
    check: (editor: Editor) => isNodeInSchema("horizontalRule", editor),
    action: ({ editor }: { editor: Editor }) => {
      editor.chain().focus().setHorizontalRule().run();
    },
  },
  image: {
    check: (editor: Editor) => isNodeInSchema("imageUpload", editor),
    action: ({ editor }: { editor: Editor }) => {
      editor.chain().focus().insertImagePlaceholder().run();
    },
  },
});

const getMenuItemSectionIndex = (itemType: SlashMenuItemType): number => {
  for (let i = 0; i < menuItemSections.length; i++) {
    if (menuItemSections[i].includes(itemType)) {
      return i;
    }
  }

  return menuItemSections.length;
};

export const getSlashMenuItems = (
  editor: Editor,
  config?: SlashMenuConfig,
): (SuggestionItem & { section: number })[] => {
  const enabledItems = config?.enabledItems || menuItemSections.flat();
  const implementations = getMenuItemImplementations();
  const items: (SuggestionItem & { section: number })[] = [];

  enabledItems.forEach((itemType) => {
    const impl = implementations[itemType];
    const text = menuItemTexts[itemType];

    if (impl && text && impl.check(editor)) {
      items.push({
        onSelect: ({ editor }) => impl.action({ editor }),
        ...text,
        section: getMenuItemSectionIndex(itemType),
      });
    }
  });

  if (config?.customItems) {
    config.customItems.forEach((item) => {
      items.push({ ...item, section: menuItemSections.length });
    });
  }

  return items.sort((a, b) => a.section - b.section);
};
