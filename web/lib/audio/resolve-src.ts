/** Turn manifest paths like `/audio/foo.mp3` into a browser-ready URL. */
export function resolveAudioSrc(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (typeof window === "undefined") return trimmed;
  if (trimmed.startsWith("/")) {
    return new URL(trimmed, window.location.origin).href;
  }
  return new URL(trimmed, window.location.href).href;
}
