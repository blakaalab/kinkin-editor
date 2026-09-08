import { useCallback } from "react";

import { Ban, ChevronDown } from "lucide-react";

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
import { cn } from "@/lib/utils";

import type { ColorType } from "./use-color";
import { useColor } from "./use-color";

interface ColorMenuProps {
  type: ColorType;
}

/**
 * Text colour and highlight share this menu — the swatches and the two commands
 * are all that differ between them.
 */
export const ColorMenu = ({ type }: ColorMenuProps) => {
  const { editor } = useTiptapEditor();
  const {
    isVisible,
    canApply,
    color,
    applyColor,
    clearColor,
    swatches,
    label,
    Icon,
  } = useColor({ type, hideWhenUnavailable: true });

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && editor && !editor.isDestroyed) {
        requestAnimationFrame(() => editor.commands.focus());
      }
    },
    [editor],
  );

  if (!isVisible) {
    return null;
  }

  return (
    <TiptapMenu
      placement="bottom"
      onOpenChange={handleOpenChange}
      trigger={
        <TiptapMenuButton
          render={
            <TiptapButton tooltip={label} isToggled={Boolean(color)}>
              <Icon
                className="size-4"
                // The trigger carries the colour it would apply, so the current
                // one is readable without opening the menu.
                style={color ? { color } : undefined}
              />
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
              <div className="grid grid-cols-5 gap-1 p-0.5">
                {swatches.map((swatch) => (
                  <TiptapMenuItem
                    key={swatch.value}
                    render={
                      <button
                        type="button"
                        aria-label={swatch.label}
                        title={swatch.label}
                        className={cn(
                          "size-6 rounded-md border border-border flex items-center justify-center text-sm font-semibold",
                          color === swatch.value && "ring-2 ring-ring",
                        )}
                        style={
                          type === "highlight"
                            ? { backgroundColor: swatch.value }
                            : { color: swatch.value }
                        }
                      />
                    }
                    onClick={() => applyColor(swatch.value)}
                    disabled={!canApply}
                  >
                    {type === "text" ? "A" : null}
                  </TiptapMenuItem>
                ))}
              </div>

              <TiptapMenuItem
                render={<TiptapButton isFocused={false} />}
                onClick={clearColor}
                disabled={!color}
              >
                <Ban className="size-4" />
                <span>
                  {type === "text" ? "Default colour" : "No highlight"}
                </span>
              </TiptapMenuItem>
            </TiptapMenuGroup>
          </CardContent>
        </Card>
      </TiptapMenuContent>
    </TiptapMenu>
  );
};
