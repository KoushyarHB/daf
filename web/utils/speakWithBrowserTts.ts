export function speakWithBrowserTts(text: string): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  const voices = window.speechSynthesis.getVoices();
  const deVoice =
    voices.find((v) => v.lang.startsWith("de-DE")) ??
    voices.find((v) => v.lang.startsWith("de"));
  if (deVoice) utterance.voice = deVoice;
  window.speechSynthesis.speak(utterance);
}
