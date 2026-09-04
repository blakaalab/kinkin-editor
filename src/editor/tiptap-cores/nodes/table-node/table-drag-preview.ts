export const createDragPreview = (
  type: "col" | "row",
  index: number,
  table: HTMLTableElement,
): HTMLElement => {
  const preview = document.createElement("div");
  preview.className = "table-drag-preview";

  const sourceRows = table.querySelectorAll("tr");
  const previewTable = document.createElement("table");
  previewTable.style.borderCollapse = "collapse";
  const previewBody = document.createElement("tbody");
  previewTable.appendChild(previewBody);

  const tableStyles = getComputedStyle(table);
  previewTable.style.fontSize = tableStyles.fontSize;
  previewTable.style.lineHeight = tableStyles.lineHeight;

  if (type === "row") {
    const sourceRow = sourceRows[index];
    if (sourceRow) {
      const sourceCells = sourceRow.querySelectorAll("th, td");
      const clonedRow = sourceRow.cloneNode(true) as HTMLElement;
      const clonedCells = clonedRow.querySelectorAll("th, td");
      clonedCells.forEach((cell, i) => {
        const rect = sourceCells[i].getBoundingClientRect();
        (cell as HTMLElement).style.width = `${rect.width}px`;
        (cell as HTMLElement).style.minWidth = `${rect.width}px`;
        (cell as HTMLElement).style.maxWidth = `${rect.width}px`;
      });
      previewBody.appendChild(clonedRow);
    }
    const tableRect = table.getBoundingClientRect();
    previewTable.style.width = `${tableRect.width}px`;
  } else {
    for (const row of sourceRows) {
      const cells = row.querySelectorAll("th, td");
      const sourceCell = cells[index];
      if (!sourceCell) continue;
      const rect = sourceCell.getBoundingClientRect();
      const clonedRow = document.createElement("tr");
      const clonedCell = sourceCell.cloneNode(true) as HTMLElement;
      clonedCell.style.width = `${rect.width}px`;
      clonedCell.style.minWidth = `${rect.width}px`;
      clonedCell.style.maxWidth = `${rect.width}px`;
      clonedRow.appendChild(clonedCell);
      previewBody.appendChild(clonedRow);
    }
  }

  preview.appendChild(previewTable);
  document.body.appendChild(preview);
  return preview;
};
