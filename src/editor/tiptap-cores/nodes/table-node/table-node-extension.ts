import { Table } from "@tiptap/extension-table";
import type { Node as PmNode } from "@tiptap/pm/model";
import { NodeSelection } from "@tiptap/pm/state";
import { CellSelection, TableMap } from "@tiptap/pm/tables";

import { convertCellType, focusCellInColumn } from "./table-helpers";
import { createTableNodeView } from "./table-node-view";

const CELL_MIN_WIDTH = 80;

export const CustomTable = Table.extend({
  addNodeView() {
    return ({ node, editor, getPos }) => {
      return createTableNodeView({
        node,
        editor,
        getPos: getPos as () => number | undefined,
        cellMinWidth: CELL_MIN_WIDTH,
      });
    };
  },

  addKeyboardShortcuts() {
    const handleDelete = () => {
      const { selection } = this.editor.state;

      if (
        selection instanceof NodeSelection &&
        selection.node.type.name === "table"
      ) {
        return this.editor.commands.deleteSelection();
      }

      if (!(selection instanceof CellSelection)) return false;

      const table = selection.$anchorCell.node(-1);
      const map = TableMap.get(table);
      const start = selection.$anchorCell.start(-1);

      if (selection.isRowSelection() && selection.isColSelection()) {
        return this.editor.commands.deleteTable();
      }

      const tablePos = start - 1;

      if (selection.isRowSelection()) {
        const anchorRow = map.findCell(selection.$anchorCell.pos - start).top;
        const headRow = map.findCell(selection.$headCell.pos - start).top;
        const minRow = Math.min(anchorRow, headRow);
        const maxRow = Math.max(anchorRow, headRow);
        const selectedRowCount = maxRow - minRow + 1;

        if (selectedRowCount >= table.childCount) {
          return this.editor.commands.deleteTable();
        }

        const { tr, schema } = this.editor.state;

        for (let row = maxRow; row >= minRow; row--) {
          const currentTable = tr.doc.nodeAt(tablePos);
          if (!currentTable) break;

          let rowStart = tablePos + 1;
          for (let r = 0; r < row; r++) {
            rowStart += currentTable.child(r).nodeSize;
          }
          const rowNode = currentTable.child(row);
          tr.delete(rowStart, rowStart + rowNode.nodeSize);
        }

        if (minRow === 0) {
          const updatedTable = tr.doc.nodeAt(tablePos);
          if (updatedTable) {
            const newFirstRow = updatedTable.child(0);
            if (newFirstRow.firstChild?.type.name !== "tableHeader") {
              const newCells: PmNode[] = [];
              newFirstRow.forEach((cell) => {
                newCells.push(convertCellType(cell, "tableHeader", schema));
              });
              const fixedRow = newFirstRow.type.create(
                newFirstRow.attrs,
                newCells,
              );
              const rowStart = tablePos + 1;
              tr.replaceWith(
                rowStart,
                rowStart + newFirstRow.nodeSize,
                fixedRow,
              );
            }
          }
        }

        this.editor.view.dispatch(tr);
        return true;
      }

      if (selection.isColSelection()) {
        const anchorCol = map.findCell(selection.$anchorCell.pos - start).left;
        const headCol = map.findCell(selection.$headCell.pos - start).left;
        const minCol = Math.min(anchorCol, headCol);
        const maxCol = Math.max(anchorCol, headCol);
        const selectedColCount = maxCol - minCol + 1;

        if (selectedColCount >= map.width) {
          return this.editor.commands.deleteTable();
        }

        for (let col = maxCol; col >= minCol; col--) {
          focusCellInColumn(this.editor, tablePos, col);
          this.editor.commands.deleteColumn();
        }

        return true;
      }

      return false;
    };

    return {
      ...this.parent?.(),
      Backspace: handleDelete,
      "Mod-Backspace": handleDelete,
      Delete: handleDelete,
      "Mod-Delete": handleDelete,
    };
  },
});
