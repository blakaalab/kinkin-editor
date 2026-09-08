import { useCallback } from "react";

import { ChevronDown } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import {
  TiptapMenu,
  TiptapMenuButton,
  TiptapMenuContent,
  TiptapMenuGroup,
  TiptapMenuItem,
} from "@/editor/tiptap-cores/ui/base/tiptap-menu/tiptap-menu";

import { useTextAlign } from "./use-text-align";

/**
 * The alignment picker. The trigger shows the alignment the selection already
 * has, so the toolbar reads as state rather than as four identical buttons.
 */
export const TextAlignMenu = () => {
  const { editor } = useTiptapEditor();
  const left = useTextAlign({ alignment: "left", hideWhenUnavailable: true });
  const center = useTextAlign({
    alignment: "center",
    hideWhenUnavailable: true,
  });
  const right = useTextAlign({ alignment: "right", hideWhenUnavailable: true });
  const justify = useTextAlign({
    alignment: "justify",
    hideWhenUnavailable: true,
  });

  const items = [left, center, right, justify];
  const visibleItems = items.filter((item) => item.isVisible);
  const activeItem = items.find((item) => item.isActive) ?? left;

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && editor && !editor.isDestroyed) {
        requestAnimationFrame(() => editor.commands.focus());
      }
    },
    [editor],
  );

  if (visibleItems.length === 0) {
    return null;
  }

  const ActiveIcon = activeItem.Icon;

  return (
    <TiptapMenu
      placement="bottom"
      onOpenChange={handleOpenChange}
      trigger={
        <TiptapMenuButton
          render={
            <TiptapButton
              tooltip="Alignment"
              isToggled={items.some((item) => item !== left && item.isActive)}
            >
              <ActiveIcon className="size-4" />
              <ChevronDown className="size-3" />
            </TiptapButton>
          }
        />
      }
    >
      <TiptapMenuContent portal autoFocusOnShow={false} autoFocusOnHide={false}>
        <Card className="p-1.5">
          <CardContent className="p-0">
            <TiptapMenuGroup>
              {visibleItems.map((item) => {
                const Icon = item.Icon;

                return (
                  <TiptapMenuItem
                    key={item.label}
                    render={
                      <TiptapButton
                        isToggled={item.isActive}
                        isFocused={false}
                      />
                    }
                    onClick={item.handleAlign}
                    disabled={!item.canAlign}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </TiptapMenuItem>
                );
              })}
            </TiptapMenuGroup>
          </CardContent>
        </Card>
      </TiptapMenuContent>
    </TiptapMenu>
  );
};
