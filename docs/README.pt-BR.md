<p align="center">
  <img src="../assets/banner.svg" alt="Kinkin Editor - um editor de texto rico para React, construído sobre Tiptap e ProseMirror" width="100%">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@blakaa/kinkin-editor"><img src="https://img.shields.io/npm/v/@blakaa/kinkin-editor?color=green" alt="versão no npm"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Licença MIT"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/react-18%20%7C%2019-149eca.svg" alt="React 18 e 19"></a>
  <a href="https://tiptap.dev"><img src="https://img.shields.io/badge/tiptap-3.31-000000.svg" alt="Tiptap 3.31"></a>
</p>

<p align="center">
  <strong>Idiomas:</strong>
  <a href="../README.md">English</a> ·
  <a href="README.vi.md">Tiếng Việt</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.es.md">Español</a> ·
  Português (Brasil) ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

# Kinkin Editor

**Um editor de texto rico para React, pronto para encaixar.** Um WYSIWYG no estilo
Notion construído sobre [Tiptap](https://tiptap.dev) e ProseMirror: entra markdown,
sai markdown (ou HTML/JSON), com comandos de barra, tabelas, imagens, emojis,
blocos que se reordenam arrastando, sumário e um painel de AI Assist que faz
streaming a partir do LLM que você escolher.

```bash
npm install @blakaa/kinkin-editor
```

Ele foi feito para entrar em um app React que você já tem: sem reset global de CSS,
sem precisar configurar Tailwind, sem provider para montar e sem suposições sobre o
backend — upload de imagem e IA são apenas callbacks que você fornece, ou deixa de
fora.

**[Demo e playground →](https://blakaalab.github.io/kinkin-editor/)** ·
[Guia de instalação](https://blakaalab.github.io/kinkin-editor/#/docs) ·
[Releases](https://github.com/blakaalab/kinkin-editor/releases)

---

## Recursos

**Menu de barra** (digite `/`): Parágrafo, Título 1–4, Lista com marcadores, Lista
numerada, Lista de tarefas, Citação, Código, Emoji, Tabela, Imagem, Linha horizontal.

**Também incluso**

- Entra markdown e sai markdown — cole markdown e ele vira conteúdo formatado
- Seletor de emoji ao digitar `:`
- Alça de arrastar em cada bloco para reordenar; `Mod-Shift-↑/↓` para mover,
  `Mod-Shift-D` para duplicar
- Tabelas com controles de linha/coluna e reordenação por arrasto
- Edição de links, blocos de código, listas de tarefas, destaques, substituições tipográficas
- Upload de imagem por um callback que você fornece
- AI Assist com streaming — melhorar, continuar, resumir, corrigir gramática,
  simplificar, encurtar, ampliar, traduzir, mudar o tom ou um prompt próprio
- Sumário via `onTocItemsChange`
- Renderize documentos salvos sem o editor — uma lista de extensões só com o
  schema e uma folha de estilos só de exibição, ambas publicadas separadamente
- Barras de ferramentas fixa, flutuante sobre a seleção e mobile
- Tipos TypeScript inclusos; funciona com React 18 e 19

---

## Instalação

```bash
npm install @blakaa/kinkin-editor    # ou: pnpm add @blakaa/kinkin-editor
```

No npm 7+ e no pnpm é só isso: os dois leem `peerDependencies` e instalam o React e
todos os 21 pacotes `@tiptap/*` para você — não precisa listá-los.

### Yarn

O Yarn **não** instala peer dependencies automaticamente — nem o Classic nem o
Berry. É preciso declará-las explicitamente (a expansão de chaves resolve em duas
linhas):

```bash
yarn add @blakaa/kinkin-editor
yarn add react react-dom \
  @tiptap/{core,react,pm,starter-kit,extensions,markdown,suggestion,extension-emoji,extension-highlight,extension-history,extension-horizontal-rule,extension-image,extension-list,extension-mention,extension-strike,extension-table,extension-table-of-contents,extension-text-style,extension-typography,extension-unique-id,extension-drag-handle-react}
```

### Por que peer dependencies

React e ProseMirror precisam ser **instâncias únicas**. Duas cópias do React geram
"Invalid hook call"; duas cópias do ProseMirror geram `RangeError: Invalid content` e
colisões de plugin key, porque o `prosemirror-model` depende de verificações
`instanceof` e de um registro de schema compartilhado. Declará-los como peers é o que
faz o gerenciador de pacotes deduplicar para uma única cópia.

Cada peer `@tiptap/*` está fixado em `~3.31.3` — a versão contra a qual esta
biblioteca é construída e testada. Misturar versões menores do Tiptap quebra na hora
do build, então a faixa é propositalmente estreita e se move em bloco a cada
atualização verificada do Tiptap.

---

## Início rápido

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

Duas coisas que costumam pegar as pessoas:

1. **Importe a folha de estilos.** `import "@blakaa/kinkin-editor/style.css"` uma
   vez, em qualquer lugar do app. Sem isso o editor aparece sem estilo.
2. **Dê uma altura a ele.** O editor preenche o container (`height: 100%`). Em um
   container sem altura ele colapsa para nada. Use um pai com altura explícita, ou
   `min-height: 0` se ele for filho de um flex.

A barra de ferramentas é opcional — omita `toolbar` para um editor sem cromo, ainda
operável por comandos de barra e pela barra de seleção.

---

## Usando com o seu próprio Tailwind CSS

**Resumo: não há nada para configurar. Ele não tem como colidir com os seus estilos.**

Uma biblioteca que distribui Tailwind normalmente causa três problemas. Os três são
resolvidos em tempo de build:

| Problema | Como é evitado |
| --- | --- |
| Colisão de utilitários — o `.text-sm` da biblioteca mudando silenciosamente o *seu* app | Toda regra fica aninhada sob `.kinkin-editor`, então só vale dentro do editor |
| Vazamento de tokens — os `--color-*` da biblioteca sobrescrevendo seu tema em `:root` | `:root` é reescrito para `.kinkin-editor`; nada chega à raiz do documento |
| Preflight duplicado — dois resets base brigando | A folha de estilos é construída **sem preflight** |

O `.text-gray-500` da biblioteca e o seu podem ter valores completamente diferentes
sem que nenhum seja afetado. Você nem precisa de Tailwind — o que é publicado é CSS
compilado comum.

A UI renderizada via portal (menus, tooltips, prévias de arrasto, barra mobile)
normalmente escaparia desse escopo por renderizar em `document.body`. Aqui ela é
enviada por portal para um container que também carrega a classe, exposto como
`getEditorPortalRoot()`.

---

## Temas

Sobrescreva os design tokens na classe de escopo — eles descem para tudo que está
dentro:

```css
.kinkin-editor {
  --color-primary-700: #7c3aed;  /* destaque: botões ativos, anel de foco */
  --color-foreground: #1f2937;   /* texto do corpo */
  --color-background: #ffffff;
  --color-border: #e5e7eb;
  --color-muted-foreground: #6b7280;
  --font-sans: "Inter", system-ui, sans-serif;
}
```

O estilo do *conteúdo* do editor (blocos de código, tabelas, listas de tarefas,
citações) usa um namespace separado, `--tt-core-*`, sobrescrito da mesma forma:

```css
.kinkin-editor {
  --tt-core-code-bg: #f5f5f5;
  --tt-core-table-header-bg: #fafafa;
  --tt-core-link: #2563eb;
  --tt-core-selection: #dbeafe;
  --tt-core-selection-text: #1f2937;  /* texto selecionado; por padrão usa --color-foreground */
}
```

---

## Renderizando conteúdo salvo sem o editor

Um documento salvo é JSON do Tiptap, e renderizá-lo numa página pública exige
duas coisas que o bundle do editor não é o lugar certo para obter: o schema e o
CSS do conteúdo. Ambos são publicados separadamente.

```tsx
// Um server component. Sem editor React, sem a folha de estilos do editor, sem APIs do navegador.
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

Todas as extensões que dão forma ao documento — nós, marcas e os atributos que
eles carregam — e nada que exista apenas para o editar funcionar.
`<RichTextEditor />` monta a própria lista em cima desta, ligando node views e
comandos pelo nome, de modo que as duas não podem divergir: um nó adicionado para
o editor é um nó que esta lista já renderiza.

É a lista para passar a `generateHTML`, `generateJSON` ou `getSchema`. O que se
deve evitar é espelhar à mão as extensões do editor: um documento que contenha um
nó que a sua lista não conhece lança `RangeError: Unknown node type` — e lança
para os leitores, em produção, justamente no post que por acaso usou o nó novo.

Três entradas parecem surpreendentes e todas são indispensáveis:

| Entrada | Por que está aqui |
| --- | --- |
| `ContentTable` | Emite `.table-node-wrapper > .table-scroll-container` em volta da tabela, igual ao que o node view monta durante a edição. Sem ela uma tabela larga transborda a página e nenhum CSS de tabela é aplicado. |
| `ImageUploadNode` | O placeholder de um upload que nunca terminou. É raro em conteúdo salvo, e o `content.css` o esconde na página, mas um documento que o contenha ainda precisa ser parseado. |
| `TableOfContents` | É a dona dos atributos `id` e `data-toc-id` nos títulos. Deixe-a de fora e todo título perde a âncora, quebrando links internos e qualquer sumário que você renderize ao lado. |

`generateHTML` serializa através do DOM, então num servidor ele precisa de um:
instale `jsdom` ou `happy-dom` e defina `globalThis.document` antes de chamá-lo.
Isso é um requisito do Tiptap, não do kinkin. (Com o jsdom você verá um aviso de
`HTMLCanvasElement's getContext() method`: ele vem da sondagem de suporte da
extensão de emoji, que corretamente recorre aos emoji em imagem.)

### `content.css`

A metade de exibição. Apenas regras de conteúdo — sem barras de ferramentas,
menus, seleção ou elementos de arraste, sem utilitários do Tailwind, sem bloco
`@theme` e sem reset — e toda regra vem da mesma fonte que as do editor, então
uma página renderizada e o editor não podem ficar diferentes.

Três propriedades que vale conhecer:

**Ela é limitada a uma única classe que você adiciona.** Nada recebe estilo até
você colocar `kinkin-content` (exportada como `CONTENT_SCOPE_CLASS`) no elemento.
Tamanho da fonte, família e cor do texto são herdados, nunca definidos — cada
medida está em `em`, então o conteúdo escala junto com o que a sua página lhe der.

**Ela fica dentro de uma cascade layer.** Tudo está dentro de
`@layer kinkin-content`. CSS fora de qualquer layer vence um layer
independentemente da especificidade, então as suas próprias regras prevalecem sem
`!important` nem jogos de especificidade:

```css
/* Fora de layer, então isto vence o content.css — o seletor não precisa ser mais
   específico do que aquele que está sobrescrevendo. */
.kinkin-content h1 { font-size: 2.5rem; }
```

**Toda cor é uma variável `--tt-core-*`, e a folha não declara nenhuma delas.**
Cada uma é um `var()` com o valor padrão como fallback, então definir um token em
qualquer ponto acima do elemento de conteúdo já o tematiza — inclusive um modo
escuro:

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

(É por isso que a folha não declara padrões no próprio `.kinkin-content`: uma
custom property herdada é resolvida por proximidade, não por especificidade,
então uma declaração no elemento de conteúdo venceria silenciosamente uma posta
em `html.dark`.)

Duas decisões só de exibição: as caixas de seleção das listas de tarefas são
renderizadas mas não são clicáveis — uma página não tem onde salvar o clique — e
o placeholder de `imageUpload` fica escondido.

Uma restrição: o elemento de escopo usa `white-space: pre-wrap`, igual ao editor,
então as sequências de espaços que o autor digitou sobrevivem. Não formate nem
indente o HTML gerado dentro dele — essa indentação apareceria na renderização.

---

## Referência da API

### `<RichTextEditor />`

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `initialContent` | `Content` | — | Conteúdo inicial: uma string markdown/HTML ou um documento JSON do Tiptap. Mudar depois da montagem substitui o conteúdo e limpa o histórico de desfazer. |
| `contentType` | `"markdown" \| "html" \| "json"` | `"markdown"` | Como interpretar `initialContent`. |
| `outputContentType` | `"markdown" \| "html" \| "json" \| "text"` | `"markdown"` | O que `onChange` emite. |
| `onChange` | `(value, meta?) => void` | — | Dispara ao editar. `value` é uma string, ou `JSONContent` quando a saída é `"json"`. Fica suprimido enquanto a IA está transmitindo. |
| `editable` | `boolean` | `true` | `false` renderiza somente leitura — as barras somem, o conteúdo continua selecionável. |
| `toolbar` | `ReactNode` | — | Renderizado acima do conteúdo, dentro do contexto do editor. Passe `<FixedToolbar />`. |
| `imageUploadHandler` | `EditorImageUploadHandler` | — | Habilita upload de imagem. Omita para desabilitar. |
| `streamCompletion` | `StreamCompletionFn` | — | Habilita o AI Assist. Omita para desabilitar. |
| `aiMode` | `"assist" \| "chat"` | — | Qual botão de IA a barra de seleção mostra. |
| `onAiChatRequest` | `(message, selectedText) => void` | — | Chamado pelo botão de chat quando `aiMode="chat"`. |
| `onTocItemsChange` | `(items) => void` | — | Dispara quando os títulos mudam. Alimente o `<ToC />`. |
| `editorRef` | `RefObject<Editor \| null>` | — | Escotilha de fuga para a instância do Tiptap por baixo. |
| `pageTitle` | `string` | — | Entra como contexto nos prompts do AI Assist. |
| `placeholder` | `string` | — | Texto para documento vazio. |

O `meta.source` do `onChange` é `"manual"` para digitação do usuário e
`"conversation"` para edições programáticas — útil para pular o autosave em mudanças
que não vieram do usuário.

### Barras de ferramentas

| Export | Comportamento |
| --- | --- |
| `<FixedToolbar showAiAssist? className? />` | Barra permanente. Passe pela prop `toolbar`. Desfazer/refazer, tipo de bloco (parágrafo, H1–H4), listas (marcadores/numerada/tarefas), negrito/itálico/sublinhado/tachado/código, citação, bloco de código, linha horizontal, link, tabela, imagem, gatilho de barra, AI Assist. |
| `<SelectionToolbar />` | Flutua sobre o texto selecionado no desktop. Renderizada automaticamente. |
| `<MobileToolbar />` | Fixa no rodapé abaixo de 480px. Renderizada automaticamente. |

Só a `FixedToolbar` precisa ser montada; as outras duas já estão ligadas.

### `<ToC />`

```tsx
const [items, setItems] = useState([]);
const editorRef = useRef(null);

<RichTextEditor editorRef={editorRef} onTocItemsChange={setItems} {...rest} />
<ToC items={items} editor={editorRef.current} trackScroll />
```

| Prop | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `items` | `TableOfContentDataItem[]` | `[]` | Vem de `onTocItemsChange`. |
| `editor` | `Editor \| null` | — | Vem de `editorRef`. Necessário para rolar até os títulos. |
| `trackScroll` | `boolean` | `true` | Destaca o título visível no momento. Ele escuta o scroll da *window*, então desligue se o editor ficar dentro de um container com scroll próprio. |

### `imageUploadHandler` — upload de imagens

Chamado para imagens soltas, coladas ou escolhidas pela barra. Retorne a URL para
embutir; lançar um erro marca o upload como falho na UI.

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

### `streamCompletion` — AI Assist com streaming

É o que move o AI Assist. A biblioteca monta o prompt a partir da ação escolhida pelo
usuário (`improve`, `continue`, `summarize`, `fix-grammar`, `simplify`, `shorten`,
`extend`, `translate`, `tone`, `custom`) mais o contexto ao redor. O transporte é
seu: chame `onChunk` por token, `onComplete` ao terminar, `onError` em caso de falha,
e respeite o `signal` para que o botão de parar funcione.

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

Se você omitir, os botões de IA viram no-ops, com um aviso no console.

### Outros exports

| Export | Para que serve |
| --- | --- |
| `useAiAssistStream(editor, options)` | O hook por trás do AI Assist, caso você monte o seu próprio editor. |
| `getEditorPortalRoot()` | O container com escopo onde a UI de portais é renderizada. |
| `EDITOR_SCOPE_CLASS` | `"kinkin-editor"` — a classe de escopo, para marcar os seus próprios portais. |
| `createContentExtensions()` | A lista de extensões só com o schema, para renderizar documentos salvos. Também em `@blakaa/kinkin-editor/content`. |
| `CONTENT_SCOPE_CLASS` | `"kinkin-content"` — a classe à qual o `content.css` limita suas regras. |
| `<ToCItem />`, `<ToCEmptyState />` | As peças que formam o `<ToC />`, se você quiser o seu próprio layout de sumário. |
| Tipos | `RichTextEditorProps`, `EditorImageUploadHandler`, `StreamCompletionFn`, `StreamCompletionParams` |

---

## Receitas

**Autosave, pulando edições programáticas**

```tsx
<RichTextEditor
  onChange={(value, meta) => {
    if (meta?.source === "manual") debouncedSave(value as string);
  }}
  {...rest}
/>
```

**Prévia somente leitura**

```tsx
<RichTextEditor initialContent={doc} editable={false} contentType="markdown" />
```

**Chegar até a instância do Tiptap**

```tsx
const editorRef = useRef(null);
<RichTextEditor editorRef={editorRef} {...rest} />;
// depois: editorRef.current?.commands.focus()
```

**HTML em vez de markdown**

```tsx
<RichTextEditor contentType="html" outputContentType="html" {...rest} />
```

---

## Solução de problemas

### O editor aparece sem estilo

Você não fez `import "@blakaa/kinkin-editor/style.css"`.

### O editor está com altura zero

Ele preenche o container. Dê ao pai uma altura explícita, ou `min-height: 0` se ele
for filho de um flex.

### `@tiptap/core` duplicado, ou `getPreviousBlockSibling is not exported`

Há mais de uma versão do Tiptap na sua árvore de dependências. As próprias faixas
transitivas `^3.31.3` do Tiptap podem resolver para uma versão menor mais nova e
trazer uma segunda cópia de `@tiptap/core`. Fixe o scope inteiro no `package.json` do
seu app:

```json
{
  "overrides": {
    "@tiptap/core": "3.31.3",
    "@tiptap/pm": "3.31.3"
  }
}
```

(No Yarn isso se chama `resolutions`.) Mova o scope inteiro junto ao atualizar —
misturar versões menores do Tiptap quebra no build, não em tempo de execução.

### Menus ou tooltips aparecem sem estilo

Algo está renderizando esses elementos fora do container com escopo. Mande-os por
portal para `getEditorPortalRoot()`.

### Os estilos do meu app mudaram depois de adicionar o editor

Não deveriam — é exatamente isso que o escopo previne. Se acontecer, é um bug que
vale reportar.

### `RangeError: Unknown node type` ao renderizar JSON salvo

A lista de extensões que você passou para `generateHTML` não cobre o documento.
Passe `createContentExtensions()` de `@blakaa/kinkin-editor/content` em vez de uma
lista escrita à mão — é o mesmo schema que o editor executa, então ela continua
correta conforme o editor ganha nós. Veja
[Renderizando conteúdo salvo sem o editor](#renderizando-conteúdo-salvo-sem-o-editor).

### O conteúdo renderizado está sem estilo, ou as tabelas transbordam a página

Importe `@blakaa/kinkin-editor/content.css` e coloque `kinkin-content` no elemento
onde o HTML entra — nada dessa folha se aplica sem a classe. Se o que transborda
são especificamente as tabelas, o HTML foi gerado com uma extensão `Table` comum
em vez da que está em `createContentExtensions()`, que emite o contêiner de
rolagem de que o CSS precisa.

---

## Licença

[MIT](../LICENSE). Use, faça fork e publique comercialmente — só mantenha o aviso de
copyright.

---

## Desenvolvimento local

Veja a seção [Local development](../README.md#local-development) do README em inglês
para a estrutura de pastas, as convenções e as notas de build.
