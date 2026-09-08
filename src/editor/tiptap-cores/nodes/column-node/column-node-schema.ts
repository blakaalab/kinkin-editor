import {
  canInsertNode,
  findParentNode,
  mergeAttributes,
  Node,
} from "@tiptap/core";
import type { Node as PmNode } from "@tiptap/pm/model";
import { Fragment } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";

/** A row of columns needs at least two; one column is just a block. */
export const MIN_COLUMNS = 2;

/** Past four, a column is too narrow to hold anything at a readable width. */
export const MAX_COLUMNS = 4;

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    columns: {
      /** Inserts a row of `count` columns (clamped to 2–4) and puts the cursor in the first. */
      insertColumns: (count?: number) => ReturnType;
      /**
       * Appends a column to the row the selection is in.
       *
       * Named around `Column` rather than the obvious `addColumn`/`deleteColumn`
       * because `@tiptap/extension-table` already owns `deleteColumn` (and
       * `addColumnBefore`/`addColumnAfter`). Tiptap merges every extension's
       * commands into one object and the collision is silent — the table's
       * version simply wins and returns false outside a table.
       */
      appendColumn: () => ReturnType;
      /** Removes the column the selection is in. */
      removeColumn: () => ReturnType;
    };
  }
}

/**
 * One column. `isolating` keeps editing inside it: Backspace at the start of a
 * column will not reach out and join the column before it, which would take the
 * row apart from under the author.
 */
export const Column = Node.create({
  name: "column",
  content: "block+",
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "column" }),
      0,
    ];
  },

  renderMarkdown: (node, h) =>
    h.renderChildren(node.content ?? [], "\n\n").trim(),
});

/**
 * A row of columns. Rendering is pure `renderHTML` — no node view — so the
 * editor and a statically rendered page produce the same markup, and the
 * layout is entirely the stylesheet's job.
 *
 * Markdown has no way to express a row of columns. Rather than disappear (the
 * serializer drops nodes it has no renderer for), the columns flatten to their
 * blocks in document order.
 */
export const Columns = Node.create({
  name: "columns",
  group: "block",
  content: `column{${MIN_COLUMNS},}`,
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "columns" }),
      0,
    ];
  },

  renderMarkdown: (node, h) =>
    (node.content ?? [])
      .map((column) => h.renderChildren([column], "\n\n").trim())
      // An empty column contributes nothing but blank lines.
      .filter(Boolean)
      .join("\n\n"),

  addCommands() {
    const findColumns = findParentNode((node) => node.type.name === this.name);
    const findColumn = findParentNode((node) => node.type.name === "column");

    return {
      insertColumns:
        (count = MIN_COLUMNS) =>
        ({ tr, state, dispatch }) => {
          const columnsType = state.schema.nodes[this.name];
          const columnType = state.schema.nodes.column;

          if (!columnsType || !columnType) {
            return false;
          }

          if (!canInsertNode(state, columnsType)) {
            return false;
          }

          const total = Math.min(
            Math.max(Math.round(count), MIN_COLUMNS),
            MAX_COLUMNS,
          );
          const columns: PmNode[] = [];

          for (let i = 0; i < total; i += 1) {
            const column = columnType.createAndFill();

            if (!column) {
              return false;
            }

            columns.push(column);
          }

          const node = columnsType.create(null, columns);
          const { $from } = tr.selection;
          const parent = $from.parent;
          const isEmptyBlock = parent.isTextblock && parent.content.size === 0;
          let pos: number;

          if (isEmptyBlock) {
            pos = $from.before($from.depth);
            tr.replaceWith(pos, pos + parent.nodeSize, node);
          } else {
            pos = $from.end($from.depth) + 1;
            tr.insert(pos, node);
          }

          // Three tokens in — the row, the first column, its paragraph.
          tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 3)));

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        },

      appendColumn:
        () =>
        ({ tr, state, dispatch }) => {
          const columns = findColumns(state.selection);
          const columnType = state.schema.nodes.column;

          if (!columns || !columnType) {
            return false;
          }

          if (columns.node.childCount >= MAX_COLUMNS) {
            return false;
          }

          const column = columnType.createAndFill();

          if (!column) {
            return false;
          }

          const at = columns.pos + columns.node.nodeSize - 1;
          tr.insert(at, column);
          tr.setSelection(TextSelection.near(tr.doc.resolve(at + 2)));

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        },

      removeColumn:
        () =>
        ({ tr, state, dispatch }) => {
          const columns = findColumns(state.selection);
          const column = findColumn(state.selection);

          if (!columns || !column) {
            return false;
          }

          if (columns.node.childCount > MIN_COLUMNS) {
            tr.delete(column.pos, column.pos + column.node.nodeSize);
          } else {
            // Dropping to a single column is not a valid row, so the row comes
            // apart instead and what is left takes its place in the document.
            let survivors = Fragment.empty;

            columns.node.forEach((child, offset) => {
              if (columns.pos + 1 + offset !== column.pos) {
                survivors = survivors.append(child.content);
              }
            });

            if (survivors.size === 0) {
              const paragraph = state.schema.nodes.paragraph?.createAndFill();
              survivors = paragraph ? Fragment.from(paragraph) : survivors;
            }

            tr.replaceWith(
              columns.pos,
              columns.pos + columns.node.nodeSize,
              survivors,
            );
          }

          tr.setSelection(
            TextSelection.near(
              tr.doc.resolve(Math.min(columns.pos + 1, tr.doc.content.size)),
            ),
          );

          if (dispatch) {
            dispatch(tr);
          }

          return true;
        },
    };
  },
});
