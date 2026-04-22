import type { Doc, SortOrder } from "@/types";

export function sortDocs(docs: Doc[], order: SortOrder): Doc[] {
  const pinned = docs.filter((d) => d.pinnedAt !== null);
  const unpinned = docs.filter((d) => d.pinnedAt === null);

  const cmp = (a: Doc, b: Doc): number => {
    switch (order) {
      case "created-desc":  return b.createdAt - a.createdAt;
      case "created-asc":   return a.createdAt - b.createdAt;
      case "modified-desc": return b.updatedAt - a.updatedAt;
      case "modified-asc":  return a.updatedAt - b.updatedAt;
    }
  };

  return [...pinned.sort(cmp), ...unpinned.sort(cmp)];
}
