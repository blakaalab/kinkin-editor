/**
 * The class `@blakaa/kinkin-editor/content.css` scopes every rule to. Put it on
 * the element a rendered document goes into; nothing is styled without it.
 *
 * Deliberately not `EDITOR_SCOPE_CLASS`: the editor stylesheet carries Tailwind
 * utilities, theme variables and editing chrome that a page has no use for.
 */
export const CONTENT_SCOPE_CLASS = "kinkin-content";
