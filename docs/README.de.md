<p align="center">
  <img src="../assets/banner.svg" alt="Kinkin Editor - ein Rich-Text-Editor für React, gebaut auf Tiptap und ProseMirror" width="100%">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@blakaa/kinkin-editor"><img src="https://img.shields.io/npm/v/@blakaa/kinkin-editor?color=green" alt="npm-Version"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT-Lizenz"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/react-18%20%7C%2019-149eca.svg" alt="React 18 und 19"></a>
  <a href="https://tiptap.dev"><img src="https://img.shields.io/badge/tiptap-3.31-000000.svg" alt="Tiptap 3.31"></a>
</p>

<p align="center">
  <strong>Sprachen:</strong>
  <a href="../README.md">English</a> ·
  <a href="README.vi.md">Tiếng Việt</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.fr.md">Français</a> ·
  Deutsch
</p>

# Kinkin Editor

**Ein Rich-Text-Editor für React zum direkten Einbauen.** Ein WYSIWYG im Stil von
Notion, gebaut auf [Tiptap](https://tiptap.dev) und ProseMirror: Markdown rein,
Markdown raus (oder HTML/JSON), mit Slash-Befehlen, Tabellen, Bildern, Emojis, per
Drag-and-drop umsortierbaren Blöcken, Inhaltsverzeichnis und einem AI-Assist-Panel,
das von einem LLM deiner Wahl streamt.

```bash
npm install @blakaa/kinkin-editor
```

Er ist dafür gemacht, in eine React-App zu wandern, die du bereits hast: kein
globales CSS-Reset, keine erforderliche Tailwind-Konfiguration, kein Provider zum
Einhängen und keine Annahmen über dein Backend — Bild-Upload und KI sind schlichte
Callbacks, die du bereitstellst oder eben weglässt.

**[Demo und Playground →](https://blakaalab.github.io/kinkin-editor/)** ·
[Einrichtungsanleitung](https://blakaalab.github.io/kinkin-editor/#/docs) ·
[Releases](https://github.com/blakaalab/kinkin-editor/releases)

---

## Funktionen

**Slash-Menü** (`/` tippen): Absatz, Überschrift 1–4, Aufzählung, Nummerierte Liste,
Aufgabenliste, Zitat, Code, Emoji, Tabelle, Bild, Trennlinie.

**Ebenfalls eingebaut**

- Markdown rein, Markdown raus — Markdown einfügen und es wird zu formatiertem Inhalt
- Emoji-Auswahl über `:`
- Ziehgriff an jedem Block zum Umsortieren; `Mod-Shift-↑/↓` zum Verschieben,
  `Mod-Shift-D` zum Duplizieren
- Tabellen mit Zeilen-/Spaltensteuerung und Umsortieren per Drag-and-drop
- Link-Bearbeitung, Codeblöcke, Aufgabenlisten, Hervorhebungen, typografische Ersetzungen
- Bild-Upload über einen Callback, den du bereitstellst
- AI Assist mit Streaming — verbessern, fortsetzen, zusammenfassen, Grammatik
  korrigieren, vereinfachen, kürzen, erweitern, übersetzen, Tonfall ändern oder ein
  eigener Prompt
- Inhaltsverzeichnis über `onTocItemsChange`
- Gespeicherte Dokumente ohne den Editor rendern — eine Extension-Liste nur mit
  dem Schema und ein reines Darstellungs-Stylesheet, beide separat veröffentlicht
- Feste Toolbar, über der Auswahl schwebende Toolbar und mobile Toolbar
- TypeScript-Typen enthalten; läuft mit React 18 und 19

---

## Installation

```bash
npm install @blakaa/kinkin-editor    # oder: pnpm add @blakaa/kinkin-editor
```

Auf npm 7+ und pnpm ist das der ganze Befehl: Beide lesen `peerDependencies` und
installieren React sowie alle 21 `@tiptap/*`-Pakete für dich — du musst sie nicht
auflisten.

### Yarn

Yarn installiert Peer-Dependencies **nicht** automatisch — weder Classic noch Berry.
Du brauchst sie explizit (mit Klammer-Expansion bleibt es bei zwei Zeilen):

```bash
yarn add @blakaa/kinkin-editor
yarn add react react-dom \
  @tiptap/{core,react,pm,starter-kit,extensions,markdown,suggestion,extension-emoji,extension-highlight,extension-history,extension-horizontal-rule,extension-image,extension-list,extension-mention,extension-strike,extension-table,extension-table-of-contents,extension-text-style,extension-typography,extension-unique-id,extension-drag-handle-react}
```

### Warum überhaupt Peer-Dependencies

React und ProseMirror müssen **einzelne Instanzen** sein. Zwei Kopien von React
liefern „Invalid hook call"; zwei Kopien von ProseMirror liefern
`RangeError: Invalid content` und Plugin-Key-Kollisionen, weil sich
`prosemirror-model` auf `instanceof`-Prüfungen und eine gemeinsame Schema-Registry
stützt. Sie als Peers zu deklarieren ist genau das, was Paketmanager dazu bringt, auf
eine Kopie zu deduplizieren.

Jeder `@tiptap/*`-Peer ist auf `~3.31.3` festgenagelt — die Version, gegen die diese
Bibliothek gebaut und getestet wird. Gemischte Tiptap-Minor-Versionen scheitern zur
Build-Zeit, deshalb bleibt der Bereich bewusst eng und wandert bei jedem geprüften
Tiptap-Upgrade als Ganzes weiter.

---

## Schnellstart

```tsx
import { useState } from "react";
import { FixedToolbar, RichTextEditor } from "@blakaa/kinkin-editor";
import "@blakaa/kinkin-editor/style.css";

export function Editor() {
  const [markdown, setMarkdown] = useState("# Hello\n\nStart typing.");

  return (
    <div style={{ height: "100vh" }}>
      <RichTextEditor
        initialContent={markdown}
        contentType="markdown"
        outputContentType="markdown"
        onChange={(value) => setMarkdown(value as string)}
        toolbar={<FixedToolbar />}
      />
    </div>
  );
}
```

Zwei Dinge, über die man leicht stolpert:

1. **Das Stylesheet importieren.** Einmal `import "@blakaa/kinkin-editor/style.css"`,
   irgendwo in deiner App. Ohne das wird der Editor ohne Styles gerendert.
2. **Ihm eine Höhe geben.** Der Editor füllt seinen Container (`height: 100%`). In
   einem Container ohne Höhe fällt er auf nichts zusammen. Nimm ein Elternelement mit
   expliziter Höhe, oder `min-height: 0`, wenn es ein Flex-Kind ist.

Die Toolbar ist optional — lass `toolbar` weg für einen Editor ohne Rahmenwerk, der
weiterhin über Slash-Befehle und die Auswahl-Toolbar bedienbar bleibt.

---

## Zusammen mit deinem eigenen Tailwind CSS

**Kurzfassung: nichts zu konfigurieren. Es kann nicht mit deinen Styles kollidieren.**

Tailwind aus einer Bibliothek auszuliefern verursacht normalerweise drei Probleme.
Alle drei werden zur Build-Zeit erledigt:

| Problem | Wie es vermieden wird |
| --- | --- |
| Utility-Kollisionen — das `.text-sm` der Bibliothek verändert still *deine* App | Jede Regel ist unter `.kinkin-editor` verschachtelt und gilt nur innerhalb des Editors |
| Token-Leck — die `--color-*` der Bibliothek überschreiben dein Theme auf `:root` | `:root` wird zu `.kinkin-editor` umgeschrieben; nichts landet auf der Dokumentwurzel |
| Doppeltes Preflight — zwei Basis-Resets im Streit | Das Stylesheet wird **ohne Preflight** gebaut |

Das `.text-gray-500` der Bibliothek und deins können völlig verschiedene Werte haben,
ohne dass eines gestört wird. Du brauchst Tailwind gar nicht — ausgeliefert wird
schlichtes kompiliertes CSS.

Per Portal gerendertes UI (Menüs, Tooltips, Drag-Vorschauen, mobile Toolbar) würde
diesem Geltungsbereich normalerweise entkommen, weil es in `document.body` rendert.
Es wird in einen Container portaliert, der dieselbe Klasse trägt und über
`getEditorPortalRoot()` zugänglich ist.

---

## Theming

Überschreibe die Design-Tokens auf der Scope-Klasse — sie wirken auf alles darin:

```css
.kinkin-editor {
  --color-background: #ffffff;        /* Flächen: Toolbar, Menüs, Dialoge */
  --color-foreground: #1f2937;        /* Fließtext */
  --color-control: #4b5563;           /* Beschriftungen und Icons in Toolbar und Menüs */
  --color-muted-foreground: #6b7280;  /* sekundärer Text */
  --color-placeholder: #9ca3af;       /* Platzhalter, Hinweis-Icons */
  --color-accent: #f3f4f6;            /* Hover-Flächen */
  --color-accent-foreground: #111827; /* Beschriftung eines aktiven Buttons */
  --color-selected: #ede9fe;          /* Fläche eines aktiven Buttons */
  --color-border: #e5e7eb;            /* Trenner, Umrandung der Farbfelder */
  --color-border-subtle: #f3f4f6;     /* Haarlinien um die Oberfläche */
  --color-ring: #7c3aed;              /* Fokusring */
  --color-primary-700: #7c3aed;       /* Akzentrampe: KI, Upload, Links */
  --color-brand: #7c3aed;             /* aktiver Eintrag im Inhaltsverzeichnis */
  --font-sans: "Inter", system-ui, sans-serif;
}
```

Das Styling des Editor-*Inhalts* (Codeblöcke, Tabellen, Aufgabenlisten, Zitate)
nutzt einen eigenen `--tt-core-*`-Namensraum, der genauso überschrieben wird:

```css
.kinkin-editor {
  --tt-core-code-bg: #f5f5f5;
  --tt-core-table-header-bg: #fafafa;
  --tt-core-link: #2563eb;
  --tt-core-selection: #dbeafe;
  --tt-core-selection-text: #1f2937;  /* markierter Text; standardmäßig --color-foreground */
}
```

---

## Gespeicherte Inhalte ohne den Editor rendern

Ein gespeichertes Dokument ist Tiptap-JSON, und um es auf einer öffentlichen
Seite zu rendern, braucht man zwei Dinge, für die das Editor-Bundle die falsche
Quelle ist: das Schema und das Content-CSS. Beides wird separat veröffentlicht.

```tsx
// Eine Server Component. Kein React-Editor, kein Editor-Stylesheet, keine Browser-APIs.
import { generateHTML } from "@tiptap/core";
import { CONTENT_SCOPE_CLASS, createContentExtensions } from "@blakaa/kinkin-editor/content";
import "@blakaa/kinkin-editor/content.css";

export function Post({ doc }: { doc: JSONContent }) {
  const html = generateHTML(doc, createContentExtensions());

  return (
    <article
      className={CONTENT_SCOPE_CLASS}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

### `createContentExtensions()`

Alle Extensions, die das Dokument formen — Nodes, Marks und die Attribute darauf
— und nichts, was es nur gibt, damit das Editieren funktioniert.
`<RichTextEditor />` baut seine eigene Liste auf dieser auf und hängt Node Views
und Commands über den Namen an. Beide können also nicht auseinanderlaufen: eine
Node, die für den Editor hinzukommt, ist eine Node, die diese Liste bereits
rendert.

Das ist die Liste für `generateHTML`, `generateJSON` oder `getSchema`. Zu
vermeiden ist, die Extensions des Editors von Hand nachzubauen: ein Dokument mit
einer Node, die deine Liste nicht kennt, wirft
`RangeError: Unknown node type` — und zwar für die Leser, in der Produktion, bei
genau dem Beitrag, der zufällig die neue Node benutzt hat.

Drei Einträge wirken überraschend und sind alle drei tragend:

| Eintrag | Warum er hier steht |
| --- | --- |
| `ContentTable` | Gibt `.table-node-wrapper > .table-scroll-container` um die Tabelle aus — genau das, was die Node View beim Editieren aufbaut. Ohne ihn läuft eine breite Tabelle über die Seite hinaus und kein einziges Tabellen-CSS greift. |
| `ImageUploadNode` | Der Platzhalter für einen Upload, der nie fertig wurde. In gespeicherten Inhalten selten, und auf der Seite von `content.css` ausgeblendet — aber ein Dokument, das ihn enthält, muss sich trotzdem parsen lassen. |
| `TableOfContents` | Verantwortet die Attribute `id` und `data-toc-id` an Überschriften. Lässt man sie weg, verliert jede Überschrift ihren Anker; Sprungmarken und jedes Inhaltsverzeichnis, das du daneben renderst, gehen kaputt. |

`generateHTML` serialisiert über das DOM, braucht auf einem Server also eines:
Installiere `jsdom` oder `happy-dom` und setze `globalThis.document` vor dem
Aufruf. Das ist eine Anforderung von Tiptap, nicht von kinkin. (Mit jsdom siehst
du eine `HTMLCanvasElement's getContext() method`-Warnung: Sie stammt aus der
Support-Prüfung der Emoji-Extension, die korrekt auf Bild-Emoji zurückfällt.)

### `content.css`

Die Darstellungshälfte. Nur Content-Regeln — keine Toolbars, Menüs, Auswahl- oder
Drag-Elemente, keine Tailwind-Utilities, kein `@theme`-Block und kein Reset — und
jede Regel stammt aus derselben Quelle wie die des Editors. Eine gerenderte Seite
und der Editor können also nicht unterschiedlich aussehen.

Drei Eigenschaften, die man kennen sollte:

**Sie ist auf eine einzige Klasse begrenzt, die du selbst setzt.** Nichts wird
gestylt, bevor `kinkin-content` (exportiert als `CONTENT_SCOPE_CLASS`) am Element
steht. Schriftgröße, -familie und Textfarbe werden geerbt, nie gesetzt — jedes
Maß steht in `em`, der Inhalt skaliert also mit dem, was deine Seite ihm vorgibt.

**Sie liegt in einem Cascade Layer.** Alles steht in `@layer kinkin-content`.
CSS ohne Layer schlägt einen Layer unabhängig von der Spezifität, deine eigenen
Regeln setzen sich also ohne `!important` und ohne Spezifitätsspielchen durch:

```css
/* Ohne Layer, also gewinnt das gegen content.css — der Selektor muss nicht
   spezifischer sein als der, den er überschreibt. */
.kinkin-content h1 { font-size: 2.5rem; }
```

**Jede Farbe ist eine `--tt-core-*`-Variable, und das Stylesheet deklariert
keine davon.** Jede ist ein `var()` mit ihrem Standardwert als Fallback: Ein
Token irgendwo oberhalb des Content-Elements zu setzen, thematisiert es also —
Dark Mode eingeschlossen:

```css
html.dark {
  --tt-core-code-bg: #232733;
  --tt-core-code-text: #e6e8ec;
  --tt-core-codeblock-bg: #1b1f27;
  --tt-core-blockquote: #5b6472;
  --tt-core-link: #7ebcfd;
  --tt-core-horizontal-line: #2b303a;
  --tt-core-table-border: #2b303a;
  --tt-core-table-header-bg: #1b1f27;
  --tt-core-table-stripe-bg: #191c23;
  --tt-core-tasklist-bg: #232733;
  --tt-core-tasklist-border: #5b6472;
}
```

(Deshalb deklariert das Stylesheet auf `.kinkin-content` selbst keine
Standardwerte: Eine geerbte Custom Property wird über die Nähe aufgelöst, nicht
über die Spezifität — eine Deklaration am Content-Element würde eine in
`html.dark` also stillschweigend schlagen.)

Zwei reine Darstellungsentscheidungen: Die Checkboxen von Aufgabenlisten werden
gerendert, sind aber nicht klickbar — eine Seite hat nirgends Platz, den Klick zu
speichern — und der `imageUpload`-Platzhalter wird ausgeblendet.

Eine Einschränkung: Das Scope-Element hat `white-space: pre-wrap`, wie der
Editor, damit vom Autor getippte Leerzeichenfolgen erhalten bleiben. Formatiere
oder rücke das erzeugte HTML darin nicht ein — diese Einrückung würde mit
gerendert.

---

## API-Referenz

### `<RichTextEditor />`

| Prop | Typ | Standard | Beschreibung |
| --- | --- | --- | --- |
| `initialContent` | `Content` | — | Startinhalt: ein Markdown-/HTML-String oder ein Tiptap-JSON-Dokument. Eine Änderung nach dem Mounten ersetzt den Inhalt und löscht die Undo-Historie. |
| `contentType` | `"markdown" \| "html" \| "json"` | `"markdown"` | Wie `initialContent` interpretiert wird. |
| `outputContentType` | `"markdown" \| "html" \| "json" \| "text"` | `"markdown"` | Was `onChange` ausgibt. |
| `onChange` | `(value, meta?) => void` | — | Feuert beim Bearbeiten. `value` ist ein String, oder `JSONContent`, wenn die Ausgabe `"json"` ist. Während des KI-Streamings unterdrückt. |
| `editable` | `boolean` | `true` | `false` rendert schreibgeschützt — Toolbars verschwinden, Inhalt bleibt markierbar. |
| `toolbar` | `ReactNode` | — | Wird über dem Inhalt gerendert, innerhalb des Editor-Kontexts. Übergib `<FixedToolbar />`. |
| `imageUploadHandler` | `EditorImageUploadHandler` | — | Aktiviert den Bild-Upload. Weglassen zum Deaktivieren. |
| `streamCompletion` | `StreamCompletionFn` | — | Aktiviert AI Assist. Weglassen zum Deaktivieren. |
| `aiMode` | `"assist" \| "chat"` | — | Welchen KI-Button die Auswahl-Toolbar zeigt. |
| `onAiChatRequest` | `(message, selectedText) => void` | — | Wird vom Chat-Button aufgerufen, wenn `aiMode="chat"`. |
| `onTocItemsChange` | `(items) => void` | — | Feuert, wenn sich Überschriften ändern. Speise damit `<ToC />`. |
| `editorRef` | `RefObject<Editor \| null>` | — | Notausgang zur darunterliegenden Tiptap-Instanz. |
| `pageTitle` | `string` | — | Wird als Kontext in AI-Assist-Prompts aufgenommen. |
| `placeholder` | `string` | — | Platzhalter für ein leeres Dokument. |

Das `meta.source` von `onChange` ist `"manual"` bei Nutzereingaben und
`"conversation"` bei programmatischen Änderungen — praktisch, um Autosave bei
Änderungen zu überspringen, die nicht vom Nutzer stammen.

### Toolbars

| Export | Verhalten |
| --- | --- |
| `<FixedToolbar showAiAssist? className? />` | Dauerhafte Leiste. Über die `toolbar`-Prop übergeben. Undo/Redo, Blocktyp (Absatz, H1–H4), Listen (Aufzählung/nummeriert/Aufgaben), fett/kursiv/unterstrichen/durchgestrichen/Code, Zitat, Codeblock, Trennlinie, Link, Tabelle, Bild, Slash-Auslöser, AI Assist. |
| `<SelectionToolbar />` | Schwebt auf dem Desktop über markiertem Text. Wird automatisch gerendert. |
| `<MobileToolbar />` | Dockt unter 480 px am unteren Rand an. Wird automatisch gerendert. |

Nur `FixedToolbar` musst du einhängen; die anderen beiden sind bereits verdrahtet.

### `<ToC />`

```tsx
const [items, setItems] = useState([]);
const editorRef = useRef(null);

<RichTextEditor editorRef={editorRef} onTocItemsChange={setItems} {...rest} />
<ToC items={items} editor={editorRef.current} trackScroll />
```

| Prop | Typ | Standard | Beschreibung |
| --- | --- | --- | --- |
| `items` | `TableOfContentDataItem[]` | `[]` | Kommt aus `onTocItemsChange`. |
| `editor` | `Editor \| null` | — | Kommt aus `editorRef`. Wird gebraucht, um zu Überschriften zu scrollen. |
| `trackScroll` | `boolean` | `true` | Hebt die gerade sichtbare Überschrift hervor. Lauscht auf das Scrollen des *window*, also abschalten, wenn der Editor in deinem eigenen Scroll-Container sitzt. |

### `imageUploadHandler` — Bild-Upload

Wird für Bilder aufgerufen, die abgelegt, eingefügt oder über die Toolbar gewählt
werden. Gib die URL zum Einbetten zurück; ein geworfener Fehler markiert den Upload
in der Oberfläche als fehlgeschlagen.

```ts
import type { EditorImageUploadHandler } from "@blakaa/kinkin-editor";

const imageUploadHandler: EditorImageUploadHandler = {
  upload: async (file: File, onProgress: (percent: number) => void) => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");

    onProgress(100);
    return (await res.json()).url;
  },
};
```

### `streamCompletion` — AI Assist mit Streaming

Das treibt AI Assist an. Die Bibliothek baut den Prompt aus der vom Nutzer gewählten
Aktion (`improve`, `continue`, `summarize`, `fix-grammar`, `simplify`, `shorten`,
`extend`, `translate`, `tone`, `custom`) plus dem umgebenden Kontext. Der Transport
gehört dir: Rufe `onChunk` pro Token, `onComplete` am Ende und `onError` bei einem
Fehler auf, und respektiere `signal`, damit der Stopp-Button funktioniert.

```ts
import type { StreamCompletionFn } from "@blakaa/kinkin-editor";

const streamCompletion: StreamCompletionFn = async ({
  message,
  signal,
  onChunk,
  onComplete,
  onError,
}) => {
  try {
    const res = await fetch("/api/llm", {
      method: "POST",
      body: JSON.stringify({ prompt: message }),
      signal,
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      onChunk(decoder.decode(value, { stream: true }));
    }

    onComplete();
  } catch (e) {
    if (!signal?.aborted) onError(e instanceof Error ? e.message : "Failed");
  }
};
```

Lässt du es weg, werden die KI-Buttons wirkungslos, mit einer Warnung in der Konsole.

### Weitere Exports

| Export | Zweck |
| --- | --- |
| `useAiAssistStream(editor, options)` | Der Hook hinter AI Assist, falls du deinen eigenen Editor zusammenbaust. |
| `getEditorPortalRoot()` | Der Container mit Geltungsbereich, in den portaliertes UI rendert. |
| `EDITOR_SCOPE_CLASS` | `"kinkin-editor"` — die Scope-Klasse, um eigene Portale zu kennzeichnen. |
| `createContentExtensions()` | Die Extension-Liste nur mit dem Schema, zum Rendern gespeicherter Dokumente. Auch unter `@blakaa/kinkin-editor/content`. |
| `CONTENT_SCOPE_CLASS` | `"kinkin-content"` — die Klasse, auf die `content.css` seine Regeln begrenzt. |
| `<ToCItem />`, `<ToCEmptyState />` | Die Bausteine von `<ToC />`, falls du ein eigenes Gliederungs-Layout willst. |
| Typen | `RichTextEditorProps`, `EditorImageUploadHandler`, `StreamCompletionFn`, `StreamCompletionParams` |

---

## Rezepte

**Autosave, programmatische Änderungen überspringen**

```tsx
<RichTextEditor
  onChange={(value, meta) => {
    if (meta?.source === "manual") debouncedSave(value as string);
  }}
  {...rest}
/>
```

**Schreibgeschützte Vorschau**

```tsx
<RichTextEditor initialContent={doc} editable={false} contentType="markdown" />
```

**An die Tiptap-Instanz kommen**

```tsx
const editorRef = useRef(null);
<RichTextEditor editorRef={editorRef} {...rest} />;
// später: editorRef.current?.commands.focus()
```

**HTML statt Markdown**

```tsx
<RichTextEditor contentType="html" outputContentType="html" {...rest} />
```

---

## Fehlerbehebung

### Der Editor wird ohne Styles gerendert

Du hast `import "@blakaa/kinkin-editor/style.css"` vergessen.

### Der Editor hat die Höhe null

Er füllt seinen Container. Gib dem Elternelement eine explizite Höhe, oder
`min-height: 0`, wenn es ein Flex-Kind ist.

### Doppeltes `@tiptap/core`, oder `getPreviousBlockSibling is not exported`

Mehr als eine Tiptap-Version in deinem Abhängigkeitsbaum. Tiptaps eigene transitive
`^3.31.3`-Bereiche können sich auf eine neuere Minor-Version auflösen und eine zweite
Kopie von `@tiptap/core` hereinziehen. Nagle den gesamten Scope in der `package.json`
deiner App fest:

```json
{
  "overrides": {
    "@tiptap/core": "3.31.3",
    "@tiptap/pm": "3.31.3"
  }
}
```

(Yarn nennt das `resolutions`.) Bewege beim Upgrade den ganzen Scope gemeinsam —
gemischte Tiptap-Minor-Versionen scheitern zur Build-Zeit, nicht zur Laufzeit.

### Menüs oder Tooltips erscheinen ohne Styles

Irgendetwas rendert sie außerhalb des Containers mit Geltungsbereich. Portaliere sie
nach `getEditorPortalRoot()`.

### Die Styles meiner App haben sich geändert, nachdem ich den Editor eingebaut habe

Sollten sie nicht — genau das verhindert der Geltungsbereich. Wenn es doch passiert,
ist das ein Bug, der eine Meldung wert ist.

### `RangeError: Unknown node type` beim Rendern von gespeichertem JSON

Die Extension-Liste, die du an `generateHTML` übergeben hast, deckt das Dokument
nicht ab. Übergib `createContentExtensions()` aus
`@blakaa/kinkin-editor/content` statt einer handgeschriebenen Liste — es ist
dasselbe Schema, das der Editor ausführt, und bleibt damit korrekt, wenn der
Editor Nodes dazubekommt. Siehe
[Gespeicherte Inhalte ohne den Editor rendern](#gespeicherte-inhalte-ohne-den-editor-rendern).

### Gerenderte Inhalte sind ungestylt, oder Tabellen laufen über die Seite hinaus

Importiere `@blakaa/kinkin-editor/content.css` und setze `kinkin-content` auf das
Element, in das das HTML geht — ohne die Klasse greift nichts aus diesem
Stylesheet. Wenn speziell Tabellen überlaufen, wurde das HTML mit einer normalen
`Table`-Extension erzeugt statt mit der aus `createContentExtensions()`, die den
Scroll-Container ausgibt, den das CSS braucht.

---

## Lizenz

[MIT](../LICENSE). Nutzen, forken, kommerziell ausliefern — behalte einfach den
Copyright-Hinweis bei.

---

## Lokale Entwicklung

Verzeichnisstruktur, Konventionen und Build-Hinweise stehen im Abschnitt
[Local development](../README.md#local-development) der englischen README.
