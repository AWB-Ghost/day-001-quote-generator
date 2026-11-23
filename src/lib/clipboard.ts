import type { Quote } from "@/data/quotes";

/** The text placed on the clipboard for a quote: “text” — Author, Source */
export function quoteToText(q: Quote) {
  return `“${q.text}” — ${q.author}${q.source ? `, ${q.source}` : ""}`;
}

/** Copies text, falling back to execCommand where the Clipboard API is blocked. */
export async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      el.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
