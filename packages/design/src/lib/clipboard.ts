/**
 * Writes text to the clipboard and says whether it worked. The async
 * Clipboard API only exists in a secure context (https, localhost), so a page
 * served over plain http on a LAN, as the Storybook and the installer often
 * are, has no `navigator.clipboard` at all. There the legacy `execCommand`
 * path still copies in every current browser, through a hidden textarea that
 * is removed again before the caller sees the result. A caller that gets
 * `false` should fall back to selecting the text, so the person can copy it
 * by hand.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // A denied permission or an unfocused document: try the legacy path.
    }
  }
  if (typeof document === "undefined" || typeof document.execCommand !== "function") return false;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.setAttribute("aria-hidden", "true");
  area.tabIndex = -1;
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.opacity = "0";
  area.style.pointerEvents = "none";
  const active = document.activeElement;
  document.body.appendChild(area);
  area.select();
  let copied: boolean;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  area.remove();
  if (active instanceof HTMLElement) active.focus();
  return copied;
}

/** Selects an element's text, for the person to copy by hand when the clipboard is out of reach. */
export function selectText(el: Element | null): void {
  if (!el || typeof window === "undefined") return;
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  selection.removeAllRanges();
  selection.addRange(range);
}
