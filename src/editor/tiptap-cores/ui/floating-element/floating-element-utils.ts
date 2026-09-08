import type { Editor } from "@tiptap/react";

import { EDITOR_SCOPE_CLASS, getEditorPortalRoot } from "@/editor/portal-root";

/**
 * Whether `element` belongs to this editor rather than the page around it.
 *
 * "The editor" is the whole scoped subtree, not just the content area: the
 * toolbars sit next to the ProseMirror node, and menus, popovers and tooltips
 * portal out to `getEditorPortalRoot()` entirely. Treating those as outside
 * would let a click on a toolbar dropdown dismiss the floating toolbar and
 * take the user's selection down with it.
 */
export const isElementWithinEditor = (
  editor: Editor | null,
  element: Node | null,
) => {
  if (!element || !editor) {
    return false;
  }

  const scope =
    editor.view.dom.closest(`.${EDITOR_SCOPE_CLASS}`) ??
    editor.view.dom.parentElement;

  if (scope && (scope === element || scope.contains(element))) {
    return true;
  }

  const portalRoot = getEditorPortalRoot();

  return (
    !!portalRoot && (portalRoot === element || portalRoot.contains(element))
  );
};
