<p align="center">
  <img src="../assets/banner.svg" alt="Kinkin Editor - trình soạn thảo văn bản cho React, xây trên Tiptap và ProseMirror" width="100%">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@blakaa/kinkin-editor"><img src="https://img.shields.io/npm/v/@blakaa/kinkin-editor?color=green" alt="phiên bản npm"></a>
  <a href="../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Giấy phép MIT"></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/react-18%20%7C%2019-149eca.svg" alt="React 18 và 19"></a>
  <a href="https://tiptap.dev"><img src="https://img.shields.io/badge/tiptap-3.31-000000.svg" alt="Tiptap 3.31"></a>
</p>

<p align="center">
  <strong>Ngôn ngữ:</strong>
  <a href="../README.md">English</a> ·
  Tiếng Việt ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a>
</p>

# Kinkin Editor

**Trình soạn thảo văn bản (rich text editor) cắm-là-chạy cho React.** Một WYSIWYG
kiểu Notion xây trên [Tiptap](https://tiptap.dev) và ProseMirror: vào markdown, ra
markdown (hoặc HTML/JSON), kèm slash command, bảng, ảnh, emoji, kéo-thả để sắp xếp
lại khối, mục lục, và một bảng AI Assist nhận nội dung theo luồng (streaming) từ
bất kỳ LLM nào bạn trỏ tới.

```bash
npm install @blakaa/kinkin-editor
```

Nó được thiết kế để lắp vào ứng dụng React sẵn có của bạn: không reset CSS toàn
cục, không bắt buộc cài Tailwind, không có provider phải bọc, và không giả định gì
về backend — upload ảnh và AI chỉ là những callback bạn tự cung cấp, hoặc bỏ qua.

**[Bản demo và playground →](https://blakaalab.github.io/kinkin-editor/)** ·
[Hướng dẫn cài đặt](https://blakaalab.github.io/kinkin-editor/#/docs) ·
[Các bản phát hành](https://github.com/blakaalab/kinkin-editor/releases)

---

## Tính năng

**Slash menu** (gõ `/`): Đoạn văn, Heading 1–4, Danh sách chấm đầu dòng, Danh sách
đánh số, Danh sách công việc, Trích dẫn, Code, Emoji, Bảng, Ảnh, Đường kẻ ngang.

**Có sẵn**

- Vào markdown, ra markdown — và dán markdown là tự chuyển thành nội dung định dạng
- Bộ chọn emoji khi gõ `:`
- Tay cầm kéo ở mỗi khối để sắp xếp lại; `Mod-Shift-↑/↓` để di chuyển, `Mod-Shift-D` để nhân bản
- Bảng có điều khiển cột/hàng và kéo-thả để sắp xếp
- Sửa liên kết, khối code, danh sách công việc, tô sáng, thay thế ký tự typography
- Upload ảnh qua callback bạn cung cấp
- AI Assist theo luồng — cải thiện, viết tiếp, tóm tắt, sửa ngữ pháp, đơn giản hoá,
  rút gọn, mở rộng, dịch, đổi giọng văn, hoặc prompt tuỳ ý
- Mục lục qua `onTocItemsChange`
- Thanh công cụ cố định, nổi theo vùng chọn, và cho di động
- Có sẵn kiểu TypeScript; hỗ trợ React 18 và 19

---

## Cài đặt

```bash
npm install @blakaa/kinkin-editor    # hoặc: pnpm add @blakaa/kinkin-editor
```

Với npm 7+ và pnpm thì chỉ cần vậy: cả hai đều đọc `peerDependencies` và tự cài
React cùng toàn bộ 21 gói `@tiptap/*` cho bạn — bạn không cần liệt kê chúng.

### Yarn

Yarn **không** tự cài peer dependencies — cả Classic lẫn Berry. Bạn phải khai báo
tường minh (dùng brace expansion cho gọn còn hai dòng):

```bash
yarn add @blakaa/kinkin-editor
yarn add react react-dom \
  @tiptap/{core,react,pm,starter-kit,extensions,markdown,suggestion,extension-emoji,extension-highlight,extension-history,extension-horizontal-rule,extension-image,extension-list,extension-mention,extension-strike,extension-table,extension-table-of-contents,extension-text-style,extension-typography,extension-unique-id,extension-drag-handle-react}
```

### Vì sao phải dùng peer dependencies

React và ProseMirror bắt buộc chỉ được có **một bản duy nhất**. Hai bản React sẽ
cho lỗi "Invalid hook call"; hai bản ProseMirror sẽ cho `RangeError: Invalid
content` và xung đột plugin key, vì `prosemirror-model` dựa vào phép kiểm tra
`instanceof` và một schema registry dùng chung. Khai báo chúng là peer chính là
cách buộc trình quản lý gói gộp về một bản.

Mọi peer `@tiptap/*` đều ghim ở `~3.31.3` — phiên bản mà thư viện này được build và
kiểm thử cùng. Trộn lẫn các minor của Tiptap sẽ lỗi ngay lúc build, nên khoảng
phiên bản được giữ hẹp có chủ đích và chỉ dịch chuyển đồng loạt sau mỗi lần nâng
cấp Tiptap đã được kiểm chứng.

---

## Bắt đầu nhanh

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

Hai điều hay khiến người dùng vấp:

1. **Nhớ import stylesheet.** `import "@blakaa/kinkin-editor/style.css"` một lần,
   ở bất kỳ đâu trong ứng dụng. Thiếu nó thì editor hiện ra không có style.
2. **Cho nó chiều cao.** Editor lấp đầy khối chứa nó (`height: 100%`). Nếu khối cha
   không có chiều cao thì nó co lại thành số không. Hãy đặt chiều cao tường minh cho
   khối cha, hoặc `min-height: 0` nếu nó là con của một flex container.

Thanh công cụ là tuỳ chọn — bỏ `toolbar` để có editor không khung, vẫn dùng được
bằng slash command và thanh công cụ theo vùng chọn.

---

## Dùng chung với Tailwind CSS của bạn

**Nói ngắn gọn: không cần cấu hình gì. Nó không thể xung đột với style của bạn.**

Việc một thư viện ship kèm Tailwind thường gây ba vấn đề. Cả ba đều đã được xử lý
ngay lúc build:

| Vấn đề | Cách tránh |
| --- | --- |
| Xung đột utility — `.text-sm` của thư viện âm thầm đổi style *ứng dụng của bạn* | Mọi rule đều được lồng dưới `.kinkin-editor`, nên chỉ áp dụng bên trong editor |
| Rò rỉ token — `--color-*` của thư viện đè lên theme của bạn ở `:root` | `:root` được viết lại thành `.kinkin-editor`; không có gì rơi xuống document root |
| Preflight trùng lặp — hai bộ reset đánh nhau | Stylesheet được build với **không preflight** |

`.text-gray-500` của thư viện và của bạn có thể mang giá trị hoàn toàn khác nhau mà
không bên nào bị ảnh hưởng. Bạn thậm chí không cần Tailwind — thứ được ship ra là
CSS đã biên dịch thuần tuý.

Phần UI dựng qua portal (menu, tooltip, bản xem trước khi kéo, thanh công cụ di
động) lẽ ra sẽ thoát khỏi phạm vi đó vì render thẳng vào `document.body`. Chúng
được portal vào một container cũng mang class ấy, expose qua `getEditorPortalRoot()`.

---

## Tuỳ biến giao diện

Ghi đè các design token trên class phạm vi — chúng sẽ lan xuống mọi thứ bên trong:

```css
.kinkin-editor {
  --color-primary-700: #7c3aed;  /* màu nhấn: nút đang bật, vòng focus */
  --color-foreground: #1f2937;   /* chữ nội dung */
  --color-background: #ffffff;
  --color-border: #e5e7eb;
  --color-muted-foreground: #6b7280;
  --font-sans: "Inter", system-ui, sans-serif;
}
```

Phần style cho *nội dung* editor (khối code, bảng, danh sách công việc, trích dẫn)
dùng một namespace riêng là `--tt-core-*`, ghi đè theo cùng cách:

```css
.kinkin-editor {
  --tt-core-code-bg: #f5f5f5;
  --tt-core-table-header-bg: #fafafa;
  --tt-core-link: #2563eb;
  --tt-core-selection: #dbeafe;
}
```

---

## Tài liệu API

### `<RichTextEditor />`

| Prop | Kiểu | Mặc định | Mô tả |
| --- | --- | --- | --- |
| `initialContent` | `Content` | — | Nội dung khởi tạo: chuỗi markdown/HTML, hoặc một Tiptap JSON doc. Đổi giá trị này sau khi mount sẽ thay toàn bộ nội dung và xoá lịch sử undo. |
| `contentType` | `"markdown" \| "html" \| "json"` | `"markdown"` | Cách diễn giải `initialContent`. |
| `outputContentType` | `"markdown" \| "html" \| "json" \| "text"` | `"markdown"` | Định dạng mà `onChange` phát ra. |
| `onChange` | `(value, meta?) => void` | — | Kích hoạt khi có chỉnh sửa. `value` là chuỗi, hoặc `JSONContent` khi output là `"json"`. Bị tạm ngưng trong lúc AI đang stream. |
| `editable` | `boolean` | `true` | `false` sẽ render ở chế độ chỉ đọc — thanh công cụ ẩn đi, nội dung vẫn bôi đen được. |
| `toolbar` | `ReactNode` | — | Render phía trên nội dung, bên trong editor context. Truyền `<FixedToolbar />`. |
| `imageUploadHandler` | `EditorImageUploadHandler` | — | Bật tính năng upload ảnh. Bỏ qua để tắt. |
| `streamCompletion` | `StreamCompletionFn` | — | Bật AI Assist. Bỏ qua để tắt. |
| `aiMode` | `"assist" \| "chat"` | — | Quyết định thanh công cụ vùng chọn hiện nút AI nào. |
| `onAiChatRequest` | `(message, selectedText) => void` | — | Được gọi bởi nút chat khi `aiMode="chat"`. |
| `onTocItemsChange` | `(items) => void` | — | Kích hoạt khi các heading thay đổi. Đưa vào `<ToC />`. |
| `editorRef` | `RefObject<Editor \| null>` | — | Lối thoát để chạm tới instance Tiptap bên dưới. |
| `pageTitle` | `string` | — | Được đưa vào làm ngữ cảnh trong prompt của AI Assist. |
| `placeholder` | `string` | — | Chữ gợi ý khi tài liệu trống. |

`meta.source` của `onChange` là `"manual"` khi người dùng gõ và `"conversation"`
với các thay đổi do chương trình tạo ra — hữu ích để bỏ qua autosave với những
thay đổi không phải của người dùng.

### Thanh công cụ

| Export | Hành vi |
| --- | --- |
| `<FixedToolbar showAiAssist? className? />` | Thanh cố định. Truyền qua prop `toolbar`. Undo/redo, kiểu khối (đoạn văn, H1–H4), danh sách (chấm/số/công việc), đậm/nghiêng/gạch chân/gạch ngang/code, trích dẫn, khối code, đường kẻ ngang, liên kết, bảng, ảnh, kích hoạt slash, AI Assist. |
| `<SelectionToolbar />` | Nổi lên trên phần văn bản được chọn, trên desktop. Tự động được render. |
| `<MobileToolbar />` | Gắn ở đáy màn hình dưới 480px. Tự động được render. |

Chỉ `FixedToolbar` là cần bạn tự mount; hai cái còn lại đã được nối sẵn.

### `<ToC />`

```tsx
const [items, setItems] = useState([]);
const editorRef = useRef(null);

<RichTextEditor editorRef={editorRef} onTocItemsChange={setItems} {...rest} />
<ToC items={items} editor={editorRef.current} trackScroll />
```

| Prop | Kiểu | Mặc định | Mô tả |
| --- | --- | --- | --- |
| `items` | `TableOfContentDataItem[]` | `[]` | Lấy từ `onTocItemsChange`. |
| `editor` | `Editor \| null` | — | Lấy từ `editorRef`. Cần có để cuộn tới heading. |
| `trackScroll` | `boolean` | `true` | Làm nổi bật heading đang trong tầm nhìn. Nó lắng nghe sự kiện cuộn của *window*, nên hãy tắt đi nếu editor nằm trong một khối cuộn riêng của bạn. |

### `imageUploadHandler` — upload ảnh

Được gọi cho ảnh thả vào, dán vào, hoặc chọn từ thanh công cụ. Trả về URL để nhúng;
ném lỗi sẽ đánh dấu là upload thất bại trên giao diện.

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

### `streamCompletion` — AI Assist theo luồng

Đây là thứ vận hành AI Assist. Thư viện tự dựng prompt từ hành động người dùng chọn
(`improve`, `continue`, `summarize`, `fix-grammar`, `simplify`, `shorten`,
`extend`, `translate`, `tone`, `custom`) cộng với ngữ cảnh xung quanh. Phần truyền
tải là của bạn: gọi `onChunk` cho mỗi token, `onComplete` khi xong, `onError` khi
lỗi, và tôn trọng `signal` để nút dừng hoạt động được.

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

Bỏ nó đi thì các nút AI thành vô tác dụng, kèm một cảnh báo trong console.

### Các export khác

| Export | Công dụng |
| --- | --- |
| `useAiAssistStream(editor, options)` | Hook đứng sau AI Assist, dùng khi bạn tự lắp editor của mình. |
| `getEditorPortalRoot()` | Container có phạm vi mà UI portal render vào. |
| `EDITOR_SCOPE_CLASS` | `"kinkin-editor"` — class phạm vi, dùng để gắn cho portal của riêng bạn. |
| `<ToCItem />`, `<ToCEmptyState />` | Các mảnh ghép tạo nên `<ToC />`, nếu bạn muốn tự dựng bố cục mục lục. |
| Types | `RichTextEditorProps`, `EditorImageUploadHandler`, `StreamCompletionFn`, `StreamCompletionParams` |

---

## Công thức thường dùng

**Autosave, bỏ qua thay đổi do chương trình tạo ra**

```tsx
<RichTextEditor
  onChange={(value, meta) => {
    if (meta?.source === "manual") debouncedSave(value as string);
  }}
  {...rest}
/>
```

**Xem trước ở chế độ chỉ đọc**

```tsx
<RichTextEditor initialContent={doc} editable={false} contentType="markdown" />
```

**Chạm tới instance Tiptap**

```tsx
const editorRef = useRef(null);
<RichTextEditor editorRef={editorRef} {...rest} />;
// sau đó: editorRef.current?.commands.focus()
```

**Dùng HTML thay cho markdown**

```tsx
<RichTextEditor contentType="html" outputContentType="html" {...rest} />
```

---

## Khắc phục sự cố

### Editor hiện ra không có style

Bạn chưa `import "@blakaa/kinkin-editor/style.css"`.

### Editor có chiều cao bằng không

Nó lấp đầy khối chứa nó. Hãy cho khối cha một chiều cao tường minh, hoặc
`min-height: 0` nếu nó là con của một flex container.

### Trùng `@tiptap/core`, hoặc `getPreviousBlockSibling is not exported`

Cây phụ thuộc của bạn đang có nhiều hơn một phiên bản Tiptap. Các khoảng `^3.31.3`
mà chính Tiptap khai báo có thể phân giải sang một minor mới hơn và kéo về bản
`@tiptap/core` thứ hai. Hãy ghim cả scope trong `package.json` của ứng dụng:

```json
{
  "overrides": {
    "@tiptap/core": "3.31.3",
    "@tiptap/pm": "3.31.3"
  }
}
```

(Yarn gọi cái này là `resolutions`.) Khi nâng cấp thì dịch chuyển cả scope cùng lúc
— trộn lẫn các minor của Tiptap sẽ lỗi lúc build, không phải lúc chạy.

### Menu hoặc tooltip hiện ra không có style

Có thứ gì đó đang render chúng bên ngoài container có phạm vi. Hãy portal chúng vào
`getEditorPortalRoot()`.

### Style của ứng dụng tôi đổi sau khi thêm editor

Lẽ ra không nên — đó chính là điều mà việc giới hạn phạm vi ngăn chặn. Nếu điều đó
xảy ra thì đây là một lỗi đáng được báo cáo.

---

## Giấy phép

[MIT](../LICENSE). Cứ dùng, fork, và thương mại hoá — chỉ cần giữ lại thông báo bản quyền.

---

## Phát triển tại máy

Xem phần [Local development](../README.md#local-development) trong README tiếng Anh
để biết cấu trúc thư mục, quy ước code và các ghi chú về build.
