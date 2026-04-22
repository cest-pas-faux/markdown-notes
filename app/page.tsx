"use client";

import { useState, useEffect } from "react";
import type { View, SortOrder } from "@/types";
import { useDocs } from "@/hooks/useDocs";
import { useDarkMode } from "@/hooks/useDarkMode";
import { sortDocs } from "@/lib/sort";
import { extractTitle } from "@/lib/extractTitle";
import { Toolbar } from "@/components/Toolbar";
import { Sidebar } from "@/components/Sidebar";
import { Editor } from "@/components/Editor";
import { Preview } from "@/components/Preview";

type EditorMode = "edit" | "preview";

export default function Home() {
  const {
    activeDocs, archivedDocs, trashedDocs,
    sortOrder, hydrated,
    createDoc, updateDoc, togglePin,
    archiveDoc, unarchiveDoc, trashDoc,
    restoreDoc, hardDeleteDoc, emptyTrash,
    setSortOrder, updateSettings, settings,
    exportData, importData,
  } = useDocs();

  const { dark, toggle: toggleDark } = useDarkMode();

  const [view, setView] = useState<View>("notes");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<EditorMode>("edit");
  const [search, setSearch] = useState("");

  // Deselect if the selected doc is no longer in the current view
  useEffect(() => {
    if (!selectedId) return;
    const allVisible = [...activeDocs, ...archivedDocs, ...trashedDocs];
    if (!allVisible.find((d) => d.id === selectedId)) {
      setSelectedId(null);
    }
  }, [selectedId, activeDocs, archivedDocs, trashedDocs]);

  // Switch view if selected doc moves to a different bucket
  useEffect(() => {
    if (!selectedId) return;
    if (view === "notes"   && !activeDocs.find((d)   => d.id === selectedId)) return;
    if (view === "archive" && !archivedDocs.find((d) => d.id === selectedId)) return;
    if (view === "trash"   && !trashedDocs.find((d)  => d.id === selectedId)) return;
  }, [selectedId, view, activeDocs, archivedDocs, trashedDocs]);

  function handleNewDoc() {
    const id = createDoc();
    setSelectedId(id);
    setView("notes");
    setMode("edit");
  }

  function handleSelect(id: string) {
    setSelectedId(id);
    if (view === "trash") setMode("preview");
  }

  function handleViewChange(v: View) {
    setView(v);
    setSelectedId(null);
    setSearch("");
  }

  function handleImport(json: string) {
    const ok = importData(json);
    if (!ok) alert("Failed to import: invalid JSON format.");
  }

  const docsByView =
    view === "notes" ? activeDocs : view === "archive" ? archivedDocs : trashedDocs;

  const selectedDoc =
    selectedId ? [...activeDocs, ...archivedDocs, ...trashedDocs].find((d) => d.id === selectedId) ?? null : null;

  const isReadOnly = view === "trash";
  const effectiveMode: EditorMode = isReadOnly ? "preview" : mode;

  if (!hydrated) {
    return <div className="h-full bg-white dark:bg-zinc-900" />;
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      <Toolbar
        dark={dark}
        onToggleDark={toggleDark}
        onExport={exportData}
        onImport={handleImport}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeDocs={activeDocs}
          archivedDocs={archivedDocs}
          trashedDocs={trashedDocs}
          sortOrder={sortOrder}
          view={view}
          selectedId={selectedId}
          search={search}
          onSearch={setSearch}
          onSortChange={setSortOrder}
          onViewChange={handleViewChange}
          onSelect={handleSelect}
          onNewDoc={handleNewDoc}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedDoc ? (
            <>
              {/* Doc action bar */}
              <div className="flex items-center justify-between px-4 h-11 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-xs">
                  {extractTitle(selectedDoc.content) || "Untitled"}
                </span>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Edit / Preview toggle (hidden for trash) */}
                  {!isReadOnly && (
                    <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-zinc-600 mr-2">
                      {(["edit", "preview"] as EditorMode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMode(m)}
                          className={`px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                            effectiveMode === m
                              ? "bg-indigo-600 text-white"
                              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions depend on the current view */}
                  {view === "notes" && (
                    <>
                      <ActionButton
                        title={selectedDoc.pinnedAt ? "Unpin" : "Pin"}
                        active={!!selectedDoc.pinnedAt}
                        onClick={() => togglePin(selectedDoc.id)}
                        icon={
                          <path fillRule="evenodd" d="M8 1a.75.75 0 0 1 .75.75V6h1.5a.75.75 0 0 1 0 1.5h-.75v1.628a2.251 2.251 0 0 1 1.042 3.737L9.25 14.19v.06a.75.75 0 0 1-1.5 0v-.06l-1.292-1.325A2.251 2.251 0 0 1 7.5 9.128V7.5h-.75a.75.75 0 0 1 0-1.5h1.5V1.75A.75.75 0 0 1 8 1Z" clipRule="evenodd" />
                        }
                      />
                      <ActionButton
                        title="Archive"
                        onClick={() => { archiveDoc(selectedDoc.id); setSelectedId(null); }}
                        icon={
                          <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2ZM2 7.5h12l-.799 5.603A1.5 1.5 0 0 1 11.713 14.5H4.287a1.5 1.5 0 0 1-1.489-1.397L2 7.5Zm5.25 1.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5Z" />
                        }
                      />
                      <ActionButton
                        title="Move to trash"
                        danger
                        onClick={() => { trashDoc(selectedDoc.id); setSelectedId(null); }}
                        icon={
                          <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Zm-1.5 6a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5Zm3.5 0a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5Z" clipRule="evenodd" />
                        }
                      />
                    </>
                  )}

                  {view === "archive" && (
                    <>
                      <ActionButton
                        title="Unarchive"
                        onClick={() => { unarchiveDoc(selectedDoc.id); setSelectedId(null); setView("notes"); }}
                        icon={
                          <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2ZM2 7.5h12l-.799 5.603A1.5 1.5 0 0 1 11.713 14.5H4.287a1.5 1.5 0 0 1-1.489-1.397L2 7.5Zm5.25 1.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5Z" />
                        }
                      />
                      <ActionButton
                        title="Move to trash"
                        danger
                        onClick={() => { trashDoc(selectedDoc.id); setSelectedId(null); }}
                        icon={
                          <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Zm-1.5 6a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5Zm3.5 0a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5Z" clipRule="evenodd" />
                        }
                      />
                    </>
                  )}

                  {view === "trash" && (
                    <>
                      <ActionButton
                        title="Restore"
                        onClick={() => { restoreDoc(selectedDoc.id); setSelectedId(null); setView("notes"); }}
                        icon={
                          <path fillRule="evenodd" d="M8 1a.75.75 0 0 1 .75.75v6.19l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 1.06-1.06l1.22 1.22V1.75A.75.75 0 0 1 8 1ZM2.5 12.5a.75.75 0 0 0-1.5 0v.5A2.5 2.5 0 0 0 3.5 15.5h9a2.5 2.5 0 0 0 2.5-2.5v-.5a.75.75 0 0 0-1.5 0v.5a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-.5Z" clipRule="evenodd" />
                        }
                      />
                      <ActionButton
                        title="Delete permanently"
                        danger
                        onClick={() => { hardDeleteDoc(selectedDoc.id); setSelectedId(null); }}
                        icon={
                          <path fillRule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5Zm-1.5 6a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5Zm3.5 0a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5Z" clipRule="evenodd" />
                        }
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Editor / Preview */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {effectiveMode === "edit" ? (
                  <Editor
                    content={selectedDoc.content}
                    onChange={(val) => updateDoc(selectedDoc.id, val)}
                  />
                ) : (
                  <Preview content={selectedDoc.content} />
                )}
              </div>
            </>
          ) : (
            <EmptyState view={view} onNewDoc={handleNewDoc} onEmptyTrash={emptyTrash} trashCount={trashedDocs.length} autoCleanupDays={settings.autoCleanupDays} onUpdateSettings={updateSettings} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ─── Small helpers ─────────────────────────────────────── */

function ActionButton({
  title, onClick, icon, active = false, danger = false,
}: {
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        danger
          ? "text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          : active
          ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
          : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        {icon}
      </svg>
    </button>
  );
}

function EmptyState({
  view, onNewDoc, onEmptyTrash, trashCount, autoCleanupDays, onUpdateSettings,
}: {
  view: View;
  onNewDoc: () => void;
  onEmptyTrash: () => void;
  trashCount: number;
  autoCleanupDays: number;
  onUpdateSettings: (c: { autoCleanupDays: number }) => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
      {view === "notes" && (
        <>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Select a document or create a new one</p>
          <button
            onClick={onNewDoc}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            New document
          </button>
        </>
      )}
      {view === "archive" && (
        <p className="text-gray-400 dark:text-gray-500 text-sm">Select a document from the archive</p>
      )}
      {view === "trash" && (
        <div className="space-y-4">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {trashCount > 0 ? "Select a document to restore or delete permanently" : "Trash is empty"}
          </p>
          {trashCount > 0 && (
            <button
              onClick={onEmptyTrash}
              className="px-3 py-1.5 rounded-md border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Empty trash
            </button>
          )}
          <div className="flex items-center gap-2 mt-4">
            <label className="text-xs text-gray-500 dark:text-gray-400">Auto-purge after</label>
            <input
              type="number"
              min={1}
              max={365}
              value={autoCleanupDays}
              onChange={(e) => onUpdateSettings({ autoCleanupDays: Math.max(1, Math.min(365, Number(e.target.value))) })}
              className="w-16 px-2 py-1 text-xs rounded-md border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <label className="text-xs text-gray-500 dark:text-gray-400">days</label>
          </div>
        </div>
      )}
    </div>
  );
}
