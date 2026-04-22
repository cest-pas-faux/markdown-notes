"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  content: string;
}

export function Preview({ content }: Props) {
  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-10">
      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        {content.trim() ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        ) : (
          <p className="text-gray-300 dark:text-gray-600 italic">Nothing to preview yet.</p>
        )}
      </div>
    </div>
  );
}
