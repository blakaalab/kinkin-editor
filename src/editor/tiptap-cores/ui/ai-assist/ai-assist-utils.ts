import {
  ClipboardType,
  Languages,
  ListMinus,
  ListPlus,
  type LucideIcon,
  MessageSquareText,
  NotebookPen,
  TextSelect,
  Type,
  WandSparkles,
} from "lucide-react";

export interface AiAssistSuggestion {
  id: string;
  label: string;
  icon: LucideIcon;
  submenu?: string[];
  category: "suggestions" | "edit";
  keywords: string[];
}

export const AI_ASSIST_SUGGESTIONS: AiAssistSuggestion[] = [
  {
    id: "improve",
    label: "Improve writing",
    icon: WandSparkles,
    category: "suggestions",
    keywords: ["improve", "better", "enhance", "writing", "quality"],
  },
  {
    id: "continue",
    label: "Continue writing",
    icon: NotebookPen,
    category: "suggestions",
    keywords: ["continue", "write", "more", "extend", "next"],
  },
  {
    id: "summarize",
    label: "Summarize",
    icon: TextSelect,
    category: "suggestions",
    keywords: ["summarize", "summary", "brief", "short", "tldr"],
  },
  {
    id: "translate",
    label: "Translate to",
    icon: Languages,
    submenu: ["English", "Spanish", "French", "German", "Vietnamese"],
    category: "suggestions",
    keywords: [
      "translate",
      "language",
      "convert",
      "english",
      "spanish",
      "french",
      "german",
      "vietnamese",
    ],
  },
  {
    id: "fix-grammar",
    label: "Fix spelling & grammar",
    icon: Type,
    category: "edit",
    keywords: ["fix", "spelling", "grammar", "correct", "errors", "typo"],
  },
  {
    id: "tone",
    label: "Adjust tone",
    icon: MessageSquareText,
    submenu: [
      "Professional",
      "Casual",
      "Straightforward",
      "Confident",
      "Friendly",
    ],
    category: "edit",
    keywords: [
      "tone",
      "adjust",
      "professional",
      "casual",
      "friendly",
      "confident",
      "straightforward",
    ],
  },
  {
    id: "simplify",
    label: "Simplify language",
    icon: ClipboardType,
    category: "edit",
    keywords: ["simplify", "simple", "easy", "understand", "plain"],
  },
  {
    id: "shorten",
    label: "Shorten",
    icon: ListMinus,
    category: "edit",
    keywords: ["shorten", "shorter", "brief", "concise", "reduce"],
  },
  {
    id: "extend",
    label: "Extend",
    icon: ListPlus,
    category: "edit",
    keywords: ["extend", "longer", "expand", "elaborate", "more"],
  },
];

export const filterSuggestions = (query: string): AiAssistSuggestion[] => {
  if (!query.trim()) {
    return AI_ASSIST_SUGGESTIONS;
  }

  const lowerQuery = query.toLowerCase();

  return AI_ASSIST_SUGGESTIONS.filter(
    (suggestion) =>
      suggestion.label.toLowerCase().includes(lowerQuery) ||
      suggestion.keywords.some((keyword) => keyword.includes(lowerQuery)),
  );
};
