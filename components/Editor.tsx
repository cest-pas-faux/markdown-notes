"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor as TipTapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

interface Props {
  content: string;
  onChange: (value: string) => void;
}

const extensions = [
  StarterKit,
  Markdown.configure({
    html: false,
    tightLists: true,
    bulletListMarker: "-",
    linkify: false,
    breaks: false,
    transformPastedText: true,
    transformCopiedText: true,
  }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { rel: "noopener noreferrer" },
  }),
  Placeholder.configure({ placeholder: "Start writing…" }),
];

export function Editor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none min-h-full focus:outline-none py-6 px-6 md:px-8",
      },
    },
    onUpdate: ({ editor }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange((editor.storage as any).markdown.getMarkdown());
    },
  });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-900">
      {editor && <Toolbar editor={editor} />}
      <div
        className="flex-1 overflow-y-auto cursor-text"
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent editor={editor} className="min-h-full" />
      </div>
    </div>
  );
}

/* ─── Toolbar ───────────────────────────────────────────────── */

type Level = 1 | 2 | 3;

function Toolbar({ editor }: { editor: TipTapEditor }) {
  const headingLevel =
    editor.isActive("heading", { level: 1 }) ? "1" :
    editor.isActive("heading", { level: 2 }) ? "2" :
    editor.isActive("heading", { level: 3 }) ? "3" : "0";

  function setHeading(val: string) {
    if (val === "0") editor.chain().focus().setParagraph().run();
    else editor.chain().focus().setHeading({ level: Number(val) as Level }).run();
  }

  function handleLink() {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  }

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex-shrink-0 flex-wrap">
      <select
        value={headingLevel}
        onChange={(e) => setHeading(e.target.value)}
        className="h-7 px-1.5 text-xs rounded bg-transparent text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 mr-1"
      >
        <option value="0">Normal</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      <Sep />

      <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <span className="font-bold text-xs leading-none">B</span>
      </Btn>
      <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <span className="italic font-serif text-xs leading-none">I</span>
      </Btn>
      <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <span className="line-through text-xs leading-none">S</span>
      </Btn>
      <Btn title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <span className="font-mono text-xs leading-none">`·`</span>
      </Btn>

      <Sep />

      <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <BulletListIcon />
      </Btn>
      <Btn title="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <OrderedListIcon />
      </Btn>
      <Btn title="Task list" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <TaskListIcon />
      </Btn>

      <Sep />

      <Btn title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <BlockquoteIcon />
      </Btn>
      <Btn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <CodeBlockIcon />
      </Btn>
      <Btn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <HrIcon />
      </Btn>

      <Sep />

      <Btn title={editor.isActive("link") ? "Remove link" : "Add link"} active={editor.isActive("link")} onClick={handleLink}>
        <LinkIcon />
      </Btn>

      <Sep />

      <Btn title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <UndoIcon />
      </Btn>
      <Btn title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <RedoIcon />
      </Btn>
    </div>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700 mx-0.5" />;
}

