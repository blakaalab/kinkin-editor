import { Check, ListEnd, type LucideIcon, RotateCcw, X } from "lucide-react";

import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import { TiptapComboboxList } from "@/editor/tiptap-cores/ui/base/tiptap-combobox";
import {
  TiptapMenuGroup,
  TiptapMenuItem,
} from "@/editor/tiptap-cores/ui/base/tiptap-menu/tiptap-menu";

interface ResultAction {
  id: string;
  label: string;
  icon: LucideIcon;
  keywords: string[];
  onClick: () => void;
  showWhen?: "always" | "no-error";
}

export interface AiAssistResultActionsMenuProps {
  query: string;
  onAccept: () => void;
  onDiscard: () => void;
  onInsertBelow: () => void;
  onTryAgain: () => void;
  hasError: boolean;
}

export function AiAssistResultActionsMenu({
  query,
  onAccept,
  onDiscard,
  onInsertBelow,
  onTryAgain,
  hasError,
}: AiAssistResultActionsMenuProps) {
  const actions: ResultAction[] = [
    {
      id: "accept",
      label: "Accept",
      icon: Check,
      keywords: ["accept", "apply", "done"],
      onClick: onAccept,
      showWhen: "no-error",
    },
    {
      id: "discard",
      label: "Discard",
      icon: X,
      keywords: ["discard", "cancel", "reject"],
      onClick: onDiscard,
      showWhen: "always",
    },
    {
      id: "insert-below",
      label: "Insert below",
      icon: ListEnd,
      keywords: ["insert", "below", "append"],
      onClick: onInsertBelow,
      showWhen: "no-error",
    },
    {
      id: "try-again",
      label: "Try again",
      icon: RotateCcw,
      keywords: ["try", "again", "retry", "regenerate"],
      onClick: onTryAgain,
      showWhen: "always",
    },
  ];

  const filterActions = (query: string): ResultAction[] => {
    const filtered = actions.filter((action) => {
      if (action.showWhen === "no-error" && hasError) {
        return false;
      }

      if (!query.trim()) {
        return true;
      }

      const lowerQuery = query.toLowerCase();
      return (
        action.label.toLowerCase().includes(lowerQuery) ||
        action.keywords.some((keyword) => keyword.includes(lowerQuery))
      );
    });

    return filtered;
  };

  const filteredActions = filterActions(query);

  if (filteredActions.length === 0) {
    return null;
  }

  return (
    <TiptapComboboxList>
      <TiptapMenuGroup>
        {filteredActions.map((action) => {
          const Icon = action.icon;
          return (
            <TiptapMenuItem
              key={action.id}
              render={
                <TiptapButton className="w-full">
                  <Icon className="size-4" />
                  <span>{action.label}</span>
                </TiptapButton>
              }
              onClick={action.onClick}
            />
          );
        })}
      </TiptapMenuGroup>
    </TiptapComboboxList>
  );
}
