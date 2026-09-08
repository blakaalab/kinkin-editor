import { Table } from "@tiptap/extension-table";
import type { DOMOutputSpec } from "@tiptap/pm/model";

/** Also the `min-width` the table CSS puts on cells. */
export const CELL_MIN_WIDTH = 80;

/**
 * The table schema plus the two wrappers the node view builds around the table
 * while editing — `.table-node-wrapper` carries the block's margins,
 * `.table-scroll-container` makes a wide table scroll instead of overflowing.
 *
 * They belong in `renderHTML` because that is the only path a statically
 * rendered document takes. Without them a rendered table would match none of
 * the table CSS, which is why consumers ended up hand-writing the wrapper.
 */
export const ContentTable = Table.extend({
  renderHTML(props) {
    const table = this.parent?.(props) as DOMOutputSpec;

    return [
      "div",
      { class: "table-node-wrapper" },
      ["div", { class: "table-scroll-container" }, table],
    ];
  },
}).configure({ cellMinWidth: CELL_MIN_WIDTH });
