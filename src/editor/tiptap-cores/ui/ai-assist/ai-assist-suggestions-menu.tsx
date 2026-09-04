import { ChevronRight } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import { TiptapComboboxList } from "@/editor/tiptap-cores/ui/base/tiptap-combobox";
import {
  TiptapMenu,
  TiptapMenuButton,
  TiptapMenuContent,
  TiptapMenuGroup,
  TiptapMenuItem,
} from "@/editor/tiptap-cores/ui/base/tiptap-menu/tiptap-menu";

import { type AiAssistSuggestion, filterSuggestions } from "./ai-assist-utils";

interface SubmenuItemProps {
  suggestion: AiAssistSuggestion;
  onSelect: (suggestion: AiAssistSuggestion, submenuItem: string) => void;
}

function SubmenuItem({ suggestion, onSelect }: SubmenuItemProps) {
  const Icon = suggestion.icon;

  return (
    <TiptapMenu
      placement="right"
      trigger={
        <TiptapMenuItem
          render={
            <TiptapMenuButton
              render={
                <TiptapButton className="w-full">
                  <Icon className="size-4 text-blue-700" />
                  <span className="flex-1 text-left">{suggestion.label}</span>
                  <ChevronRight className="size-4 text-gray-400" />
                </TiptapButton>
              }
            />
          }
        />
      }
    >
      <TiptapMenuContent gutter={12} portal>
        <TiptapComboboxList className="w-40">
          {suggestion.submenu?.map((item) => (
            <TiptapMenuItem
              key={item}
              render={<TiptapButton className="w-full" />}
              onClick={(e) => {
                onSelect(suggestion, item);
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {item}
            </TiptapMenuItem>
          ))}
        </TiptapComboboxList>
      </TiptapMenuContent>
    </TiptapMenu>
  );
}

interface AiAssistSuggestionsMenuProps {
  query: string;
  onSelect: (suggestion: AiAssistSuggestion, submenuItem?: string) => void;
}

export function AiAssistSuggestionsMenu({
  query,
  onSelect,
}: AiAssistSuggestionsMenuProps) {
  const filteredSuggestions = filterSuggestions(query);
  const suggestionsCategory = filteredSuggestions.filter(
    (s) => s.category === "suggestions",
  );
  const editCategory = filteredSuggestions.filter((s) => s.category === "edit");

  if (filteredSuggestions.length === 0) {
    return null;
  }

  const renderSuggestion = (suggestion: AiAssistSuggestion) => {
    const Icon = suggestion.icon;

    if (suggestion.submenu) {
      return (
        <SubmenuItem
          key={suggestion.id}
          suggestion={suggestion}
          onSelect={onSelect}
        />
      );
    }

    return (
      <TiptapMenuItem
        key={suggestion.id}
        render={
          <TiptapButton className="w-full">
            <Icon className="size-4 text-blue-700" />
            <span>{suggestion.label}</span>
          </TiptapButton>
        }
        onClick={() => onSelect(suggestion)}
      />
    );
  };

  return (
    <TiptapComboboxList>
      {suggestionsCategory.length > 0 && (
        <TiptapMenuGroup>
          <span className="px-2 py-1 text-xs font-semibold text-gray-400">
            Suggestions
          </span>
          {suggestionsCategory.map(renderSuggestion)}
        </TiptapMenuGroup>
      )}
      {suggestionsCategory.length > 0 && editCategory.length > 0 && (
        <Separator className="my-2" />
      )}
      {editCategory.length > 0 && (
        <TiptapMenuGroup>
          <span className="px-2 py-1 text-xs font-semibold text-gray-400">
            Edit
          </span>
          {editCategory.map(renderSuggestion)}
        </TiptapMenuGroup>
      )}
    </TiptapComboboxList>
  );
}
