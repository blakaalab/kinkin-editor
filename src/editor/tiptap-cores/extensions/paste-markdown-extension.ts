import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";

const looksLikeMarkdown = (text: string): boolean => {
  return (
    /^#{1,6}\s/.test(text) ||
    /\*\*[^*]+\*\*/.test(text) ||
    /\[.+\]\(.+\)/.test(text) ||
    /^[-*+]\s/.test(text) ||
    /\|.+\|/.test(text)
  );
};

export const PasteMarkdown = Extension.create({
  name: "pasteMarkdown",

  addProseMirrorPlugins() {
    const { editor } = this;

    return [
      new Plugin({
        props: {
          handlePaste(_, event) {
            const text = event.clipboardData?.getData("text/plain");

            if (!text) {
              return false;
            }

            if (editor.markdown && looksLikeMarkdown(text)) {
              try {
                const json = editor.markdown.parse(text);
                editor.commands.insertContent(json);
                return true;
              } catch {
                return false;
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});
