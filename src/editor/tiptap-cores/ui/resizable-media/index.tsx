import {
  type ComponentPropsWithoutRef,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";

import { NodeSelection } from "@tiptap/pm/state";
import { type NodeViewProps, NodeViewWrapper } from "@tiptap/react";

import {
  MIN_MEDIA_WIDTH,
  normalizeMediaWidth,
} from "@/editor/tiptap-cores/lib/media-width";
import { cn } from "@/lib/utils";

/** Below this many pixels a handle would sit on top of its twin. */
const MIN_WIDTH_PX = 80;

type ResizableMediaProps = Pick<NodeViewProps, "node" | "editor" | "getPos"> &
  Omit<ComponentPropsWithoutRef<"div">, "style"> & {
    selected: boolean;
  };

/**
 * The node view wrapper for a picture or a player whose width can be dragged.
 * Its width is the node's `width` attribute, and it is centred, so a drag on
 * either edge grows or shrinks both sides at once — the media stays centred
 * under the pointer rather than creeping sideways.
 *
 * The width is tracked locally while dragging and written to the document
 * once, on release: one undo step per resize, not one per pixel.
 */
export const ResizableMedia = ({
  node,
  editor,
  getPos,
  selected,
  className,
  children,
  ...wrapperProps
}: ResizableMediaProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [liveWidth, setLiveWidth] = useState<number | null>(null);
  const width = liveWidth ?? normalizeMediaWidth(node.attrs.width);
  const isResizing = liveWidth !== null;

  const startResize =
    (direction: -1 | 1) => (event: ReactPointerEvent<HTMLDivElement>) => {
      const box = boxRef.current;
      const column = box?.parentElement;

      if (event.button !== 0 || !editor.isEditable || !box || !column) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const columnWidth = column.getBoundingClientRect().width;
      const startWidth = box.getBoundingClientRect().width;
      const startX = event.clientX;
      const minWidth = Math.min(
        columnWidth,
        Math.max(MIN_WIDTH_PX, (columnWidth * MIN_MEDIA_WIDTH) / 100),
      );
      let percent = (startWidth / columnWidth) * 100;

      const onMove = (moveEvent: PointerEvent) => {
        // Doubled: the box is centred, so each edge moves half the change.
        const next = startWidth + direction * (moveEvent.clientX - startX) * 2;
        const clamped = Math.min(Math.max(next, minWidth), columnWidth);
        percent = (clamped / columnWidth) * 100;
        setLiveWidth(percent);
      };

      // The node is a drag source for moving blocks around; pressing on a
      // handle must not start that drag instead.
      const preventDrag = (dragEvent: DragEvent) => dragEvent.preventDefault();

      const onEnd = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);
        document.removeEventListener("dragstart", preventDrag, true);
        document.documentElement.style.removeProperty("cursor");
        setLiveWidth(null);

        const pos = getPos();
        const next = normalizeMediaWidth(percent);

        if (
          pos === undefined ||
          next === normalizeMediaWidth(node.attrs.width)
        ) {
          return;
        }

        editor
          .chain()
          .command(({ tr }) => {
            tr.setNodeAttribute(pos, "width", next);
            // Kept selected, so the handles stay up for another adjustment.
            tr.setSelection(NodeSelection.create(tr.doc, pos));
            return true;
          })
          .run();
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
      document.addEventListener("dragstart", preventDrag, true);
      document.documentElement.style.cursor = "col-resize";
    };

  return (
    <NodeViewWrapper
      ref={boxRef}
      {...wrapperProps}
      className={cn("resizable-media group", className)}
      data-resizing={isResizing ? "" : undefined}
      style={width ? { width: `${width}%` } : undefined}
    >
      {children}
      {/* Hidden by the stylesheet while the editor is read-only: a node view is
          not re-rendered when editability changes, but the editor's
          `contenteditable` is. */}
      {([-1, 1] as const).map((direction) => (
        <div
          key={direction}
          aria-hidden
          onPointerDown={startResize(direction)}
          className={cn(
            "resizable-media-handle absolute inset-y-0 z-10 flex w-4 cursor-col-resize items-center justify-center transition-opacity",
            direction === -1 ? "left-1" : "right-1",
            selected || isResizing
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100",
          )}
        >
          <div className="h-12 max-h-[50%] w-1.5 rounded-full bg-white/90 shadow ring-1 ring-black/25" />
        </div>
      ))}
      {isResizing && width && (
        <div className="pointer-events-none absolute top-2 left-1/2 z-10 -translate-x-1/2 rounded bg-black/70 px-1.5 py-0.5 text-xs tabular-nums text-white">
          {Math.round(width)}%
        </div>
      )}
    </NodeViewWrapper>
  );
};
