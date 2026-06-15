/** German phrase for head TTS: lemmas without IPA; pairs and phrases kept. */
export function speakTextForHead(head: string): string {
  const h = head.trim();
  if (!h) return "";

  const chunks: string[] = [];
  for (const part of h.split(" /")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (segmentIsIpa(trimmed)) break;
    chunks.push(trimmed);
  }

  if (chunks.length === 0) {
    return h.split("/")[0]?.trim() ?? "";
  }

  const text = chunks.length > 1 ? chunks.join(", ") : chunks[0];
  return text.replace(/ · /g, ", ").trim();
}

function segmentIsIpa(part: string): boolean {
  const p = part.trim();
  if (!p) return true;
  if (p.startsWith("/") || p.startsWith("ˈ") || p.startsWith("ˌ")) return true;
  if (p.includes("|") && !/[a-zA-ZäöüÄÖÜß]{3}/.test(p.split("|", 1)[0] ?? "")) {
    return true;
  }
  const ipaMarkers = "/ˈˌ|̩ʊəɪʁɐ̯ːʃçɡnxz";
  let marked = 0;
  for (const c of p) {
    if (ipaMarkers.includes(c)) marked += 1;
  }
  if (p.length >= 4 && marked / p.length > 0.28) return true;
  return false;
}
