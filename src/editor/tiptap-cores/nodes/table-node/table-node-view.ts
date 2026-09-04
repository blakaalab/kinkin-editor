// Vanilla JS NodeView — NOT React. Tables require strict HTML structure
// (<table>→<tbody>→<tr>→<td>). ReactNodeViewRenderer wraps content in <div>,
// which is invalid inside <tbody> and breaks table layout.
import { updateColumns } from "@tiptap/extension-table";
import type { Node as PmNode } from "@tiptap/pm/model";

import { createDragPreview } from "./table-drag-preview";
import { showDropdown } from "./table-dropdown";
import {
  addRowAboveHeader,
  findInsertionSlot,
  focusAfterInsert,
  focusCellInColumn,
  focusCellInRow,
  getColumnCount,
  getInsertionEdge,
  getRowCount,
  moveColumn,
  moveRow,
  type TableNodeViewOptions,
} from "./table-helpers";
import { createIcon, ICONS } from "./table-icons";

export { convertCellType } from "./table-helpers";

export const createTableNodeView = ({
  node,
  editor,
  getPos,
  cellMinWidth,
}: TableNodeViewOptions) => {
  let currentNode = node;

  const dom = document.createElement("div");
  dom.className = "table-node-wrapper";

  const colControls = document.createElement("div");
  colControls.className = "table-col-controls";

  const rowControls = document.createElement("div");
  rowControls.className = "table-row-controls";

  const scrollContainer = document.createElement("div");
  scrollContainer.className = "table-scroll-container";

  const table = document.createElement("table");
  const colgroup = document.createElement("colgroup");
  table.appendChild(colgroup);

  const contentDOM = document.createElement("tbody");
  table.appendChild(contentDOM);
  scrollContainer.appendChild(table);

  const addColBtn = document.createElement("button");
  addColBtn.className = "table-add-col-btn";
  addColBtn.title = "Add column";
  addColBtn.appendChild(createIcon(ICONS.plus));
  addColBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getTablePos();
    const newColIndex = getColumnCount(currentNode);
    focusCellInColumn(editor, pos, newColIndex - 1);
    editor.commands.addColumnAfter();
    focusAfterInsert(editor, pos, { col: newColIndex });
  });

  const addRowBtn = document.createElement("button");
  addRowBtn.className = "table-add-row-btn";
  addRowBtn.title = "Add row";
  addRowBtn.appendChild(createIcon(ICONS.plus));
  addRowBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = getTablePos();
    const newRowIndex = getRowCount(currentNode);
    focusCellInRow(editor, pos, newRowIndex - 1);
    editor.commands.addRowAfter();
    focusAfterInsert(editor, pos, { row: newRowIndex });
  });

  const tableBodyArea = document.createElement("div");
  tableBodyArea.className = "table-body-area";
  tableBodyArea.appendChild(scrollContainer);
  tableBodyArea.appendChild(addColBtn);
  tableBodyArea.appendChild(rowControls);

  dom.appendChild(colControls);
  dom.appendChild(tableBodyArea);
  dom.appendChild(addRowBtn);

  updateColumns(currentNode, colgroup, table, cellMinWidth);

  let dragState: {
    type: "col" | "row";
    index: number;
    startX: number;
    startY: number;
    indicator: HTMLElement | null;
    preview: HTMLElement | null;
  } | null = null;

  const getTablePos = (): number => {
    const pos = getPos();
    return typeof pos === "number" ? pos : 0;
  };

  const buildColControls = () => {
    colControls.innerHTML = "";
    const colCount = getColumnCount(currentNode);

    const handles = document.createElement("div");
    handles.className = "table-col-handles";

    for (let i = 0; i < colCount; i++) {
      const handle = document.createElement("div");
      handle.className = "table-col-handle";
      handle.setAttribute("data-col-index", String(i));
      handle.appendChild(createIcon(ICONS.gripVertical));

      handle.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const pos = getTablePos();
        focusCellInColumn(editor, pos, i);

        dragState = {
          type: "col",
          index: i,
          startX: e.clientX,
          startY: e.clientY,
          indicator: null,
          preview: null,
        };
      });

      handle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getTablePos();
        showDropdown(handle, [
          {
            label: "Add column before",
            icon: ICONS.plus,
            action: () => {
              focusCellInColumn(editor, pos, i);
              editor.commands.addColumnBefore();
              focusAfterInsert(editor, pos, { col: i });
            },
          },
          {
            label: "Add column after",
            icon: ICONS.plus,
            action: () => {
              focusCellInColumn(editor, pos, i);
              editor.commands.addColumnAfter();
              focusAfterInsert(editor, pos, { col: i + 1 });
            },
          },
          ...(i > 0
            ? [
                {
                  label: "Move left",
                  icon: ICONS.arrowLeft,
                  action: () => moveColumn(editor, pos, i, i - 1),
                },
              ]
            : []),
          ...(i < colCount - 1
            ? [
                {
                  label: "Move right",
                  icon: ICONS.arrowRight,
                  action: () => moveColumn(editor, pos, i, i + 1),
                },
              ]
            : []),
          {
            label: "Delete column",
            icon: ICONS.trash2,
            action: () => {
              focusCellInColumn(editor, pos, i);
              editor.commands.deleteColumn();
            },
            destructive: true,
          },
        ]);
      });

      handles.appendChild(handle);
    }

    colControls.appendChild(handles);
  };

  const buildRowControls = () => {
    rowControls.innerHTML = "";
    const rowCount = getRowCount(currentNode);

    const handles = document.createElement("div");
    handles.className = "table-row-handles";

    for (let i = 0; i < rowCount; i++) {
      const handle = document.createElement("div");
      handle.className = "table-row-handle";
      handle.setAttribute("data-row-index", String(i));
      handle.appendChild(createIcon(ICONS.gripVertical));

      handle.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const pos = getTablePos();
        focusCellInRow(editor, pos, i);

        dragState = {
          type: "row",
          index: i,
          startX: e.clientX,
          startY: e.clientY,
          indicator: null,
          preview: null,
        };
      });

      handle.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getTablePos();
        showDropdown(handle, [
          {
            label: "Add row above",
            icon: ICONS.plus,
            action: () => {
              if (i === 0) {
                addRowAboveHeader(editor, pos);
              } else {
                focusCellInRow(editor, pos, i);
                editor.commands.addRowBefore();
              }
              focusAfterInsert(editor, pos, { row: i });
            },
          },
          {
            label: "Add row below",
            icon: ICONS.plus,
            action: () => {
              focusCellInRow(editor, pos, i);
              editor.commands.addRowAfter();
              focusAfterInsert(editor, pos, { row: i + 1 });
            },
          },
          ...(i > 0
            ? [
                {
                  label: "Move up",
                  icon: ICONS.arrowUp,
                  action: () => moveRow(editor, pos, i, i - 1),
                },
              ]
            : []),
          ...(i < rowCount - 1
            ? [
                {
                  label: "Move down",
                  icon: ICONS.arrowDown,
                  action: () => moveRow(editor, pos, i, i + 1),
                },
              ]
            : []),
          {
            label: "Delete row",
            icon: ICONS.trash2,
            action: () => {
              focusCellInRow(editor, pos, i);
              editor.commands.deleteRow();
            },
            destructive: true,
          },
        ]);
      });

      handles.appendChild(handle);
    }

    rowControls.appendChild(handles);
  };

  const syncControlPositions = () => {
    const cells = table.querySelectorAll(
      "tr:first-child th, tr:first-child td",
    );
    const colHandles =
      colControls.querySelectorAll<HTMLElement>(".table-col-handle");
    const tableRect = table.getBoundingClientRect();

    cells.forEach((cell, i) => {
      const handle = colHandles[i];
      if (!handle) return;
      const cellRect = (cell as HTMLElement).getBoundingClientRect();
      const centerX = cellRect.left - tableRect.left + cellRect.width / 2;
      handle.style.left = `${centerX}px`;
    });

    const rows = table.querySelectorAll("tr");
    const rowHandles =
      rowControls.querySelectorAll<HTMLElement>(".table-row-handle");

    rows.forEach((row, i) => {
      const handle = rowHandles[i];
      if (!handle) return;
      const rowRect = row.getBoundingClientRect();
      const centerY = rowRect.top - tableRect.top + rowRect.height / 2;
      handle.style.top = `${centerY}px`;
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState) return;

    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;

    if (!dragState.indicator) {
      dragState.indicator = document.createElement("div");
      dragState.indicator.className = `table-drag-indicator table-drag-indicator-${dragState.type}`;
      dom.appendChild(dragState.indicator);
      dom.classList.add("is-dragging");

      dragState.preview = createDragPreview(
        dragState.type,
        dragState.index,
        table,
      );
    }

    if (dragState.preview) {
      if (dragState.type === "row") {
        dragState.preview.style.left = `${e.clientX}px`;
        dragState.preview.style.top = `${e.clientY - 16}px`;
      } else {
        dragState.preview.style.left = `${e.clientX - 16}px`;
        dragState.preview.style.top = `${e.clientY}px`;
      }
    }

    const domRect = dom.getBoundingClientRect();
    const scrollRect = scrollContainer.getBoundingClientRect();
    const offsetLeft = scrollRect.left - domRect.left;
    const offsetTop = scrollRect.top - domRect.top;

    if (dragState.type === "col") {
      const cells = table.querySelectorAll(
        "tr:first-child th, tr:first-child td",
      );
      const tableRect = table.getBoundingClientRect();
      const slot = findInsertionSlot(cells, e.clientX, "x");

      if (slot !== dragState.index && slot !== dragState.index + 1) {
        const left = getInsertionEdge(cells, slot, "x", tableRect);
        dragState.indicator!.style.left = `${left + offsetLeft}px`;
        dragState.indicator!.style.top = `${offsetTop}px`;
        dragState.indicator!.style.height = `${table.offsetHeight}px`;
        dragState.indicator!.style.display = "";
      } else {
        dragState.indicator!.style.display = "none";
      }
    } else {
      const rows = table.querySelectorAll("tr");
      const tableRect = table.getBoundingClientRect();
      const slot = findInsertionSlot(rows, e.clientY, "y");

      if (slot !== dragState.index && slot !== dragState.index + 1) {
        const top = getInsertionEdge(rows, slot, "y", tableRect);
        dragState.indicator!.style.top = `${top + offsetTop}px`;
        dragState.indicator!.style.left = `${offsetLeft}px`;
        dragState.indicator!.style.width = `${table.offsetWidth}px`;
        dragState.indicator!.style.display = "";
      } else {
        dragState.indicator!.style.display = "none";
      }
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!dragState) return;

    const wasDragging = !!dragState.indicator;
    if (dragState.indicator) {
      dragState.indicator.remove();
    }
    if (dragState.preview) {
      dragState.preview.remove();
    }
    dom.classList.remove("is-dragging");

    if (wasDragging) {
      const pos = getTablePos();
      if (dragState.type === "col") {
        const cells = table.querySelectorAll(
          "tr:first-child th, tr:first-child td",
        );
        let targetIndex = findInsertionSlot(cells, e.clientX, "x");
        if (targetIndex > dragState.index) targetIndex--;
        targetIndex = Math.min(targetIndex, cells.length - 1);
        moveColumn(editor, pos, dragState.index, targetIndex);
      } else {
        const rows = table.querySelectorAll("tr");
        let targetIndex = findInsertionSlot(rows, e.clientY, "y");
        if (targetIndex > dragState.index) targetIndex--;
        targetIndex = Math.min(targetIndex, rows.length - 1);
        moveRow(editor, pos, dragState.index, targetIndex);
      }
    }

    dragState = null;
    clearActiveHandles();
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);

  const syncEditableState = () => {
    dom.classList.toggle("is-readonly", !editor.isEditable);
  };

  syncEditableState();

  buildColControls();
  buildRowControls();

  const clearActiveHandles = () => {
    colControls.querySelectorAll(".active").forEach((el) => {
      el.classList.remove("active");
    });
    rowControls.querySelectorAll(".active").forEach((el) => {
      el.classList.remove("active");
    });
  };

  const handleTableMouseOver = (e: MouseEvent) => {
    if (dragState) return;

    const target = e.target as HTMLElement;
    const cell = target.closest("td, th");
    if (!cell) return;

    const row = cell.parentElement as HTMLTableRowElement;
    if (!row) return;

    const colIndex = Array.from(row.cells).indexOf(
      cell as HTMLTableCellElement,
    );
    const rows = table.querySelectorAll("tr");
    const rowIndex = Array.from(rows).indexOf(row);

    clearActiveHandles();

    const colHandles =
      colControls.querySelectorAll<HTMLElement>(".table-col-handle");
    const rowHandles =
      rowControls.querySelectorAll<HTMLElement>(".table-row-handle");

    if (colHandles[colIndex]) colHandles[colIndex].classList.add("active");
    if (rowHandles[rowIndex]) rowHandles[rowIndex].classList.add("active");
  };

  const handleTableMouseLeave = () => {
    if (dragState) return;
    clearActiveHandles();
  };

  tableBodyArea.addEventListener("mouseover", handleTableMouseOver);
  tableBodyArea.addEventListener("mouseleave", handleTableMouseLeave);

  const resizeObserver = new ResizeObserver(() => {
    syncControlPositions();
  });
  resizeObserver.observe(table);

  requestAnimationFrame(() => syncControlPositions());

  return {
    dom,
    contentDOM,
    update(updatedNode: PmNode) {
      if (updatedNode.type !== currentNode.type) return false;

      const prevColCount = getColumnCount(currentNode);
      const prevRowCount = getRowCount(currentNode);
      currentNode = updatedNode;
      updateColumns(currentNode, colgroup, table, cellMinWidth);

      const newColCount = getColumnCount(currentNode);
      const newRowCount = getRowCount(currentNode);
      if (prevColCount !== newColCount) buildColControls();
      if (prevRowCount !== newRowCount) buildRowControls();

      syncEditableState();
      requestAnimationFrame(() => syncControlPositions());
      return true;
    },
    ignoreMutation(mutation: { type: string; target: Node }) {
      if (
        mutation.target === dom ||
        mutation.target === colControls ||
        mutation.target === rowControls
      ) {
        return true;
      }
      if (
        dom.contains(mutation.target as Node) &&
        !contentDOM.contains(mutation.target as Node)
      ) {
        return true;
      }
      return false;
    },
    destroy() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      tableBodyArea.removeEventListener("mouseover", handleTableMouseOver);
      tableBodyArea.removeEventListener("mouseleave", handleTableMouseLeave);
      resizeObserver.disconnect();
    },
  };
};
