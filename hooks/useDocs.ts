"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Doc, Settings, SortOrder } from "@/types";

const STORAGE_KEY = "markdown-notes-data";
const SETTINGS_KEY = "markdown-notes-settings";
const SORT_KEY = "markdown-notes-sort";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadDocs(): Doc[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDocs(docs: Doc[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { autoCleanupDays: 30 };
  } catch {
    return { autoCleanupDays: 30 };
  }
}

function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function loadSort(): SortOrder {
  try {
    const raw = localStorage.getItem(SORT_KEY);
    return (raw as SortOrder) || "modified-desc";
  } catch {
    return "modified-desc";
  }
}

export function useDocs() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [settings, setSettings] = useState<Settings>({ autoCleanupDays: 30 });
  const [sortOrder, setSortOrderState] = useState<SortOrder>("modified-desc");
  const [hydrated, setHydrated] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDocs(loadDocs());
    setSettings(loadSettings());
    setSortOrderState(loadSort());
    setHydrated(true);
  }, []);

  const runExpirationCheck = useCallback((current: Doc[], s: Settings): Doc[] => {
    const now = Date.now();
    const threshold = s.autoCleanupDays * 24 * 60 * 60 * 1000;
    return current.filter((d) => !(d.trashedAt && now - d.trashedAt > threshold));
  }, []);

  const applyExpirationCheck = useCallback(() => {
    setDocs((prev) => {
      const updated = runExpirationCheck(prev, settings);
      if (updated.length !== prev.length) {
        saveDocs(updated);
        return updated;
      }
      return prev;
    });
  }, [settings, runExpirationCheck]);

  useEffect(() => {
    if (!hydrated) return;
    applyExpirationCheck();
    intervalRef.current = setInterval(applyExpirationCheck, 60_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [hydrated, applyExpirationCheck]);

  const updateDocs = useCallback((updater: (prev: Doc[]) => Doc[]) => {
    setDocs((prev) => {
      const next = updater(prev);
      saveDocs(next);
      return next;
    });
  }, []);

  const createDoc = useCallback(() => {
    const now = Date.now();
    const doc: Doc = {
      id: generateId(),
      content: "",
      createdAt: now,
      updatedAt: now,
      pinnedAt: null,
      archivedAt: null,
      trashedAt: null,
    };
    updateDocs((prev) => [doc, ...prev]);
    return doc.id;
  }, [updateDocs]);

  const updateDoc = useCallback((id: string, content: string) => {
    updateDocs((prev) =>
      prev.map((d) => d.id === id ? { ...d, content, updatedAt: Date.now() } : d)
    );
  }, [updateDocs]);

  const togglePin = useCallback((id: string) => {
    updateDocs((prev) =>
      prev.map((d) => d.id === id ? { ...d, pinnedAt: d.pinnedAt ? null : Date.now() } : d)
    );
  }, [updateDocs]);

  const archiveDoc = useCallback((id: string) => {
    updateDocs((prev) =>
      prev.map((d) => d.id === id ? { ...d, archivedAt: Date.now(), pinnedAt: null } : d)
    );
  }, [updateDocs]);

  const unarchiveDoc = useCallback((id: string) => {
    updateDocs((prev) =>
      prev.map((d) => d.id === id ? { ...d, archivedAt: null } : d)
    );
  }, [updateDocs]);

  const trashDoc = useCallback((id: string) => {
    updateDocs((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, trashedAt: Date.now(), pinnedAt: null, archivedAt: null } : d
      )
    );
  }, [updateDocs]);

  const restoreDoc = useCallback((id: string) => {
    updateDocs((prev) =>
      prev.map((d) => d.id === id ? { ...d, trashedAt: null } : d)
    );
  }, [updateDocs]);

  const hardDeleteDoc = useCallback((id: string) => {
    updateDocs((prev) => prev.filter((d) => d.id !== id));
  }, [updateDocs]);

  const emptyTrash = useCallback(() => {
    updateDocs((prev) => prev.filter((d) => !d.trashedAt));
  }, [updateDocs]);

  const setSortOrder = useCallback((order: SortOrder) => {
    setSortOrderState(order);
    localStorage.setItem(SORT_KEY, order);
  }, []);

  const updateSettings = useCallback((changes: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...changes };
      saveSettings(next);
      return next;
    });
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob(
      [JSON.stringify({ docs, exportedAt: new Date().toISOString() }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `markdown-notes-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [docs]);

  const importData = useCallback((json: string) => {
    try {
      const data = JSON.parse(json);
      const imported: Doc[] = Array.isArray(data) ? data : (data.docs ?? []);
      if (!Array.isArray(imported)) throw new Error();
      updateDocs(() => imported);
      return true;
    } catch {
      return false;
    }
  }, [updateDocs]);

  return {
    docs,
    activeDocs: docs.filter((d) => !d.archivedAt && !d.trashedAt),
    archivedDocs: docs.filter((d) => d.archivedAt && !d.trashedAt),
    trashedDocs: docs.filter((d) => !!d.trashedAt),
    settings,
    sortOrder,
    hydrated,
    createDoc,
    updateDoc,
    togglePin,
    archiveDoc,
    unarchiveDoc,
    trashDoc,
    restoreDoc,
    hardDeleteDoc,
    emptyTrash,
    setSortOrder,
    updateSettings,
    exportData,
    importData,
  };
}
