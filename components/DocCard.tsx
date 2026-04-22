"use client";

import type { Doc } from "@/types";
import { extractTitle, extractPreview } from "@/lib/extractTitle";
import { formatDate } from "@/lib/formatDate";

interface Props {
  doc: Doc;
  selected: boolean;
  onClick: () => void;
}

export function DocCard({ doc, selected, onClick }: Props) {
  const title = extractTitle(doc.content) || "Untitled";
  const preview = extractPreview(doc.content);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
        selected
          ? "bg-indigo-50 dark:bg-indigo-900/40"
          : "hover:bg-gray-100 dark:hover:bg-zinc-700/50"
      }`}
    >
      <div className="flex items-start gap-1.5">
        {doc.pinnedAt && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"
            className="w-3 h-3 mt-0.5 flex-shrink-0 text-indigo-500 dark:text-indigo-400">
            <path fillRule="evenodd" d="M8 1a.75.75 0 0 1 .75.75V6h1.5a.75.75 0 0 1 0 1.5h-.75v1.628a2.251 2.251 0 0 1 1.042 3.737L9.25 14.19v.06a.75.75 0 0 1-1.5 0v-.06l-1.292-1.325A2.251 2.251 0 0 1 7.5 9.128V7.5h-.75a.75.75 0 0 1 0-1.5h1.5V1.75A.75.75 0 0 1 8 1Z" clipRule="evenodd" />
          </svg>
        )}
        <span className={`text-sm font-medium leading-snug truncate ${
          selected ? "text-indigo-700 dark:text-indigo-300" : "text-gray-900 dark:text-gray-100"
        }`}>
          {title}
        </span>
      </div>

      {preview && (
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {preview}
        </p>
      )}

      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
        {formatDate(doc.updatedAt)}
      </p>
    </button>
  );
}
