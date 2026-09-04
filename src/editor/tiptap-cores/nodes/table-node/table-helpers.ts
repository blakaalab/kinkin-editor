import type { Node as PmNode } from "@tiptap/pm/model";
import type { Editor } from "@tiptap/react";

export interface TableNodeViewOptions {
  node: PmNode;
  editor: Editor;
  getPos: () => number | undefined;
  cellMinWidth: number;
}

export const getColumnCount = (node: PmNode): number => {
  const firstRow = node.firstChild;
  if (!firstRow) return 0;
  let count = 0;
  for (let i = 0; i < firstRow.childCount; i++) {
    count += firstRow.child(i).attrs.colspan ?? 1;
  }
  return count;
};

export const getRowCount = (node: PmNode): number => {
  return node.childCount;
};

export const getCellPosInColumn = (
  editor: Editor,
  tablePos: number,
  colIndex: number,
): number | null => {
  const tableNode = editor.state.doc.nodeAt(tablePos);
  if (!tableNode) return null;
  const firstRow = tableNode.firstChild;
  if (!firstRow) return null;

  let cellOffset = tablePos + 1 + 1;
  for (let i = 0; i < colIndex && i < firstRow.childCount; i++) {
    cellOffset += firstRow.child(i).nodeSize;
  }
  return cellOffset + 1;
};

export const focusCellInColumn = (
  editor: Editor,
  tablePos: number,
  colIndex: number,
) => {
  const pos = getCellPosInColumn(editor, tablePos, colIndex);
  if (pos != null) editor.commands.setTextSelection(pos);
};

export const getCellPosInRow = (
  editor: Editor,
  tablePos: number,
  rowIndex: number,
): number | null => {
  const tableNode = editor.state.doc.nodeAt(tablePos);
  if (!tableNode) return null;

  let rowOffset = tablePos + 1;
  for (let i = 0; i < rowIndex && i < tableNode.childCount; i++) {
    rowOffset += tableNode.child(i).nodeSize;
  }
  const row = tableNode.child(Math.min(rowIndex, tableNode.childCount - 1));
  if (!row) return null;
  return rowOffset + 1 + 1;
};

export const focusCellInRow = (
  editor: Editor,
  tablePos: number,
  rowIndex: number,
) => {
  const pos = getCellPosInRow(editor, tablePos, rowIndex);
  if (pos != null) editor.commands.setTextSelection(pos);
};

export const focusAfterInsert = (
  editor: Editor,
  tablePos: number,
  target: { col: number } | { row: number },
) => {
  requestAnimationFrame(() => {
    const pos =
      "col" in target
        ? getCellPosInColumn(editor, tablePos, target.col)
        : getCellPosInRow(editor, tablePos, target.row);
    if (pos != null) {
      editor.chain().setTextSelection(pos).focus().run();
    }
  });
};

export const moveColumn = (
  editor: Editor,
  tablePos: number,
  fromCol: number,
  toCol: number,
) => {
  if (fromCol === toCol) return;
  const { state } = editor;
  const tableNode = state.doc.nodeAt(tablePos);
  if (!tableNode) return;

  const { tr } = state;
  const rows: PmNode[] = [];
  tableNode.forEach((row) => {
    const cells: PmNode[] = [];
    row.forEach((cell) => {
      cells.push(cell);
    });
    const moved = cells.splice(fromCol, 1)[0];
    cells.splice(toCol, 0, moved);
    rows.push(row.type.create(row.attrs, cells));
  });

  const newTable = tableNode.type.create(tableNode.attrs, rows);
  tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, newTable);
  editor.view.dispatch(tr);
  focusCellInColumn(editor, tablePos, toCol);
};

export const convertCellType = (
  cell: PmNode,
  targetType: string,
  schema: PmNode["type"]["schema"],
) => {
  if (cell.type.name === targetType) return cell;
  const newType = schema.nodes[targetType];
  if (!newType) return cell;
  return newType.create(cell.attrs, cell.content);
};

export const moveRow = (
  editor: Editor,
  tablePos: number,
  fromRow: number,
  toRow: number,
) => {
  if (fromRow === toRow) return;
  const { state } = editor;
  const tableNode = state.doc.nodeAt(tablePos);
  if (!tableNode) return;

  const { tr } = state;
  const rows: PmNode[] = [];
  tableNode.forEach((row) => {
    rows.push(row);
  });
  const moved = rows.splice(fromRow, 1)[0];
  rows.splice(toRow, 0, moved);

  const { schema } = state;
  const fixedRows = rows.map((row, i) => {
    const targetCellType = i === 0 ? "tableHeader" : "tableCell";
    const needsConversion = row.firstChild?.type.name !== targetCellType;
    if (!needsConversion) return row;

    const newCells: PmNode[] = [];
    row.forEach((cell) => {
      newCells.push(convertCellType(cell, targetCellType, schema));
    });
    return row.type.create(row.attrs, newCells);
  });

  const newTable = tableNode.type.create(tableNode.attrs, fixedRows);
  tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, newTable);
  editor.view.dispatch(tr);
  focusCellInRow(editor, tablePos, toRow);
};

export const addRowAboveHeader = (editor: Editor, tablePos: number) => {
  const { state } = editor;
  const tableNode = state.doc.nodeAt(tablePos);
  if (!tableNode) return;

  const { schema, tr } = state;
  const headerRow = tableNode.child(0);

  const newHeaderCells: PmNode[] = [];
  headerRow.forEach((cell) => {
    newHeaderCells.push(
      schema.nodes.tableHeader.create(
        { ...cell.attrs },
        schema.nodes.paragraph.create(),
      ),
    );
  });
  const newHeaderRow = schema.nodes.tableRow.create(null, newHeaderCells);

  const oldHeaderCells: PmNode[] = [];
  headerRow.forEach((cell) => {
    oldHeaderCells.push(convertCellType(cell, "tableCell", schema));
  });
  const convertedOldRow = headerRow.type.create(
    headerRow.attrs,
    oldHeaderCells,
  );

  const rows: PmNode[] = [newHeaderRow, convertedOldRow];
  for (let i = 1; i < tableNode.childCount; i++) {
    rows.push(tableNode.child(i));
  }

  const newTable = tableNode.type.create(tableNode.attrs, rows);
  tr.replaceWith(tablePos, tablePos + tableNode.nodeSize, newTable);
  editor.view.dispatch(tr);
};

export const findInsertionSlot = (
  elements: NodeListOf<Element>,
  clientPos: number,
  axis: "x" | "y",
): number => {
  for (let i = 0; i < elements.length; i++) {
    const rect = elements[i].getBoundingClientRect();
    const mid =
      axis === "x" ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
    if (clientPos < mid) return i;
  }
  return elements.length;
};

export const getInsertionEdge = (
  elements: NodeListOf<Element>,
  slotIndex: number,
  axis: "x" | "y",
  tableRect: DOMRect,
): number => {
  if (slotIndex >= elements.length) {
    const last = elements[elements.length - 1].getBoundingClientRect();
    return axis === "x"
      ? last.right - tableRect.left
      : last.bottom - tableRect.top;
  }
  const el = elements[slotIndex].getBoundingClientRect();
  return axis === "x" ? el.left - tableRect.left : el.top - tableRect.top;
};
