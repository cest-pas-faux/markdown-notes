export type SortOrder =
  | "created-desc"
  | "created-asc"
  | "modified-desc"
  | "modified-asc";

export interface Doc {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  pinnedAt: number | null;
  archivedAt: number | null;
  trashedAt: number | null;
}

export interface Settings {
  autoCleanupDays: number;
}

export type View = "notes" | "archive" | "trash";