function Btn({
  title, active = false, disabled = false, onClick, children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => { e.preventDefault(); if (!disabled) onClick(); }}
      className={`w-7 h-7 flex items-center justify-center rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Icons ─────────────────────────────────────────────────── */

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      {children}
    </svg>
  );
}

function BulletListIcon() {
  return (
    <Icon>
      <path d="M2 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm3.5-1.5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8Zm0 5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8Zm0 5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8ZM2 9a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm0 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
    </Icon>
  );
}

function OrderedListIcon() {
  return (
    <Icon>
      <path d="M2 1.5a.5.5 0 0 0-1 0V3H.5a.5.5 0 0 0 0 1H2v.5H1a.5.5 0 0 0 0 1h1.5a.5.5 0 0 0 0-1H2V3h.5A.5.5 0 0 0 3 2.5V1.5ZM5 3a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1H5Zm0 5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1H5Zm0 5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1H5ZM1 8a1 1 0 0 1 2 0v.5l-1 1.25H3a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.39-.81L2 8.5V8a.5.5 0 0 0-.5-.5.5.5 0 0 0-.5.5v.25a.5.5 0 0 1-1 0V8Zm1 5.5L1.5 12H1a.5.5 0 0 1 0-1h1.5a.5.5 0 0 1 .5.5V13a.5.5 0 0 1-.5.5H1a.5.5 0 0 1 0-1h1v-.5H1a.5.5 0 0 1 0-1h1.5a.5.5 0 0 1 .5.5Z" />
    </Icon>
  );
}

function TaskListIcon() {
  return (
    <Icon>
      <path fillRule="evenodd" d="M2 2.5A.5.5 0 0 1 2.5 2h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 5A.5.5 0 0 1 2.5 7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1Zm0 5A.5.5 0 0 1 2.5 12h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1ZM5.5 3a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8Zm0 5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8Zm0 5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8Z" clipRule="evenodd" />
    </Icon>
  );
}

function BlockquoteIcon() {
  return (
    <Icon>
      <path d="M4.5 3.5A1.5 1.5 0 0 0 3 5v2.5h2V5H3.5V3.5h1ZM3 9.5v1A1.5 1.5 0 0 0 4.5 12H6V9.5H3Zm7-6A1.5 1.5 0 0 0 8.5 5v2.5h2V5H9V3.5h1Zm-1.5 6v1A1.5 1.5 0 0 0 10 12h1.5V9.5H8.5Z" />
    </Icon>
  );
}

function CodeBlockIcon() {
  return (
    <Icon>
      <path fillRule="evenodd" d="M5.03 3.47a.75.75 0 0 0-1.06 0L.97 6.47a.75.75 0 0 0 0 1.06l3 3a.75.75 0 0 0 1.06-1.06L2.56 7l2.47-2.47a.75.75 0 0 0 0-1.06Zm5.94 0a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06L13.44 7l-2.47-2.47a.75.75 0 0 1 0-1.06Zm-1.75.44a.75.75 0 0 1 .47.95l-3 8a.75.75 0 0 1-1.42-.48l3-8a.75.75 0 0 1 .95-.47Z" clipRule="evenodd" />
    </Icon>
  );
}

function HrIcon() {
  return (
    <Icon>
      <path d="M1 7.5a.5.5 0 0 0 0 1h14a.5.5 0 0 0 0-1H1Z" />
    </Icon>
  );
}

function LinkIcon() {
  return (
    <Icon>
      <path d="M8.914 6.025a.75.75 0 0 1 1.06 1.06L8.855 8.21l.003.001a5.25 5.25 0 0 1-7.425 7.424A5.25 5.25 0 0 1 8.858 8.21l-.003-.001 1.059-1.184Zm5.657-5.657a5.25 5.25 0 0 1 0 7.425L13.31 9.054a.75.75 0 1 1-1.06-1.06l1.26-1.261a3.75 3.75 0 0 0-5.303-5.304L6.944 2.691a.75.75 0 0 1-1.06-1.061l1.262-1.261a5.25 5.25 0 0 1 7.425 0Z" />
    </Icon>
  );
}

function UndoIcon() {
  return (
    <Icon>
      <path fillRule="evenodd" d="M1.22 4.22a.75.75 0 0 1 1.06 0L5 6.94V4a.75.75 0 0 1 1.5 0v4.5A.75.75 0 0 1 5.75 9.25H1.25a.75.75 0 0 1 0-1.5h2.44L1.22 5.28a.75.75 0 0 1 0-1.06ZM9 3.75A.75.75 0 0 1 9.75 3h3A3.25 3.25 0 0 1 16 6.25v3.5A3.25 3.25 0 0 1 12.75 13h-3.5a.75.75 0 0 1 0-1.5h3.5a1.75 1.75 0 0 0 1.75-1.75v-3.5A1.75 1.75 0 0 0 12.75 4.5h-3A.75.75 0 0 1 9 3.75Z" clipRule="evenodd" />
    </Icon>
  );
}

function RedoIcon() {
  return (
    <Icon>
      <path fillRule="evenodd" d="M14.78 4.22a.75.75 0 0 0-1.06 0L11 6.94V4a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 0-1.5h-2.44l2.47-2.47a.75.75 0 0 0 0-1.06ZM7 3.75A.75.75 0 0 0 6.25 3h-3A3.25 3.25 0 0 0 0 6.25v3.5A3.25 3.25 0 0 0 3.25 13h3.5a.75.75 0 0 0 0-1.5h-3.5A1.75 1.75 0 0 1 1.5 9.75v-3.5A1.75 1.75 0 0 1 3.25 4.5h3A.75.75 0 0 0 7 3.75Z" clipRule="evenodd" />
    </Icon>
  );
}
