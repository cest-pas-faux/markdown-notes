"use client";

interface Props {
  content: string;
  onChange: (value: string) => void;
}

export function Editor({ content, onChange }: Props) {
  return (
    <textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      spellCheck
      className="w-full h-full resize-none p-6 font-mono text-sm leading-relaxed bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none placeholder-gray-300 dark:placeholder-gray-600"
      placeholder={"# Document title\n\nStart writing in Markdown…"}
    />
  );
}
