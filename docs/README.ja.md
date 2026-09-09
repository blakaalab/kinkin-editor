<p align="center">
  <img src="../assets/banner.svg" alt="Kinkin Editor - Tiptap と ProseMirror で作られた React 向けリッチテキストエディタ" width="100%">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@blakaa/kinkin-editor"><img src="https://img.shields.io/npm/v/@blakaa/kinkin-editor?color=green" alt="npm バージョン"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT ライセンス"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/react-18%20%7C%2019-149eca.svg" alt="React 18 と 19"></a>
  <a href="https://tiptap.dev"><img src="https://img.shields.io/badge/tiptap-3.31-000000.svg" alt="Tiptap 3.31"></a>
</p>

<p align="center">
  <strong>言語:</strong>
  <a href="../README.md">English</a> ·
  <a href="README.vi.md">Tiếng Việt</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  日本語 ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

# Kinkin Editor

**そのまま組み込める React 向けリッチテキストエディタ。**
[Tiptap](https://tiptap.dev) と ProseMirror の上に構築した Notion 風の WYSIWYG です。
markdown で入力し markdown で出力（HTML/JSON も可）、スラッシュコマンド、テーブル、
画像、絵文字、ドラッグによるブロック並べ替え、目次、そして任意の LLM に接続できる
ストリーミング対応の AI Assist パネルを備えています。

```bash
npm install @blakaa/kinkin-editor
```

すでにある React アプリにそのまま入れられるよう設計しています。グローバルな CSS
リセットなし、Tailwind の設定も不要、マウントすべき provider もなく、バックエンドの
前提も置きません。画像アップロードと AI は、あなたが渡すただのコールバックです（渡さ
なくても構いません）。

**[デモとプレイグラウンド →](https://blakaalab.github.io/kinkin-editor/)** ·
[セットアップガイド](https://blakaalab.github.io/kinkin-editor/#/docs) ·
[リリース](https://github.com/blakaalab/kinkin-editor/releases)

---

## 機能

**スラッシュメニュー**（`/` を入力）: 段落、見出し 1–4、箇条書き、番号付きリスト、
タスクリスト、引用、コード、絵文字、テーブル、画像、水平線。

**その他の組み込み機能**

- markdown で入力し markdown で出力 — markdown を貼り付ければリッチな内容に変換
- `:` で絵文字ピッカー
- 各ブロックのドラッグハンドルで並べ替え。`Mod-Shift-↑/↓` で移動、`Mod-Shift-D` で複製
- 行/列の操作とドラッグ並べ替えに対応したテーブル
- リンク編集、コードブロック、タスクリスト、ハイライト、タイポグラフィ変換
- あなたが用意したコールバック経由の画像アップロード
- ストリーミング AI Assist — 改善、続きを書く、要約、文法修正、平易化、短縮、加筆、
  翻訳、トーン変更、任意のプロンプト
- `onTocItemsChange` による目次
- エディタなしで保存済みドキュメントをレンダリング — スキーマだけの拡張リストと
  表示専用のスタイルシートを、いずれも別途配布
- 固定ツールバー、選択範囲に追従するツールバー、モバイル用ツールバー
- TypeScript の型を同梱。React 18 と 19 に対応

---

## インストール

```bash
npm install @blakaa/kinkin-editor    # または: pnpm add @blakaa/kinkin-editor
```

npm 7 以降と pnpm ではこれだけです。どちらも `peerDependencies` を読み取り、React と
21 個の `@tiptap/*` パッケージすべてを自動で入れてくれるので、列挙する必要はありません。

### Yarn

Yarn は Classic も Berry も peer dependencies を**自動インストールしません**。明示的
に指定する必要があります（ブレース展開を使えば 2 行で済みます）:

```bash
yarn add @blakaa/kinkin-editor
yarn add react react-dom \
  @tiptap/{core,react,pm,starter-kit,extensions,markdown,suggestion,extension-emoji,extension-highlight,extension-history,extension-horizontal-rule,extension-image,extension-list,extension-mention,extension-strike,extension-table,extension-table-of-contents,extension-text-style,extension-typography,extension-unique-id,extension-drag-handle-react}
```

### なぜ peer dependencies なのか

React と ProseMirror は**単一インスタンス**でなければなりません。React が 2 つあると
"Invalid hook call" になり、ProseMirror が 2 つあると `RangeError: Invalid content` と
plugin key の衝突が起きます。`prosemirror-model` が `instanceof` 判定と共有スキーマ
レジストリに依存しているためです。peer として宣言することが、パッケージマネージャに
1 つへ重複排除させる手段になります。

`@tiptap/*` の peer はすべて `~3.31.3` に固定しています。これはこのライブラリがビルド
とテストを行っているバージョンです。Tiptap のマイナーバージョンを混在させるとビルド時
に失敗するため、範囲は意図的に狭くし、検証済みの Tiptap 更新のたびにまとめて動かします。

---

## クイックスタート

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

つまずきやすい点が 2 つあります。

1. **スタイルシートを import すること。** アプリ内のどこかで
   `import "@blakaa/kinkin-editor/style.css"` を一度だけ行ってください。これがないと
   エディタはスタイルなしで表示されます。
2. **高さを与えること。** エディタはコンテナを埋めます（`height: 100%`）。高さのない
   コンテナの中では潰れて何も見えなくなります。親に明示的な高さを与えるか、flex の子
   なら `min-height: 0` を指定してください。

ツールバーは任意です。`toolbar` を省略すれば余計な UI のないエディタになり、それでも
スラッシュコマンドと選択ツールバーで操作できます。

---

## 自分の Tailwind CSS と併用する

**結論: 設定は不要です。あなたのスタイルと衝突しません。**

ライブラリが Tailwind を同梱すると通常 3 つの問題が起きますが、いずれもビルド時に解決
済みです。

| 問題 | 回避方法 |
| --- | --- |
| ユーティリティの衝突 — ライブラリの `.text-sm` が*あなたの*アプリを黙って変えてしまう | すべてのルールが `.kinkin-editor` の下にネストされ、エディタ内部にしか適用されない |
| トークンの漏れ — ライブラリの `--color-*` が `:root` であなたのテーマを上書きする | `:root` は `.kinkin-editor` に書き換えられ、document root には何も置かれない |
| preflight の重複 — 2 つのベースリセットがぶつかる | スタイルシートは**preflight なし**でビルドされている |

ライブラリの `.text-gray-500` とあなたの `.text-gray-500` はまったく別の値を持てて、
どちらも影響を受けません。そもそも Tailwind は不要です。配布されるのはコンパイル済みの
ただの CSS です。

portal で描画される UI（メニュー、ツールチップ、ドラッグプレビュー、モバイルツール
バー）は、通常なら `document.body` に描画されてこのスコープから外れてしまいます。これ
らは同じクラスを持つコンテナへ portal されており、`getEditorPortalRoot()` として公開
されています。

---

## テーマ設定

スコープクラス上でデザイントークンを上書きすると、内部のすべてに伝播します。

```css
.kinkin-editor {
  --color-background: #ffffff;        /* 面: ツールバー、メニュー、ダイアログ */
  --color-foreground: #1f2937;        /* 本文テキスト */
  --color-control: #4b5563;           /* ツールバーとメニューのラベル、アイコン */
  --color-muted-foreground: #6b7280;  /* 補助テキスト */
  --color-placeholder: #9ca3af;       /* プレースホルダー、補助アイコン */
  --color-accent: #f3f4f6;            /* ホバー時の面 */
  --color-accent-foreground: #111827; /* オンになっているボタンのラベル */
  --color-selected: #ede9fe;          /* オンになっているボタンの面 */
  --color-border: #e5e7eb;            /* 区切り線、カラーチップの枠 */
  --color-border-subtle: #f3f4f6;     /* UI を囲むヘアライン */
  --color-ring: #7c3aed;              /* フォーカスリング */
  --color-primary-700: #7c3aed;       /* アクセント: AI、アップロード、リンク */
  --color-brand: #7c3aed;             /* 目次のアクティブ項目 */
  --font-sans: "Inter", system-ui, sans-serif;
}
```

エディタの*コンテンツ*のスタイル（コードブロック、テーブル、タスクリスト、引用）は
別の `--tt-core-*` 名前空間を使い、同じ方法で上書きできます。

```css
.kinkin-editor {
  --tt-core-code-bg: #f5f5f5;
  --tt-core-table-header-bg: #fafafa;
  --tt-core-link: #2563eb;
  --tt-core-selection: #dbeafe;
  --tt-core-selection-text: #1f2937;  /* 選択中のテキスト。既定は --color-foreground */
}
```

---

## エディタなしで保存済みコンテンツをレンダリングする

保存済みのドキュメントは Tiptap の JSON です。それを公開ページに描画するには、エディタの
バンドルから取るべきではないものが 2 つ必要になります。スキーマと、コンテンツ用の CSS
です。どちらも別パッケージとして配布しています。

```tsx
// サーバーコンポーネント。React エディタも、エディタのスタイルシートも、ブラウザ API も不要。
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

ドキュメントの形を決める拡張 — ノード、マーク、そしてそれらの属性 — がすべて含まれ、
編集を成立させるためだけに存在するものは含まれません。`<RichTextEditor />` はこのリストの
上に自分のリストを組み立て、ノードビューやコマンドを名前で結び付けます。したがって両者が
食い違うことはありません。エディタのために追加したノードは、このリストがすでに描画できる
ノードです。

`generateHTML`、`generateJSON`、`getSchema` に渡すべきなのはこのリストです。避けるべきは
エディタの拡張リストを手作業で写すことです。あなたのリストが知らないノードを含むドキュメント
は `RangeError: Unknown node type` を投げます。しかもそれを受け取るのは読者であり、本番環境
であり、たまたま新しいノードを使った記事なのです。

意外に見えて、いずれも欠かせない項目が 3 つあります。

| 項目 | 必要な理由 |
| --- | --- |
| `ContentTable` | テーブルの外側に `.table-node-wrapper > .table-scroll-container` を出力し、編集時にノードビューが組み立てる構造と一致させます。これがないと幅の広いテーブルがページからはみ出し、テーブル用の CSS も一切適用されません。 |
| `ImageUploadNode` | 完了しなかったアップロードのプレースホルダーです。保存済みコンテンツでは稀で、ページ上では `content.css` によって隠されますが、それを含むドキュメントもパースできる必要があります。 |
| `TableOfContents` | 見出しの `id` と `data-toc-id` 属性を担当します。外すとすべての見出しがアンカーを失い、ページ内リンクと、併せて描画する目次が壊れます。 |

`generateHTML` は DOM を介してシリアライズするため、サーバー上では DOM が必要です。`jsdom`
か `happy-dom` をインストールし、呼び出す前に `globalThis.document` を設定してください。
これは Tiptap 側の要件であり、kinkin の都合ではありません。（jsdom では
`HTMLCanvasElement's getContext() method` という警告が 1 件出ます。emoji 拡張のサポート判定
によるもので、拡張は正しく画像 emoji にフォールバックします。）

### `content.css`

表示側の半分です。含まれるのはコンテンツのルールだけ — ツールバー、メニュー、選択範囲、
ドラッグ関連の見た目はなく、Tailwind のユーティリティも `@theme` ブロックもリセットもあり
ません — そしてすべてのルールがエディタ側と同じソースから生成されるため、描画したページと
エディタの見た目が食い違うことはありません。

知っておく価値のある性質が 3 つあります。

**適用範囲は、明示的に付けるクラス 1 つに限定されます。** 要素に `kinkin-content`
（`CONTENT_SCOPE_CLASS` としてエクスポート）を付けるまで、何もスタイルされません。文字
サイズ・フォント・文字色はすべて継承され、設定されることはありません。寸法はすべて `em`
なので、コンテンツはページが与えた環境に合わせて拡大縮小します。

**カスケードレイヤーの中にあります。** すべては `@layer kinkin-content` の中です。レイヤーに
属さない CSS は詳細度に関係なくレイヤー内の CSS に勝つため、あなたのルールは `!important`
や詳細度の駆け引きなしで通ります。

```css
/* レイヤーに属さないので content.css に勝つ — 上書き対象より詳細である必要はない。 */
.kinkin-content h1 { font-size: 2.5rem; }
```

**色はすべて `--tt-core-*` 変数で、このスタイルシートはそのどれも宣言しません。** 各色は
既定値をフォールバックに持つ `var()` なので、コンテンツ要素より上のどこかでトークンを設定
するだけでテーマを変えられます。ダークモードも同様です。

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

（このスタイルシートが `.kinkin-content` 自体に既定値を宣言しないのはこのためです。継承される
カスタムプロパティは詳細度ではなく近さで決まるため、コンテンツ要素上の宣言が `html.dark` の
宣言に黙って勝ってしまいます。）

表示専用の判断が 2 つあります。タスクリストのチェックボックスは描画されますがクリックはでき
ません — ページにはそのクリックを保存する先がないからです — そして `imageUpload` の
プレースホルダーは非表示になります。

制約が 1 つ。スコープ要素はエディタと同じく `white-space: pre-wrap` なので、書き手が入力した
連続する空白がそのまま残ります。その内側で生成 HTML を整形したりインデントしたりしないで
ください。そのインデントがそのまま表示されます。

---

## API リファレンス

### `<RichTextEditor />`

| Prop | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `initialContent` | `Content` | — | 初期コンテンツ。markdown/HTML 文字列、または Tiptap の JSON ドキュメント。マウント後に変更すると内容を置き換え、undo 履歴を消去します。 |
| `contentType` | `"markdown" \| "html" \| "json"` | `"markdown"` | `initialContent` の解釈方法。 |
| `outputContentType` | `"markdown" \| "html" \| "json" \| "text"` | `"markdown"` | `onChange` が出力する形式。 |
| `onChange` | `(value, meta?) => void` | — | 編集時に発火。`value` は文字列、出力が `"json"` のときは `JSONContent`。AI のストリーミング中は抑制されます。 |
| `editable` | `boolean` | `true` | `false` で読み取り専用。ツールバーは隠れ、内容は選択可能なままです。 |
| `toolbar` | `ReactNode` | — | コンテンツの上、editor context の内側に描画されます。`<FixedToolbar />` を渡してください。 |
| `imageUploadHandler` | `EditorImageUploadHandler` | — | 画像アップロードを有効化。省略すると無効。 |
| `streamCompletion` | `StreamCompletionFn` | — | AI Assist を有効化。省略すると無効。 |
| `aiMode` | `"assist" \| "chat"` | — | 選択ツールバーに表示する AI ボタンの種類。 |
| `onAiChatRequest` | `(message, selectedText) => void` | — | `aiMode="chat"` のときチャットボタンから呼ばれます。 |
| `onTocItemsChange` | `(items) => void` | — | 見出しが変わると発火。`<ToC />` に渡します。 |
| `editorRef` | `RefObject<Editor \| null>` | — | 内部の Tiptap インスタンスへの避難ハッチ。 |
| `pageTitle` | `string` | — | AI Assist のプロンプトに文脈として含まれます。 |
| `placeholder` | `string` | — | 空のドキュメントに表示するプレースホルダ。 |

`onChange` の `meta.source` は、ユーザーの入力なら `"manual"`、プログラムによる編集なら
`"conversation"` です。ユーザー由来でない変更で自動保存をスキップするのに使えます。

### ツールバー

| Export | 挙動 |
| --- | --- |
| `<FixedToolbar showAiAssist? className? />` | 常設バー。`toolbar` prop に渡します。undo/redo、ブロック種別（段落、H1–H4）、リスト（箇条書き/番号付き/タスク）、太字/斜体/下線/打ち消し/コード、引用、コードブロック、水平線、リンク、テーブル、画像、スラッシュ起動、AI Assist。 |
| `<SelectionToolbar />` | デスクトップで選択テキストの上に浮かびます。自動で描画されます。 |
| `<MobileToolbar />` | 480px 未満で画面下部に固定されます。自動で描画されます。 |

マウントが必要なのは `FixedToolbar` だけで、残りの 2 つはすでに配線済みです。

### `<ToC />`

```tsx
const [items, setItems] = useState([]);
const editorRef = useRef(null);

<RichTextEditor editorRef={editorRef} onTocItemsChange={setItems} {...rest} />
<ToC items={items} editor={editorRef.current} trackScroll />
```

| Prop | 型 | 既定値 | 説明 |
| --- | --- | --- | --- |
| `items` | `TableOfContentDataItem[]` | `[]` | `onTocItemsChange` から取得。 |
| `editor` | `Editor \| null` | — | `editorRef` から取得。見出しへスクロールするために必要です。 |
| `trackScroll` | `boolean` | `true` | 表示中の見出しをハイライトします。*window* のスクロールを監視するため、エディタを独自のスクロールコンテナに入れている場合はオフにしてください。 |

### `imageUploadHandler` — 画像アップロード

ドロップ、貼り付け、ツールバーから選択された画像に対して呼ばれます。埋め込む URL を
返してください。例外を投げると UI 上でアップロード失敗として扱われます。

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

### `streamCompletion` — ストリーミング AI Assist

AI Assist を動かす関数です。ライブラリ側が、ユーザーの選んだアクション（`improve`、
`continue`、`summarize`、`fix-grammar`、`simplify`、`shorten`、`extend`、`translate`、
`tone`、`custom`）と周辺の文脈からプロンプトを組み立てます。通信はあなたの担当です。
トークンごとに `onChunk`、完了時に `onComplete`、失敗時に `onError` を呼び、停止ボタン
が効くよう `signal` を尊重してください。

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

省略すると AI ボタンは何もしなくなり、コンソールに警告が出ます。

### その他の export

| Export | 用途 |
| --- | --- |
| `useAiAssistStream(editor, options)` | AI Assist の裏側にある hook。自分でエディタを組み立てる場合に。 |
| `getEditorPortalRoot()` | portal UI が描画されるスコープ付きコンテナ。 |
| `EDITOR_SCOPE_CLASS` | `"kinkin-editor"` — スコープクラス。自前の portal に付けるため。 |
| `createContentExtensions()` | 保存済みドキュメントを描画するための、スキーマだけの拡張リスト。`@blakaa/kinkin-editor/content` からも取得できます。 |
| `CONTENT_SCOPE_CLASS` | `"kinkin-content"` — `content.css` が適用範囲とするクラス。 |
| `<ToCItem />`、`<ToCEmptyState />` | `<ToC />` を構成する部品。独自のアウトライン配置を作るときに。 |
| 型 | `RichTextEditorProps`、`EditorImageUploadHandler`、`StreamCompletionFn`、`StreamCompletionParams` |

---

## レシピ

**自動保存（プログラムによる編集はスキップ）**

```tsx
<RichTextEditor
  onChange={(value, meta) => {
    if (meta?.source === "manual") debouncedSave(value as string);
  }}
  {...rest}
/>
```

**読み取り専用プレビュー**

```tsx
<RichTextEditor initialContent={doc} editable={false} contentType="markdown" />
```

**Tiptap インスタンスにアクセスする**

```tsx
const editorRef = useRef(null);
<RichTextEditor editorRef={editorRef} {...rest} />;
// あとで: editorRef.current?.commands.focus()
```

**markdown ではなく HTML を使う**

```tsx
<RichTextEditor contentType="html" outputContentType="html" {...rest} />
```

---

## トラブルシューティング

### エディタにスタイルが当たらない

`import "@blakaa/kinkin-editor/style.css"` をしていません。

### エディタの高さがゼロになる

エディタはコンテナを埋めます。親に明示的な高さを与えるか、flex の子なら
`min-height: 0` を指定してください。

### `@tiptap/core` が重複する、または `getPreviousBlockSibling is not exported`

依存ツリーに Tiptap が複数バージョン入っています。Tiptap 自身の推移的な `^3.31.3` と
いう範囲が新しいマイナーに解決され、2 つ目の `@tiptap/core` を引き込むことがあります。
アプリの `package.json` でスコープごと固定してください。

```json
{
  "overrides": {
    "@tiptap/core": "3.31.3",
    "@tiptap/pm": "3.31.3"
  }
}
```

（Yarn では `resolutions` と呼びます。）アップグレードするときはスコープ全体をまとめて
動かしてください。Tiptap のマイナー混在は実行時ではなくビルド時に失敗します。

### メニューやツールチップにスタイルが当たらない

何かがスコープ付きコンテナの外でそれらを描画しています。`getEditorPortalRoot()` へ
portal してください。

### エディタを追加したらアプリのスタイルが変わった

本来起きないはずです。スコープ分離はまさにそれを防ぐためのものです。もし起きたなら、
報告する価値のあるバグです。

### 保存済み JSON の描画時に `RangeError: Unknown node type`

`generateHTML` に渡した拡張リストがドキュメントを網羅していません。手書きのリストではなく
`@blakaa/kinkin-editor/content` の `createContentExtensions()` を渡してください。エディタが
実際に動かしているスキーマそのものなので、エディタにノードが増えても正しいままです。
[エディタなしで保存済みコンテンツをレンダリングする](#エディタなしで保存済みコンテンツをレンダリングする)
を参照してください。

### 描画したコンテンツにスタイルが当たらない、またはテーブルがページからはみ出す

`@blakaa/kinkin-editor/content.css` を import し、HTML を差し込む要素に `kinkin-content` を
付けてください。このクラスがなければ、そのスタイルシートの内容は一切適用されません。はみ出す
のがテーブルだけであれば、その HTML は `createContentExtensions()` の拡張ではなく素の `Table`
拡張で生成されています。前者は CSS が必要とするスクロールコンテナを出力します。

---

## ライセンス

[MIT](../LICENSE)。使う、fork する、商用で出す、いずれも自由です。著作権表示だけ残して
ください。

---

## ローカル開発

ディレクトリ構成、コーディング規約、ビルドに関する注意は英語版 README の
[Local development](../README.md#local-development) を参照してください。
