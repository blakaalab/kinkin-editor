import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import {
  TiptapMenuGroup,
  TiptapMenuItem,
} from "@/editor/tiptap-cores/ui/base/tiptap-menu/tiptap-menu";

import { useTurnIntoMenu } from "./use-turn-into-menu";

interface TurnIntoMenuContentProps {
  blockTypes?: (
    | "paragraph"
    | "heading"
    | "bulletList"
    | "orderedList"
    | "taskList"
    | "blockquote"
    | "codeBlock"
  )[];
}

export function TurnIntoMenuContent({ blockTypes }: TurnIntoMenuContentProps) {
  const { editor } = useTiptapEditor();
  const { blockItems, listItems, otherItems } = useTurnIntoMenu(blockTypes);

  if (!editor) {
    return null;
  }

  return (
    <>
      {blockItems.length > 0 && (
        <TiptapMenuGroup>
          {blockItems.map((item) => {
            const Icon = item.icon;
            return (
              <TiptapMenuItem
                key={item.id}
                id={item.id}
                render={<TiptapButton isToggled={item.isActive} />}
                onClick={item.action}
                disabled={item.disabled}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </TiptapMenuItem>
            );
          })}
        </TiptapMenuGroup>
      )}
      {listItems.length > 0 && (
        <TiptapMenuGroup>
          {listItems.map((item) => {
            const Icon = item.icon;
            return (
              <TiptapMenuItem
                key={item.id}
                id={item.id}
                render={<TiptapButton isToggled={item.isActive} />}
                onClick={item.action}
                disabled={item.disabled}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </TiptapMenuItem>
            );
          })}
        </TiptapMenuGroup>
      )}
      {otherItems.length > 0 && (
        <TiptapMenuGroup>
          {otherItems.map((item) => {
            const Icon = item.icon;
            return (
              <TiptapMenuItem
                key={item.id}
                id={item.id}
                render={<TiptapButton isToggled={item.isActive} />}
                onClick={item.action}
                disabled={item.disabled}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </TiptapMenuItem>
            );
          })}
        </TiptapMenuGroup>
      )}
    </>
  );
}
