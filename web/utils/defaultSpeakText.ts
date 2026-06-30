export function defaultSpeakText(de: string): string {
  return de
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}
