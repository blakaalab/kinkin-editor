import { useCallback, useEffect, useRef } from "react";

import type { Editor } from "@tiptap/react";

import type { AiAssistRequest } from "@/editor/tiptap-cores/extensions/ai-assist-extension";

type ActionMetadata = AiAssistRequest["metadata"];

export interface StreamCompletionParams {
  message: string;
  signal?: AbortSignal;
  onChunk: (content: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}

export type StreamCompletionFn = (
  params: StreamCompletionParams,
) => void | Promise<void>;

const TASK_INSTRUCTIONS: Record<string, (metadata?: ActionMetadata) => string> =
  {
    improve: () => "Improve the writing of the selected text.",
    continue: () => "Continue writing the selected text naturally.",
    summarize: () => "Summarize the selected text concisely.",
    "fix-grammar": () => "Fix the spelling and grammar of the selected text.",
    simplify: () => "Simplify the language of the selected text.",
    shorten: () => "Shorten the selected text while preserving its meaning.",
    extend: () => "Expand the selected text with more detail.",
    translate: (metadata) => {
      const language = (metadata?.language as string) ?? "English";
      return `Translate the selected text to ${language}.`;
    },
    tone: (metadata) => {
      const tone = (metadata?.tone as string) ?? "professional";
      return `Rewrite the selected text in a ${tone} tone.`;
    },
    custom: (metadata) =>
      (metadata?.prompt as string) ?? "Rewrite the selected text.",
  };

function buildAiAssistPrompt(
  request: AiAssistRequest,
  pageTitle?: string,
): string {
  const {
    actionId,
    selectedText,
    metadata,
    rejectedResponse,
    surroundingContext,
  } = request;

  const parts: string[] = [];

  parts.push(`<task>
${(TASK_INSTRUCTIONS[actionId] ?? (() => `${actionId}.`))(metadata)}
Return only the resulting text. Do not ask clarifying questions.
</task>`);

  if (pageTitle || surroundingContext) {
    const contextInner: string[] = [];
    if (pageTitle) {
      contextInner.push(`<page_title>${pageTitle}</page_title>`);
    }
    if (surroundingContext) {
      if (surroundingContext.beforeSelectedText) {
        contextInner.push(
          `<text_before>${surroundingContext.beforeSelectedText}</text_before>`,
        );
      }
      if (surroundingContext.afterSelectedText) {
        contextInner.push(
          `<text_after>${surroundingContext.afterSelectedText}</text_after>`,
        );
      }
    }
    parts.push(
      `<context description="Surrounding context for reference only. Do not modify.">\n${contextInner.join("\n")}\n</context>`,
    );
  }

  parts.push(`<selected_text>\n${selectedText}\n</selected_text>`);

  if (rejectedResponse) {
    parts.push(
      `<rejected_response description="A previous attempt that was rejected. Provide a different result.">\n${rejectedResponse}\n</rejected_response>`,
    );
  }

  return parts.join("\n\n");
}

/**
 * Drives the editor's AI Assist panel. The host app supplies `streamCompletion` —
 * this hook has no opinion on which LLM/backend produces the tokens.
 */
export function useAiAssistStream(
  editor: Editor | null,
  options?: {
    pageTitle?: string;
    streamCompletion?: StreamCompletionFn;
  },
): {
  handleAiAssist: (request: AiAssistRequest) => void;
  abortStream: () => void;
} {
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleAiAssist = useCallback(
    (request: AiAssistRequest) => {
      if (!editor) {
        return;
      }

      if (!options?.streamCompletion) {
        console.warn(
          "useAiAssistStream: no `streamCompletion` provided — AI Assist is a no-op until the host app wires one up.",
        );
        return;
      }

      abortControllerRef.current?.abort();

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      editor.commands.startAiAssistCalling();

      const prompt = buildAiAssistPrompt(request, options?.pageTitle);

      void options.streamCompletion({
        message: prompt,
        signal: abortController.signal,
        onChunk: (content) => {
          editor.commands.streamAiAssistContent(content);
        },
        onComplete: () => {
          editor.commands.completeAiAssistStream();
        },
        onError: (errorMessage) => {
          editor.commands.failAiAssistStream(errorMessage);
        },
      });
    },
    [editor, options?.pageTitle, options?.streamCompletion],
  );

  const abortStream = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { handleAiAssist, abortStream };
}
