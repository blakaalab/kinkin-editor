<p align="center">
  <img src="../assets/banner.svg" alt="Kinkin Editor - un editor de texto enriquecido para React, construido sobre Tiptap y ProseMirror" width="100%">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@blakaa/kinkin-editor"><img src="https://img.shields.io/npm/v/@blakaa/kinkin-editor?color=green" alt="versión en npm"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Licencia MIT"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/react-18%20%7C%2019-149eca.svg" alt="React 18 y 19"></a>
  <a href="https://tiptap.dev"><img src="https://img.shields.io/badge/tiptap-3.31-000000.svg" alt="Tiptap 3.31"></a>
</p>

<p align="center">
  <strong>Idiomas:</strong>
  <a href="../README.md">English</a> ·
  <a href="README.vi.md">Tiếng Việt</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  Español ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

# Kinkin Editor

**Un editor de texto enriquecido para React, listo para usar.** Un WYSIWYG al
estilo Notion construido sobre [Tiptap](https://tiptap.dev) y ProseMirror: entra
markdown, sale markdown (o HTML/JSON), con comandos de barra, tablas, imágenes,
emojis, bloques que se reordenan arrastrando, tabla de contenidos y un panel de
AI Assist que hace streaming desde el LLM que tú decidas.

```bash
npm install @blakaa/kinkin-editor
```

Está pensado para entrar en una aplicación React que ya tienes: sin reset global
de CSS, sin configurar Tailwind, sin ningún provider que montar y sin suposiciones
sobre tu backend — la subida de imágenes y la IA son simples callbacks que tú
proporcionas, o que puedes omitir.

**[Demo y playground →](https://blakaalab.github.io/kinkin-editor/)** ·
[Guía de instalación](https://blakaalab.github.io/kinkin-editor/#/docs) ·
[Versiones](https://github.com/blakaalab/kinkin-editor/releases)

---

## Características

**Menú de barra** (escribe `/`): Párrafo, Encabezado 1–4, Lista con viñetas, Lista
numerada, Lista de tareas, Cita, Código, Emoji, Tabla, Imagen, Línea horizontal.

**También incluido**

- Entra markdown y sale markdown — pega markdown y se convierte en contenido enriquecido
- Selector de emojis con `:`
- Manejador de arrastre en cada bloque para reordenar; `Mod-Shift-↑/↓` para mover,
  `Mod-Shift-D` para duplicar
- Tablas con controles de fila/columna y reordenación por arrastre
- Edición de enlaces, bloques de código, listas de tareas, resaltados, sustituciones tipográficas
- Subida de imágenes mediante un callback que tú proporcionas
- AI Assist con streaming — mejorar, continuar, resumir, corregir gramática, simplificar,
  acortar, ampliar, traducir, cambiar el tono o un prompt propio
- Tabla de contenidos vía `onTocItemsChange`
- Renderiza documentos guardados sin el editor — una lista de extensiones solo de
  esquema y una hoja de estilos solo de presentación, ambas publicadas por separado
- Barras de herramientas fija, flotante sobre la selección y móvil
- Incluye tipos de TypeScript; compatible con React 18 y 19

---

## Instalación

```bash
npm install @blakaa/kinkin-editor    # o: pnpm add @blakaa/kinkin-editor
```

En npm 7+ y pnpm ese es todo el comando: ambos leen `peerDependencies` e instalan
React y los 21 paquetes `@tiptap/*` por ti — no tienes que enumerarlos.

### Yarn

Yarn **no** instala las peer dependencies automáticamente, ni Classic ni Berry.
Hay que indicarlas de forma explícita (la expansión de llaves lo deja en dos líneas):

```bash
yarn add @blakaa/kinkin-editor
yarn add react react-dom \
  @tiptap/{core,react,pm,starter-kit,extensions,markdown,suggestion,extension-emoji,extension-highlight,extension-history,extension-horizontal-rule,extension-image,extension-list,extension-mention,extension-strike,extension-table,extension-table-of-contents,extension-text-style,extension-typography,extension-unique-id,extension-drag-handle-react}
```

### Por qué peer dependencies

React y ProseMirror deben ser **instancias únicas**. Dos copias de React producen
"Invalid hook call"; dos copias de ProseMirror producen `RangeError: Invalid
content` y colisiones de plugin key, porque `prosemirror-model` se apoya en
comprobaciones `instanceof` y en un registro de esquema compartido. Declararlos
como peers es lo que hace que el gestor de paquetes deduplique a una sola copia.

Cada peer `@tiptap/*` está fijado a `~3.31.3`, la versión con la que se compila y
prueba esta librería. Mezclar versiones menores de Tiptap falla en tiempo de
compilación, así que el rango se mantiene deliberadamente estrecho y se mueve en
bloque en cada actualización verificada de Tiptap.

---

## Inicio rápido

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

Dos cosas con las que la gente tropieza:

1. **Importa la hoja de estilos.** `import "@blakaa/kinkin-editor/style.css"` una
   vez, en cualquier parte de tu aplicación. Sin ella el editor se muestra sin estilos.
2. **Dale una altura.** El editor llena su contenedor (`height: 100%`). En un
   contenedor sin altura se colapsa a nada. Usa un padre con altura explícita, o
   `min-height: 0` si es un hijo flex.

La barra de herramientas es opcional: omite `toolbar` para un editor sin cromo, que
sigue funcionando con los comandos de barra y la barra de selección.

---

## Usarlo con tu propio Tailwind CSS

**En corto: no hay nada que configurar. No puede chocar con tus estilos.**

Que una librería distribuya Tailwind suele causar tres problemas. Los tres se
resuelven en tiempo de compilación:

| Problema | Cómo se evita |
| --- | --- |
| Colisión de utilidades — el `.text-sm` de la librería cambiando *tu* aplicación en silencio | Cada regla está anidada bajo `.kinkin-editor`, así que solo aplica dentro del editor |
| Fuga de tokens — los `--color-*` de la librería sobrescribiendo tu tema en `:root` | `:root` se reescribe a `.kinkin-editor`; nada llega a la raíz del documento |
| Preflight duplicado — dos resets base peleando | La hoja de estilos se compila **sin preflight** |

El `.text-gray-500` de la librería y el tuyo pueden tener valores completamente
distintos sin molestarse. Ni siquiera necesitas Tailwind: lo que se publica es CSS
compilado normal.

La interfaz que se renderiza con portales (menús, tooltips, previsualizaciones de
arrastre, barra móvil) normalmente escaparía de ese ámbito al renderizarse en
`document.body`. Aquí se envía a un contenedor que también lleva la clase, expuesto
como `getEditorPortalRoot()`.

---

## Personalización de tema

Sobrescribe los tokens de diseño en la clase de ámbito: se propagan a todo lo que
hay dentro.

```css
.kinkin-editor {
  --color-background: #ffffff;        /* superficies: barra, menús, diálogos */
  --color-foreground: #1f2937;        /* texto del cuerpo */
  --color-control: #4b5563;           /* etiquetas e iconos de barra y menús */
  --color-muted-foreground: #6b7280;  /* texto secundario */
  --color-placeholder: #9ca3af;       /* marcadores de posición, iconos de ayuda */
  --color-accent: #f3f4f6;            /* superficies al pasar el cursor */
  --color-accent-foreground: #111827; /* etiqueta de un botón activo */
  --color-selected: #ede9fe;          /* superficie de un botón activo */
  --color-border: #e5e7eb;            /* separadores, borde de las muestras de color */
  --color-border-subtle: #f3f4f6;     /* líneas finas que enmarcan la interfaz */
  --color-ring: #7c3aed;              /* anillo de foco */
  --color-primary-700: #7c3aed;       /* rampa de acento: IA, subida, enlaces */
  --color-brand: #7c3aed;             /* elemento activo del índice */
  --font-sans: "Inter", system-ui, sans-serif;
}
```

El estilo del *contenido* del editor (bloques de código, tablas, listas de tareas,
citas) usa un espacio de nombres aparte, `--tt-core-*`, que se sobrescribe igual:

```css
.kinkin-editor {
  --tt-core-code-bg: #f5f5f5;
  --tt-core-table-header-bg: #fafafa;
  --tt-core-link: #2563eb;
  --tt-core-selection: #dbeafe;
  --tt-core-selection-text: #1f2937;  /* texto seleccionado; por defecto toma --color-foreground */
}
```

---

## Renderizar contenido guardado sin el editor

Un documento guardado es JSON de Tiptap, y renderizarlo en una página pública
necesita dos cosas que el bundle del editor no es el lugar adecuado para
obtener: el esquema y el CSS del contenido. Ambos se publican por separado.

```tsx
// Un server component. Sin editor de React, sin hoja de estilos del editor, sin APIs del navegador.
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

Todas las extensiones que dan forma al documento — nodos, marcas y los atributos
que llevan — y nada que exista solo para que la edición funcione.
`<RichTextEditor />` construye su propia lista sobre esta, enlazando node views y
comandos por nombre, de modo que ambas no pueden divergir: un nodo añadido para
el editor es un nodo que esta lista ya renderiza.

Es la lista que hay que pasar a `generateHTML`, `generateJSON` o `getSchema`.
Lo que conviene evitar es replicar a mano las extensiones del editor: un
documento que contenga un nodo que tu lista no conoce lanza
`RangeError: Unknown node type`, y lo lanza para los lectores, en producción, en
la entrada que casualmente usó el nodo nuevo.

Tres entradas parecen sorprendentes y las tres son imprescindibles:

| Entrada | Por qué está aquí |
| --- | --- |
| `ContentTable` | Emite `.table-node-wrapper > .table-scroll-container` alrededor de la tabla, igual que lo que construye el node view durante la edición. Sin ella una tabla ancha desborda la página y no se aplica ningún CSS de tablas. |
| `ImageUploadNode` | El marcador de posición de una subida que nunca terminó. Es raro en contenido guardado, y `content.css` lo oculta en la página, pero un documento que lo contenga aún tiene que poder parsearse. |
| `TableOfContents` | Es la dueña de los atributos `id` y `data-toc-id` de los encabezados. Si la omites, cada encabezado pierde su ancla y se rompen los enlaces internos y cualquier tabla de contenidos que renderices junto al texto. |

`generateHTML` serializa a través del DOM, así que en un servidor necesita uno:
instala `jsdom` o `happy-dom` y define `globalThis.document` antes de llamarlo.
Es un requisito de Tiptap, no de kinkin. (Con jsdom verás un aviso de
`HTMLCanvasElement's getContext() method`: viene del sondeo de soporte de la
extensión de emoji, que recurre correctamente a los emoji en imagen.)

### `content.css`

La mitad de presentación. Solo reglas de contenido — sin barras de herramientas,
menús, selección ni elementos de arrastre, sin utilidades de Tailwind, sin bloque
`@theme` y sin reset — y cada regla proviene de la misma fuente que las del
editor, así que una página renderizada y el editor no pueden verse distintos.

Tres propiedades que conviene conocer:

**Está acotada a una única clase que tú añades.** Nada recibe estilos hasta que
pones `kinkin-content` (exportada como `CONTENT_SCOPE_CLASS`) en el elemento. El
tamaño de fuente, la familia y el color del texto se heredan, nunca se fijan:
todas las medidas están en `em`, así que el contenido escala con lo que le dé tu
página.

**Vive dentro de una cascade layer.** Todo está dentro de `@layer kinkin-content`.
El CSS sin capa gana a una capa independientemente de la especificidad, así que
tus propias reglas se imponen sin `!important` ni juegos de especificidad:

```css
/* Sin capa, así que esto gana a content.css — el selector no tiene que ser más
   específico que aquel al que sobrescribe. */
.kinkin-content h1 { font-size: 2.5rem; }
```

**Todos los colores son variables `--tt-core-*`, y la hoja no declara ninguna.**
Cada uno es un `var()` con su valor por defecto como fallback, así que definir un
token en cualquier punto por encima del elemento de contenido lo tematiza —
incluido un modo oscuro:

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

(Por eso la hoja no declara valores por defecto en `.kinkin-content` mismo: una
custom property heredada se resuelve por proximidad, no por especificidad, así
que una declaración en el elemento de contenido ganaría en silencio a una puesta
en `html.dark`.)

Dos decisiones propias de la presentación: las casillas de las listas de tareas
se renderizan pero no son clicables — una página no tiene dónde guardar el clic —
y el marcador de posición de `imageUpload` queda oculto.

Una restricción: el elemento de ámbito usa `white-space: pre-wrap`, igual que el
editor, así que las secuencias de espacios que escribió el autor se conservan. No
formatees ni indentes el HTML generado dentro de él: esa indentación se
renderizaría.

---

## Referencia de la API

### `<RichTextEditor />`

| Prop | Tipo | Por defecto | Descripción |
| --- | --- | --- | --- |
| `initialContent` | `Content` | — | Contenido inicial: una cadena markdown/HTML o un documento JSON de Tiptap. Cambiarlo tras el montaje reemplaza el contenido y borra el historial de deshacer. |
| `contentType` | `"markdown" \| "html" \| "json"` | `"markdown"` | Cómo interpretar `initialContent`. |
| `outputContentType` | `"markdown" \| "html" \| "json" \| "text"` | `"markdown"` | Qué emite `onChange`. |
| `onChange` | `(value, meta?) => void` | — | Se dispara al editar. `value` es una cadena, o `JSONContent` cuando la salida es `"json"`. Se suprime mientras la IA está haciendo streaming. |
| `editable` | `boolean` | `true` | `false` lo renderiza en solo lectura: las barras se ocultan y el contenido sigue siendo seleccionable. |
| `toolbar` | `ReactNode` | — | Se renderiza sobre el contenido, dentro del contexto del editor. Pasa `<FixedToolbar />`. |
| `imageUploadHandler` | `EditorImageUploadHandler` | — | Activa la subida de imágenes. Omítelo para desactivarla. |
| `streamCompletion` | `StreamCompletionFn` | — | Activa AI Assist. Omítelo para desactivarlo. |
| `aiMode` | `"assist" \| "chat"` | — | Qué botón de IA muestra la barra de selección. |
| `onAiChatRequest` | `(message, selectedText) => void` | — | Lo llama el botón de chat cuando `aiMode="chat"`. |
| `onTocItemsChange` | `(items) => void` | — | Se dispara cuando cambian los encabezados. Pásalo a `<ToC />`. |
| `editorRef` | `RefObject<Editor \| null>` | — | Vía de escape hacia la instancia de Tiptap subyacente. |
| `pageTitle` | `string` | — | Se incluye como contexto en los prompts de AI Assist. |
| `placeholder` | `string` | — | Texto para el documento vacío. |

El `meta.source` de `onChange` es `"manual"` cuando escribe el usuario y
`"conversation"` para ediciones programáticas — útil para saltarse el autoguardado
en cambios que no vienen del usuario.

### Barras de herramientas

| Export | Comportamiento |
| --- | --- |
| `<FixedToolbar showAiAssist? className? />` | Barra permanente. Se pasa por la prop `toolbar`. Deshacer/rehacer, tipo de bloque (párrafo, H1–H4), listas (viñetas/numerada/tareas), negrita/cursiva/subrayado/tachado/código, cita, bloque de código, línea horizontal, enlace, tabla, imagen, disparador de barra, AI Assist. |
| `<SelectionToolbar />` | Flota sobre el texto seleccionado en escritorio. Se renderiza automáticamente. |
| `<MobileToolbar />` | Se ancla abajo por debajo de 480px. Se renderiza automáticamente. |

Solo `FixedToolbar` hay que montarla; las otras dos ya están conectadas.

### `<ToC />`

```tsx
const [items, setItems] = useState([]);
const editorRef = useRef(null);

<RichTextEditor editorRef={editorRef} onTocItemsChange={setItems} {...rest} />
<ToC items={items} editor={editorRef.current} trackScroll />
```

| Prop | Tipo | Por defecto | Descripción |
| --- | --- | --- | --- |
| `items` | `TableOfContentDataItem[]` | `[]` | Viene de `onTocItemsChange`. |
| `editor` | `Editor \| null` | — | Viene de `editorRef`. Necesario para desplazarse a los encabezados. |
| `trackScroll` | `boolean` | `true` | Resalta el encabezado visible. Escucha el scroll de *window*, así que desactívalo si el editor vive dentro de tu propio contenedor con scroll. |

### `imageUploadHandler` — subida de imágenes

Se llama para las imágenes que se sueltan, se pegan o se eligen desde la barra.
Devuelve la URL a incrustar; lanzar un error marca la subida como fallida en la UI.

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

### `streamCompletion` — AI Assist con streaming

Es lo que mueve AI Assist. La librería construye el prompt a partir de la acción
elegida por el usuario (`improve`, `continue`, `summarize`, `fix-grammar`,
`simplify`, `shorten`, `extend`, `translate`, `tone`, `custom`) más el contexto
alrededor. El transporte es tuyo: llama a `onChunk` por token, a `onComplete` al
terminar, a `onError` si falla, y respeta `signal` para que el botón de parar
funcione.

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

Si lo omites, los botones de IA no hacen nada y avisan por consola.

### Otros exports

| Export | Para qué sirve |
| --- | --- |
| `useAiAssistStream(editor, options)` | El hook detrás de AI Assist, por si compones tu propio editor. |
| `getEditorPortalRoot()` | El contenedor con ámbito donde se renderiza la UI de los portales. |
| `EDITOR_SCOPE_CLASS` | `"kinkin-editor"` — la clase de ámbito, para etiquetar tus propios portales. |
| `createContentExtensions()` | La lista de extensiones solo de esquema, para renderizar documentos guardados. También en `@blakaa/kinkin-editor/content`. |
| `CONTENT_SCOPE_CLASS` | `"kinkin-content"` — la clase a la que `content.css` acota sus reglas. |
| `<ToCItem />`, `<ToCEmptyState />` | Las piezas con las que se construye `<ToC />`, si quieres tu propio esquema. |
| Tipos | `RichTextEditorProps`, `EditorImageUploadHandler`, `StreamCompletionFn`, `StreamCompletionParams` |

---

## Recetas

**Autoguardado, saltándose las ediciones programáticas**

```tsx
<RichTextEditor
  onChange={(value, meta) => {
    if (meta?.source === "manual") debouncedSave(value as string);
  }}
  {...rest}
/>
```

**Vista previa de solo lectura**

```tsx
<RichTextEditor initialContent={doc} editable={false} contentType="markdown" />
```

**Llegar a la instancia de Tiptap**

```tsx
const editorRef = useRef(null);
<RichTextEditor editorRef={editorRef} {...rest} />;
// después: editorRef.current?.commands.focus()
```

**HTML en lugar de markdown**

```tsx
<RichTextEditor contentType="html" outputContentType="html" {...rest} />
```

---

## Solución de problemas

### El editor se ve sin estilos

No hiciste `import "@blakaa/kinkin-editor/style.css"`.

### El editor tiene altura cero

Llena su contenedor. Dale al padre una altura explícita, o `min-height: 0` si es un
hijo flex.

### `@tiptap/core` duplicado, o `getPreviousBlockSibling is not exported`

Hay más de una versión de Tiptap en tu árbol de dependencias. Los propios rangos
transitivos `^3.31.3` de Tiptap pueden resolverse a una versión menor más nueva y
traer una segunda copia de `@tiptap/core`. Fija todo el scope en el `package.json`
de tu aplicación:

```json
{
  "overrides": {
    "@tiptap/core": "3.31.3",
    "@tiptap/pm": "3.31.3"
  }
}
```

(Yarn lo llama `resolutions`.) Mueve el scope entero a la vez al actualizar: mezclar
versiones menores de Tiptap falla al compilar, no en ejecución.

### Los menús o tooltips salen sin estilos

Algo los está renderizando fuera del contenedor con ámbito. Envíalos por portal a
`getEditorPortalRoot()`.

### Los estilos de mi aplicación cambiaron al añadir el editor

No deberían — para eso está el aislamiento por ámbito. Si ocurre, es un bug que vale
la pena reportar.

### `RangeError: Unknown node type` al renderizar JSON guardado

La lista de extensiones que pasaste a `generateHTML` no cubre el documento. Pasa
`createContentExtensions()` de `@blakaa/kinkin-editor/content` en lugar de una
lista escrita a mano: es el mismo esquema que ejecuta el editor, así que sigue
siendo correcta a medida que el editor gana nodos. Consulta
[Renderizar contenido guardado sin el editor](#renderizar-contenido-guardado-sin-el-editor).

### El contenido renderizado no tiene estilos, o las tablas desbordan la página

Importa `@blakaa/kinkin-editor/content.css` y pon `kinkin-content` en el elemento
donde va el HTML: nada de esa hoja se aplica sin la clase. Si lo que desborda son
las tablas en concreto, el HTML se generó con una extensión `Table` normal en vez
de la que incluye `createContentExtensions()`, que emite el contenedor de scroll
que el CSS necesita.

---

## Licencia

[MIT](../LICENSE). Úsalo, haz fork y publícalo comercialmente — solo conserva el
aviso de copyright.

---

## Desarrollo local

Consulta la sección [Local development](../README.md#local-development) del README en
inglés para la estructura de carpetas, las convenciones y las notas de compilación.
