// Copies text, falling back to a hidden text box for older browsers or when the page isn't focused
// (navigator.clipboard then refuses). Rejects if both fail.
export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Fall through to the hidden text box.
  }
  const box = document.createElement("textarea");
  box.value = text;
  box.style.position = "fixed";
  box.style.opacity = "0";
  document.body.appendChild(box);
  box.select();
  const ok = document.execCommand("copy");
  box.remove();
  if (!ok) throw new Error("Copy failed");
}
