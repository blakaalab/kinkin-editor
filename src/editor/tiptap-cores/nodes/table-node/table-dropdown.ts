import { createIcon, type SvgNode } from "./table-icons";

export interface DropdownItem {
  label: string;
  icon: SvgNode[];
  action: () => void;
  destructive?: boolean;
}

export const showDropdown = (anchor: HTMLElement, items: DropdownItem[]) => {
  const existing = document.querySelector(".table-control-dropdown");
  if (existing) existing.remove();

  const dropdown = document.createElement("div");
  dropdown.className = "table-control-dropdown";
  dropdown.setAttribute("role", "menu");

  let focusedIndex = -1;

  const focusItem = (index: number) => {
    const buttons = dropdown.querySelectorAll<HTMLButtonElement>(
      ".table-control-dropdown-item",
    );
    if (index < 0 || index >= buttons.length) return;
    focusedIndex = index;
    buttons.forEach((b) => {
      b.classList.remove("focused");
    });
    buttons[index].classList.add("focused");
    buttons[index].focus();
  };

  for (const [i, item] of items.entries()) {
    const btn = document.createElement("button");
    btn.className = "table-control-dropdown-item";
    btn.setAttribute("role", "menuitem");
    if (item.destructive) btn.classList.add("destructive");
    btn.appendChild(createIcon(item.icon));
    const label = document.createElement("span");
    label.textContent = item.label;
    btn.appendChild(label);
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      close();
      item.action();
    });
    btn.addEventListener("mouseenter", () => focusItem(i));
    dropdown.appendChild(btn);
  }

  dropdown.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(focusedIndex < items.length - 1 ? focusedIndex + 1 : 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(focusedIndex > 0 ? focusedIndex - 1 : items.length - 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0) {
        close();
        items[focusedIndex].action();
      }
    }
  });

  document.body.appendChild(dropdown);

  const rect = anchor.getBoundingClientRect();
  const dropdownRect = dropdown.getBoundingClientRect();
  const top =
    rect.bottom + 4 + dropdownRect.height > window.innerHeight
      ? rect.top - dropdownRect.height - 4
      : rect.bottom + 4;
  const left = Math.min(rect.left, window.innerWidth - dropdownRect.width - 8);
  dropdown.style.top = `${top}px`;
  dropdown.style.left = `${left}px`;

  focusItem(0);

  const close = () => {
    dropdown.remove();
    document.removeEventListener("mousedown", onClickAway);
  };

  const onClickAway = (e: MouseEvent) => {
    if (!dropdown.contains(e.target as Node)) close();
  };

  setTimeout(() => document.addEventListener("mousedown", onClickAway), 0);
};
