import { useTiptapEditor } from "../../hooks/use-tiptap-editor";
import { useBlockquote } from "../../ui/blockquote-button/use-blockquote";
import { useCodeBlock } from "../../ui/code-block-button/use-code-block";
import { useHeading } from "../../ui/heading-button/use-heading";
import { useList } from "../../ui/list-button/use-list";
import { useParagraph } from "../../ui/paragraph-button/use-paragraph";

type BlockType =
  | "paragraph"
  | "heading"
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "blockquote"
  | "codeBlock";

interface MenuItemConfig {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  action: () => void;
  isActive: boolean;
  disabled: boolean;
}

export const useTurnIntoMenu = (blockTypes?: BlockType[]) => {
  const { editor } = useTiptapEditor();
  const paragraph = useParagraph();
  const heading1 = useHeading({ level: 1 });
  const heading2 = useHeading({ level: 2 });
  const heading3 = useHeading({ level: 3 });
  const bulletList = useList({ type: "bulletList" });
  const orderedList = useList({ type: "orderedList" });
  const taskList = useList({ type: "taskList" });
  const blockquote = useBlockquote();
  const codeBlock = useCodeBlock();

  if (!editor) {
    return {
      blockItems: [] as MenuItemConfig[],
      listItems: [] as MenuItemConfig[],
      otherItems: [] as MenuItemConfig[],
    };
  }

  const shouldInclude = (type: BlockType) =>
    !blockTypes || blockTypes.includes(type);

  const mapper = (
    action: ReturnType<
      | typeof useParagraph
      | typeof useHeading
      | typeof useList
      | typeof useBlockquote
      | typeof useCodeBlock
    >,
    id: string,
  ): MenuItemConfig => ({
    id,
    icon: action.Icon,
    label: action.label,
    action: action.handleToggle,
    isActive: action.isActive,
    disabled: !action.canToggle,
  });

  const blockItems: MenuItemConfig[] = [];
  if (shouldInclude("paragraph")) {
    blockItems.push(mapper(paragraph, "turn-into-paragraph"));
  }
  if (shouldInclude("heading")) {
    blockItems.push(
      mapper(heading1, "turn-into-heading-1"),
      mapper(heading2, "turn-into-heading-2"),
      mapper(heading3, "turn-into-heading-3"),
    );
  }

  const listItems: MenuItemConfig[] = [];
  if (shouldInclude("orderedList")) {
    listItems.push(mapper(orderedList, "turn-into-ordered-list"));
  }
  if (shouldInclude("bulletList")) {
    listItems.push(mapper(bulletList, "turn-into-bullet-list"));
  }
  if (shouldInclude("taskList")) {
    listItems.push(mapper(taskList, "turn-into-task-list"));
  }

  const otherItems: MenuItemConfig[] = [];
  if (shouldInclude("codeBlock")) {
    otherItems.push(mapper(codeBlock, "turn-into-code-block"));
  }
  if (shouldInclude("blockquote")) {
    otherItems.push(mapper(blockquote, "turn-into-blockquote"));
  }

  return { blockItems, listItems, otherItems };
};
