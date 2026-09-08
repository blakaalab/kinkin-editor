<p align="center">
  <img src="../assets/banner.svg" alt="Kinkin Editor - Tiptap과 ProseMirror 기반의 React 리치 텍스트 에디터" width="100%">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@blakaa/kinkin-editor"><img src="https://img.shields.io/npm/v/@blakaa/kinkin-editor?color=green" alt="npm 버전"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT 라이선스"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/react-18%20%7C%2019-149eca.svg" alt="React 18 및 19"></a>
  <a href="https://tiptap.dev"><img src="https://img.shields.io/badge/tiptap-3.31-000000.svg" alt="Tiptap 3.31"></a>
</p>

<p align="center">
  <strong>언어:</strong>
  <a href="../README.md">English</a> ·
  <a href="README.vi.md">Tiếng Việt</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  한국어 ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

# Kinkin Editor

**바로 붙여 쓰는 React 리치 텍스트 에디터.** [Tiptap](https://tiptap.dev)과
ProseMirror 위에 만든 Notion 스타일 WYSIWYG입니다. 마크다운으로 넣고 마크다운으로
받으며(HTML/JSON도 가능), 슬래시 명령, 표, 이미지, 이모지, 드래그로 블록 재정렬,
목차, 그리고 원하는 어떤 LLM에도 연결할 수 있는 스트리밍 AI Assist 패널을 갖추고
있습니다.

```bash
npm install @blakaa/kinkin-editor
```

이미 있는 React 앱에 그대로 넣도록 설계했습니다. 전역 CSS 리셋 없음, Tailwind 설정
불필요, 마운트할 provider 없음, 백엔드에 대한 가정도 없습니다. 이미지 업로드와 AI는
여러분이 직접 넘기는 평범한 콜백일 뿐이며, 넘기지 않아도 됩니다.

**[데모와 플레이그라운드 →](https://blakaalab.github.io/kinkin-editor/)** ·
[설치 가이드](https://blakaalab.github.io/kinkin-editor/#/docs) ·
[릴리스](https://github.com/blakaalab/kinkin-editor/releases)

---

## 기능

**슬래시 메뉴**(`/` 입력): 문단, 제목 1–4, 글머리 기호 목록, 번호 매기기 목록,
할 일 목록, 인용, 코드, 이모지, 표, 이미지, 구분선.

**그 밖의 기본 기능**

- 마크다운 입력, 마크다운 출력 — 마크다운을 붙여넣으면 서식 있는 내용으로 변환
- `:` 입력 시 이모지 선택기
- 블록마다 드래그 핸들로 순서 변경. `Mod-Shift-↑/↓`로 이동, `Mod-Shift-D`로 복제
- 행/열 조작과 드래그 재정렬을 지원하는 표
- 링크 편집, 코드 블록, 할 일 목록, 형광펜, 타이포그래피 자동 치환
- 여러분이 제공하는 콜백을 통한 이미지 업로드
- 스트리밍 AI Assist — 다듬기, 이어 쓰기, 요약, 문법 교정, 쉽게 쓰기, 줄이기, 늘리기,
  번역, 어조 변경, 또는 직접 작성한 프롬프트
- `onTocItemsChange`를 통한 목차
- 에디터 없이 저장된 문서 렌더링 — 스키마만 담은 확장 목록과 표시 전용
  스타일시트를 각각 따로 배포
- 고정 툴바, 선택 영역 플로팅 툴바, 모바일 툴바
- TypeScript 타입 포함. React 18과 19 지원

---

## 설치

```bash
npm install @blakaa/kinkin-editor    # 또는: pnpm add @blakaa/kinkin-editor
```

npm 7 이상과 pnpm에서는 이 명령 하나면 끝입니다. 둘 다 `peerDependencies`를 읽어
React와 21개의 `@tiptap/*` 패키지를 알아서 설치해 주므로, 직접 나열할 필요가 없습니다.

### Yarn

Yarn은 Classic이든 Berry든 peer 의존성을 **자동으로 설치하지 않습니다.** 명시적으로
지정해야 합니다(중괄호 확장을 쓰면 두 줄이면 됩니다):

```bash
yarn add @blakaa/kinkin-editor
yarn add react react-dom \
  @tiptap/{core,react,pm,starter-kit,extensions,markdown,suggestion,extension-emoji,extension-highlight,extension-history,extension-horizontal-rule,extension-image,extension-list,extension-mention,extension-strike,extension-table,extension-table-of-contents,extension-text-style,extension-typography,extension-unique-id,extension-drag-handle-react}
```

### 왜 peer 의존성인가

React와 ProseMirror는 반드시 **하나의 인스턴스**여야 합니다. React가 두 벌이면
"Invalid hook call"이 나고, ProseMirror가 두 벌이면 `RangeError: Invalid content`와
plugin key 충돌이 납니다. `prosemirror-model`이 `instanceof` 검사와 공유 스키마
레지스트리에 의존하기 때문입니다. peer로 선언하는 것이 패키지 매니저로 하여금 하나로
합치게 만드는 방법입니다.

모든 `@tiptap/*` peer는 `~3.31.3`으로 고정되어 있습니다. 이 라이브러리가 빌드되고
테스트된 버전입니다. Tiptap 마이너 버전을 섞으면 빌드 단계에서 실패하므로, 범위를
의도적으로 좁게 유지하고 검증된 Tiptap 업그레이드마다 한꺼번에 옮깁니다.

---

## 빠른 시작

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

많이들 걸려 넘어지는 두 가지:

1. **스타일시트를 import 하세요.** 앱 어디에서든 한 번만
   `import "@blakaa/kinkin-editor/style.css"` 하면 됩니다. 이게 없으면 에디터가 스타일
   없이 렌더링됩니다.
2. **높이를 주세요.** 에디터는 컨테이너를 가득 채웁니다(`height: 100%`). 높이가 없는
   컨테이너 안에서는 아무것도 보이지 않게 줄어듭니다. 부모에 명시적인 높이를 주거나,
   flex 자식이라면 `min-height: 0`을 지정하세요.

툴바는 선택 사항입니다. `toolbar`를 생략하면 군더더기 없는 에디터가 되고, 그래도 슬래시
명령과 선택 툴바로 조작할 수 있습니다.

---

## 내 Tailwind CSS와 함께 쓰기

**요약: 설정할 것이 없습니다. 여러분의 스타일과 충돌할 수 없습니다.**

라이브러리가 Tailwind를 함께 배포하면 보통 세 가지 문제가 생기는데, 셋 다 빌드 시점에
해결되어 있습니다.

| 문제 | 해결 방식 |
| --- | --- |
| 유틸리티 충돌 — 라이브러리의 `.text-sm`이 *여러분의* 앱 스타일을 조용히 바꿈 | 모든 규칙이 `.kinkin-editor` 아래에 중첩되어 에디터 내부에만 적용됨 |
| 토큰 누출 — 라이브러리의 `--color-*`가 `:root`에서 여러분의 테마를 덮어씀 | `:root`가 `.kinkin-editor`로 다시 쓰여, 문서 루트에는 아무것도 남지 않음 |
| preflight 중복 — 두 개의 기본 리셋이 충돌 | 스타일시트를 **preflight 없이** 빌드함 |

라이브러리의 `.text-gray-500`과 여러분의 것이 완전히 다른 값을 가져도 서로 영향을 주지
않습니다. Tailwind가 아예 없어도 됩니다. 배포되는 것은 컴파일된 일반 CSS입니다.

portal로 렌더링되는 UI(메뉴, 툴팁, 드래그 미리보기, 모바일 툴바)는 원래 `document.body`
로 렌더링되면서 이 범위를 벗어납니다. 이들은 같은 클래스를 가진 컨테이너로 portal되며,
`getEditorPortalRoot()`로 노출됩니다.

---

## 테마 설정

스코프 클래스에서 디자인 토큰을 덮어쓰면 내부 전체에 적용됩니다.

```css
.kinkin-editor {
  --color-primary-700: #7c3aed;  /* 강조색: 활성 버튼, 포커스 링 */
  --color-foreground: #1f2937;   /* 본문 텍스트 */
  --color-background: #ffffff;
  --color-border: #e5e7eb;
  --color-muted-foreground: #6b7280;
  --font-sans: "Inter", system-ui, sans-serif;
}
```

에디터 *본문* 스타일(코드 블록, 표, 할 일 목록, 인용)은 별도의 `--tt-core-*`
네임스페이스를 쓰며, 같은 방식으로 덮어쓸 수 있습니다.

```css
.kinkin-editor {
  --tt-core-code-bg: #f5f5f5;
  --tt-core-table-header-bg: #fafafa;
  --tt-core-link: #2563eb;
  --tt-core-selection: #dbeafe;
  --tt-core-selection-text: #1f2937;  /* 선택된 텍스트. 기본값은 --color-foreground */
}
```

---

## 에디터 없이 저장된 콘텐츠 렌더링하기

저장된 문서는 Tiptap JSON이고, 이를 공개 페이지에 렌더링하려면 에디터 번들에서 가져오기에는
적절하지 않은 두 가지가 필요합니다. 스키마와 콘텐츠 CSS입니다. 둘 다 별도로 배포됩니다.

```tsx
// 서버 컴포넌트. React 에디터도, 에디터 스타일시트도, 브라우저 API도 없습니다.
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

문서의 형태를 결정하는 모든 확장 — 노드, 마크, 그리고 거기에 붙는 속성 — 이 들어 있고,
편집을 가능하게 하려고만 존재하는 것은 하나도 없습니다. `<RichTextEditor />`는 이 목록 위에
자신의 목록을 쌓아 올리면서 노드 뷰와 커맨드를 이름으로 붙이므로, 둘이 어긋날 수 없습니다.
에디터를 위해 추가한 노드는 이 목록이 이미 렌더링할 수 있는 노드입니다.

`generateHTML`, `generateJSON`, `getSchema`에 넘겨야 할 목록이 바로 이것입니다. 피해야 할
것은 에디터의 확장 목록을 손으로 옮겨 적는 일입니다. 목록이 모르는 노드가 담긴 문서는
`RangeError: Unknown node type`을 던지는데, 그것도 독자에게, 프로덕션에서, 하필 새 노드를
쓴 그 글에서 던집니다.

의외로 보이지만 셋 다 반드시 필요한 항목입니다.

| 항목 | 필요한 이유 |
| --- | --- |
| `ContentTable` | 표 바깥에 `.table-node-wrapper > .table-scroll-container`를 출력해, 편집 중 노드 뷰가 만드는 구조와 일치시킵니다. 이것이 없으면 넓은 표가 페이지를 넘치고 표 관련 CSS도 전혀 적용되지 않습니다. |
| `ImageUploadNode` | 끝내 완료되지 않은 업로드의 자리표시자입니다. 저장된 콘텐츠에서는 드물고 페이지에서는 `content.css`가 숨기지만, 이를 포함한 문서도 파싱은 되어야 합니다. |
| `TableOfContents` | 제목의 `id`와 `data-toc-id` 속성을 담당합니다. 빼면 모든 제목이 앵커를 잃어 페이지 내 링크와 함께 렌더링하는 목차가 깨집니다. |

`generateHTML`은 DOM을 거쳐 직렬화하므로 서버에서는 DOM이 필요합니다. `jsdom`이나
`happy-dom`을 설치하고 호출 전에 `globalThis.document`를 설정하세요. 이는 kinkin이 아니라
Tiptap의 요구사항입니다. (jsdom에서는 `HTMLCanvasElement's getContext() method` 경고가 한 번
나옵니다. emoji 확장의 지원 여부 탐지에서 나오는 것이며, 확장은 이미지 emoji로 올바르게
폴백합니다.)

### `content.css`

표시를 담당하는 절반입니다. 콘텐츠 규칙만 들어 있고 — 툴바, 메뉴, 선택 영역, 드래그 관련
요소는 없으며 Tailwind 유틸리티도, `@theme` 블록도, 리셋도 없습니다 — 모든 규칙이 에디터
쪽과 같은 원본에서 나오므로 렌더링된 페이지와 에디터가 달라 보일 수 없습니다.

알아 둘 만한 성질이 세 가지 있습니다.

**적용 범위가 직접 붙이는 클래스 하나로 한정됩니다.** 요소에 `kinkin-content`
(`CONTENT_SCOPE_CLASS`로 export)를 붙이기 전까지는 아무것도 스타일링되지 않습니다. 글자
크기, 글꼴, 글자색은 언제나 상속될 뿐 설정되지 않습니다. 모든 치수가 `em` 단위이므로 콘텐츠는
페이지가 주는 환경에 맞춰 함께 확대·축소됩니다.

**캐스케이드 레이어 안에 있습니다.** 모든 규칙이 `@layer kinkin-content` 안에 있습니다.
레이어에 속하지 않은 CSS는 명시도와 관계없이 레이어 안의 CSS를 이기므로, 여러분의 규칙은
`!important`나 명시도 싸움 없이 그대로 적용됩니다.

```css
/* 어떤 레이어에도 속하지 않으므로 content.css를 이깁니다 — 선택자가 덮어쓸 대상보다
   더 구체적일 필요가 없습니다. */
.kinkin-content h1 { font-size: 2.5rem; }
```

**모든 색은 `--tt-core-*` 변수이며, 이 스타일시트는 그중 어느 것도 선언하지 않습니다.** 각
색은 기본값을 폴백으로 가진 `var()`이므로, 콘텐츠 요소보다 위 어디에서든 토큰을 설정하면
테마가 바뀝니다. 다크 모드도 마찬가지입니다.

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

(스타일시트가 `.kinkin-content` 자체에 기본값을 선언하지 않는 이유가 이것입니다. 상속되는
커스텀 속성은 명시도가 아니라 가까움으로 결정되므로, 콘텐츠 요소에 붙인 선언이 `html.dark`의
선언을 조용히 이겨 버립니다.)

표시 전용 결정이 두 가지 있습니다. 작업 목록 체크박스는 렌더링되지만 클릭할 수 없고 — 페이지
에는 그 클릭을 저장할 곳이 없습니다 — `imageUpload` 자리표시자는 숨겨집니다.

제약이 하나 있습니다. 스코프 요소는 에디터와 마찬가지로 `white-space: pre-wrap`이므로 작성자가
입력한 연속 공백이 그대로 남습니다. 그 안에서 생성된 HTML을 정렬하거나 들여쓰지 마세요. 그
들여쓰기가 그대로 화면에 나옵니다.

---

## API 레퍼런스

### `<RichTextEditor />`

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `initialContent` | `Content` | — | 시작 내용. 마크다운/HTML 문자열 또는 Tiptap JSON 문서. 마운트 이후에 바꾸면 내용이 교체되고 undo 기록이 지워집니다. |
| `contentType` | `"markdown" \| "html" \| "json"` | `"markdown"` | `initialContent`를 해석하는 방식. |
| `outputContentType` | `"markdown" \| "html" \| "json" \| "text"` | `"markdown"` | `onChange`가 내보내는 형식. |
| `onChange` | `(value, meta?) => void` | — | 편집 시 호출. `value`는 문자열이며, 출력이 `"json"`이면 `JSONContent`. AI 스트리밍 중에는 억제됩니다. |
| `editable` | `boolean` | `true` | `false`면 읽기 전용으로 렌더링됩니다. 툴바는 숨겨지고 내용은 선택 가능합니다. |
| `toolbar` | `ReactNode` | — | 내용 위, editor context 안에 렌더링됩니다. `<FixedToolbar />`를 넘기세요. |
| `imageUploadHandler` | `EditorImageUploadHandler` | — | 이미지 업로드를 켭니다. 생략하면 꺼집니다. |
| `streamCompletion` | `StreamCompletionFn` | — | AI Assist를 켭니다. 생략하면 꺼집니다. |
| `aiMode` | `"assist" \| "chat"` | — | 선택 툴바에 어떤 AI 버튼을 보일지 결정합니다. |
| `onAiChatRequest` | `(message, selectedText) => void` | — | `aiMode="chat"`일 때 채팅 버튼이 호출합니다. |
| `onTocItemsChange` | `(items) => void` | — | 제목이 바뀔 때 호출. `<ToC />`에 넘기세요. |
| `editorRef` | `RefObject<Editor \| null>` | — | 내부 Tiptap 인스턴스로 가는 탈출구. |
| `pageTitle` | `string` | — | AI Assist 프롬프트에 문맥으로 포함됩니다. |
| `placeholder` | `string` | — | 빈 문서에 표시할 안내 문구. |

`onChange`의 `meta.source`는 사용자가 입력하면 `"manual"`, 프로그램에 의한 편집이면
`"conversation"`입니다. 사용자 행동이 아닌 변경에서 자동 저장을 건너뛸 때 유용합니다.

### 툴바

| Export | 동작 |
| --- | --- |
| `<FixedToolbar showAiAssist? className? />` | 항상 보이는 바. `toolbar` prop으로 넘깁니다. 실행 취소/다시 실행, 블록 타입(문단, H1–H4), 목록(글머리/번호/할 일), 굵게/기울임/밑줄/취소선/코드, 인용, 코드 블록, 구분선, 링크, 표, 이미지, 슬래시 트리거, AI Assist. |
| `<SelectionToolbar />` | 데스크톱에서 선택한 텍스트 위에 떠 있습니다. 자동으로 렌더링됩니다. |
| `<MobileToolbar />` | 480px 미만에서 화면 하단에 고정됩니다. 자동으로 렌더링됩니다. |

직접 마운트해야 하는 것은 `FixedToolbar`뿐이고, 나머지 둘은 이미 연결되어 있습니다.

### `<ToC />`

```tsx
const [items, setItems] = useState([]);
const editorRef = useRef(null);

<RichTextEditor editorRef={editorRef} onTocItemsChange={setItems} {...rest} />
<ToC items={items} editor={editorRef.current} trackScroll />
```

| Prop | 타입 | 기본값 | 설명 |
| --- | --- | --- | --- |
| `items` | `TableOfContentDataItem[]` | `[]` | `onTocItemsChange`에서 받습니다. |
| `editor` | `Editor \| null` | — | `editorRef`에서 받습니다. 제목으로 스크롤하려면 필요합니다. |
| `trackScroll` | `boolean` | `true` | 현재 화면에 보이는 제목을 강조합니다. *window* 스크롤을 감지하므로, 에디터가 직접 만든 스크롤 컨테이너 안에 있다면 꺼 주세요. |

### `imageUploadHandler` — 이미지 업로드

이미지를 끌어다 놓거나, 붙여넣거나, 툴바에서 고를 때 호출됩니다. 삽입할 URL을 반환하고,
예외를 던지면 UI에서 업로드 실패로 표시됩니다.

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

### `streamCompletion` — 스트리밍 AI Assist

AI Assist를 구동합니다. 라이브러리가 사용자가 고른 동작(`improve`, `continue`,
`summarize`, `fix-grammar`, `simplify`, `shorten`, `extend`, `translate`, `tone`,
`custom`)과 주변 문맥으로 프롬프트를 만듭니다. 전송은 여러분 몫입니다. 토큰마다
`onChunk`, 끝나면 `onComplete`, 실패하면 `onError`를 호출하고, 정지 버튼이 동작하도록
`signal`을 존중하세요.

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

넘기지 않으면 AI 버튼은 아무 동작도 하지 않고 콘솔에 경고가 찍힙니다.

### 그 밖의 export

| Export | 용도 |
| --- | --- |
| `useAiAssistStream(editor, options)` | AI Assist 뒤에 있는 hook. 에디터를 직접 조립할 때 사용합니다. |
| `getEditorPortalRoot()` | portal UI가 렌더링되는 스코프 컨테이너. |
| `EDITOR_SCOPE_CLASS` | `"kinkin-editor"` — 스코프 클래스. 직접 만든 portal에 붙일 때 씁니다. |
| `createContentExtensions()` | 저장된 문서를 렌더링하기 위한 스키마 전용 확장 목록. `@blakaa/kinkin-editor/content`에서도 가져올 수 있습니다. |
| `CONTENT_SCOPE_CLASS` | `"kinkin-content"` — `content.css`가 적용 범위로 삼는 클래스. |
| `<ToCItem />`, `<ToCEmptyState />` | `<ToC />`를 이루는 조각들. 목차 레이아웃을 직접 만들 때 사용합니다. |
| 타입 | `RichTextEditorProps`, `EditorImageUploadHandler`, `StreamCompletionFn`, `StreamCompletionParams` |

---

## 레시피

**자동 저장하되 프로그램에 의한 편집은 건너뛰기**

```tsx
<RichTextEditor
  onChange={(value, meta) => {
    if (meta?.source === "manual") debouncedSave(value as string);
  }}
  {...rest}
/>
```

**읽기 전용 미리보기**

```tsx
<RichTextEditor initialContent={doc} editable={false} contentType="markdown" />
```

**Tiptap 인스턴스에 접근하기**

```tsx
const editorRef = useRef(null);
<RichTextEditor editorRef={editorRef} {...rest} />;
// 이후: editorRef.current?.commands.focus()
```

**마크다운 대신 HTML 쓰기**

```tsx
<RichTextEditor contentType="html" outputContentType="html" {...rest} />
```

---

## 문제 해결

### 에디터에 스타일이 적용되지 않습니다

`import "@blakaa/kinkin-editor/style.css"`를 하지 않았습니다.

### 에디터 높이가 0입니다

에디터는 컨테이너를 채웁니다. 부모에 명시적인 높이를 주거나, flex 자식이라면
`min-height: 0`을 지정하세요.

### `@tiptap/core` 중복, 또는 `getPreviousBlockSibling is not exported`

의존성 트리에 Tiptap 버전이 둘 이상 있습니다. Tiptap 자체의 전이 의존성 `^3.31.3`
범위가 더 새로운 마이너로 해석되면서 두 번째 `@tiptap/core`를 끌어올 수 있습니다.
앱의 `package.json`에서 스코프 전체를 고정하세요.

```json
{
  "overrides": {
    "@tiptap/core": "3.31.3",
    "@tiptap/pm": "3.31.3"
  }
}
```

(Yarn에서는 `resolutions`라고 부릅니다.) 업그레이드할 때는 스코프 전체를 함께 옮기세요.
Tiptap 마이너 버전을 섞으면 런타임이 아니라 빌드 시점에 실패합니다.

### 메뉴나 툴팁에 스타일이 없습니다

무언가가 스코프 컨테이너 밖에서 그것들을 렌더링하고 있습니다. `getEditorPortalRoot()`로
portal 하세요.

### 에디터를 추가했더니 앱 스타일이 바뀌었습니다

그럴 리 없습니다. 스코프 분리가 바로 그것을 막기 위한 장치입니다. 그런 일이 생겼다면
제보할 가치가 있는 버그입니다.

### 저장된 JSON을 렌더링할 때 `RangeError: Unknown node type`

`generateHTML`에 넘긴 확장 목록이 문서를 전부 다루지 못합니다. 직접 작성한 목록 대신
`@blakaa/kinkin-editor/content`의 `createContentExtensions()`를 넘기세요. 에디터가 실제로
돌리는 바로 그 스키마이므로 에디터에 노드가 늘어나도 계속 올바릅니다.
[에디터 없이 저장된 콘텐츠 렌더링하기](#에디터-없이-저장된-콘텐츠-렌더링하기)를 참고하세요.

### 렌더링된 콘텐츠에 스타일이 없거나 표가 페이지를 넘칩니다

`@blakaa/kinkin-editor/content.css`를 import하고 HTML이 들어가는 요소에 `kinkin-content`를
붙이세요. 이 클래스가 없으면 해당 스타일시트의 어떤 규칙도 적용되지 않습니다. 넘치는 것이
표라면, 그 HTML은 `createContentExtensions()`의 확장이 아니라 일반 `Table` 확장으로 생성된
것입니다. 전자는 CSS가 필요로 하는 스크롤 컨테이너를 출력합니다.

---

## 라이선스

[MIT](../LICENSE). 마음껏 쓰고, fork 하고, 상업적으로 배포하세요. 저작권 고지만
남겨 주세요.

---

## 로컬 개발

디렉터리 구조, 코딩 규약, 빌드 관련 참고 사항은 영문 README의
[Local development](../README.md#local-development) 절을 보세요.
