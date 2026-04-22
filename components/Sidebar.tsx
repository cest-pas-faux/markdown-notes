"use client";

import type { Doc, SortOrder, View } from "@/types";
import { sortDocs } from "@/lib/sort";
import { DocCard } from "./DocCard";

interface Props {
  activeDocs: Doc[];
  archivedDocs: Doc[];
  trashedDocs: Doc[];
  sortOrder: SortOrder;
  view: View;
  selectedId: string | null;
  search: string;
  onSearch: (q: string) => void;
  onSortChange: (s: SortOrder) => void;
  onViewChange: (v: View) => void;
  onSelect: (id: string) => void;
  onNewDoc: () => void;
}

const VIEW_LABELS: Record<View, string> = {
  notes: "Notes",
  archive: "Archive",
  trash: "Trash",
};

export function Sidebar({
  activeDocs,
  archivedDocs,
  trashedDocs,
  sortOrder,
  view,
  selectedId,
  search,
  onSearch,
  onSortChange,
  onViewChange,
  onSelect,
  onNewDoc,
}: Props) {
  const allDocs =
    view === "notes" ? activeDocs : view === "archive" ? archivedDocs : trashedDocs;

  const filtered = search.trim()
    ? allDocs.filter((d) =>
        d.content.toLowerCase().includes(search.toLowerCase())
      )
    : allDocs;

  const sorted = sortDocs(filtered, sortOrder);

  const counts = {
    notes: activeDocs.length,
    archive: archivedDocs.length,
    trash: trashedDocs.length,
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 overflow-hidden">
      {/* Top controls */}
      <div className="p-3 space-y-2 border-b border-gray-200 dark:border-zinc-700">
        <button
          onClick={onNewDoc}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
          </svg>
          New document
        </button>

        <input
          type="search"
          placeholder="Search…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm rounded-md bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value as SortOrder)}
          className="w-full px-2.5 py-1.5 text-xs rounded-md bg-white dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="modified-desc">Recently edited</option>
          <option value="modified-asc">Least recently edited</option>
          <option value="created-desc">Newest first</option>
          <option value="created-asc">Oldest first</option>
        </select>
      </div>

      {/* Doc list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {sorted.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-6 px-4">
            {search ? "No results" : view === "notes" ? "No documents yet" : `${VIEW_LABELS[view]} is empty`}
          </p>
        ) : (
          sorted.map((doc) => (
            <DocCard
              key={doc.id}
              doc={doc}
              selected={doc.id === selectedId}
              onClick={() => onSelect(doc.id)}
            />
          ))
        )}
      </div>

      {/* View switcher */}
      <div className="flex border-t border-gray-200 dark:border-zinc-700">
        {(["notes", "archive", "trash"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              view === v
                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700/50"
            }`}
          >
            {VIEW_LABELS[v]}
            {counts[v] > 0 && (
              <span className="ml-1 text-gray-400 dark:text-gray-500">
                {counts[v]}
              </span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
