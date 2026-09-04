/**
 * The class every editor DOM subtree carries. The published stylesheet scopes
 * all of its rules under this selector, so the library's Tailwind utilities can
 * never leak into (or be overridden by) the host app's own styles.
 */
export const EDITOR_SCOPE_CLASS = "kinkin-editor";

let portalRoot: HTMLElement | null = null;

/**
 * Menus, tooltips, drag previews and the mobile toolbar all render outside the
 * editor's own DOM tree. They still need the scoped styles, so they portal into
 * this container rather than straight into `document.body`.
 */
export function getEditorPortalRoot(): HTMLElement | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  if (portalRoot?.isConnected) {
    return portalRoot;
  }

  portalRoot = document.createElement("div");
  portalRoot.className = EDITOR_SCOPE_CLASS;
  portalRoot.dataset.kinkinPortalRoot = "";
  document.body.appendChild(portalRoot);

  return portalRoot;
}
