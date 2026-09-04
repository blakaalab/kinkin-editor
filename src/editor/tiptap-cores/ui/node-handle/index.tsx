import { useCallback, useMemo, useRef, useState } from "react";

import { offset } from "@floating-ui/react";
import type { DragHandleProps } from "@tiptap/extension-drag-handle-react";
import { DragHandle } from "@tiptap/extension-drag-handle-react";
import type { Node } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/react";
import { GripVertical } from "lucide-react";

import { selectNodeAndHideFloating } from "@/editor/tiptap-cores/hooks/use-floating-toolbar-visibility";
import { useIsMobile } from "@/editor/tiptap-cores/hooks/use-mobile";
import { useTiptapEditor } from "@/editor/tiptap-cores/hooks/use-tiptap-editor";
import { useUiEditorState } from "@/editor/tiptap-cores/hooks/use-ui-editor-state";
import {
  cn,
  isTextSelectionValid,
} from "@/editor/tiptap-cores/lib/tiptap-utils";
import { TiptapButton } from "@/editor/tiptap-cores/ui/base/tiptap-button";
import { SlashCommandTriggerButton } from "@/editor/tiptap-cores/ui/slash-command-suggestion-menu/slash-command-trigger-button";

interface NodeChangeData {
  node: Node | null;
  editor: Editor;
  pos: number;
}

interface NodeHandleProps extends Omit<DragHandleProps, "editor" | "children"> {
  editor?: Editor | null;
}

export function NodeHandle({
  editor: providedEditor,
  className,
  ...props
}: NodeHandleProps) {
  const { editor } = useTiptapEditor(providedEditor);
  const { isDragging } = useUiEditorState(editor);
  const isMobile = useIsMobile();
  const [nodePos, setNodePos] = useState<number>(-1);
  const gripRef = useRef<HTMLButtonElement>(null);

  const handleGripKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!editor) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        const node = editor.state.doc.nodeAt(nodePos);
        if (node) {
          editor.view.dispatch(
            editor.state.tr.delete(nodePos, nodePos + node.nodeSize),
          );
        }
      }
    },
    [editor, nodePos],
  );

  const handleNodeChange = useCallback((data: NodeChangeData) => {
    setNodePos(data.pos);
  }, []);

  const dynamicPositions = useMemo(() => {
    return {
      middleware: [
        offset((props) => {
          const { rects } = props;
          const nodeHeight = rects.reference.height;
          const dragHandleHeight = rects.floating.height;
          const crossAxis = nodeHeight / 2 - dragHandleHeight / 2;

          return {
            mainAxis: 10,
            crossAxis: nodeHeight > 50 ? 0 : crossAxis,
          };
        }),
      ],
    };
  }, []);

  const onElementDragStart = useCallback(() => {
    if (!editor) {
      return;
    }
    editor.commands.setIsDragging(true);
  }, [editor]);

  const onElementDragEnd = useCallback(() => {
    if (!editor) {
      return;
    }
    editor.commands.setIsDragging(false);
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <DragHandle
      editor={editor}
      onNodeChange={handleNodeChange}
      computePositionConfig={dynamicPositions}
      onElementDragStart={onElementDragStart}
      onElementDragEnd={onElementDragEnd}
      className={cn("transition-[top] duration-200 ease-out", className)}
      {...props}
    >
      <div
        className="flex flex-row items-center gap-0.5"
        style={{
          ...(isMobile || isTextSelectionValid(editor)
            ? { opacity: 0, pointerEvents: "none" }
            : {}),
          ...(isDragging ? { opacity: 0 } : {}),
        }}
      >
        <SlashCommandTriggerButton
          nodePos={nodePos}
          className="w-6 min-w-6 px-0 justify-center"
        />

        <TiptapButton
          ref={gripRef}
          tabIndex={-1}
          tooltip="Drag to move"
          showTooltip={!isDragging}
          className="w-6 min-w-6 px-0 cursor-grab justify-center"
          onMouseDown={() => selectNodeAndHideFloating(editor, nodePos)}
          onClick={() => gripRef.current?.focus()}
          onKeyDown={handleGripKeyDown}
        >
          <GripVertical className="size-4" />
        </TiptapButton>
      </div>
    </DragHandle>
  );
}
