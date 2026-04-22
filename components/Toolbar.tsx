"use client";

import { useRef } from "react";

interface Props {
  dark: boolean;
  onToggleDark: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
}

export function Toolbar({ dark, onToggleDark, onExport, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === "string") onImport(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex-shrink-0">
      <span className="font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
        Markdown Notes
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={onExport}
          title="Export JSON"
          className="px-2.5 py-1.5 text-xs rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Export
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          title="Import JSON"
          className="px-2.5 py-1.5 text-xs rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Import
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />

        <div className="w-px h-4 bg-gray-200 dark:bg-zinc-700 mx-1" />

        <button
          onClick={onToggleDark}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {dark ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.78a1 1 0 010 1.42l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 9a1 1 0 110 2h-1a1 1 0 110-2h1zM5.636 14.364a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM3 10a1 1 0 110 2H2a1 1 0 110-2h1zm2.636-5.636a1 1 0 011.414 0l.707.707A1 1 0 016.343 6.485l-.707-.707a1 1 0 010-1.414zM10 6a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
