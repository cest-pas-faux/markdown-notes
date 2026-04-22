export function extractTitle(content: string): string {
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)$/);
    if (match) return match[1].trim();
  }
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) return trimmed.slice(0, 60);
  }
  return "Untitled";
}

export function extractPreview(content: string): string {
  const lines = content.split("\n");
  let pastTitle = false;
  for (const line of lines) {
    if (!pastTitle && line.match(/^#\s+/)) {
      pastTitle = true;
      continue;
    }
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      return trimmed.replace(/[*_`~[\]()!]/g, "").slice(0, 120);
    }
  }
  return "";
}
