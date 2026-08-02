import type { JSONContent } from "@tiptap/core";

function collectText(node: JSONContent): string[] {
  const text = typeof node.text === "string" ? [node.text] : [];
  for (const child of node.content ?? []) text.push(...collectText(child));
  return text;
}

export function countBlogEditorWords(document: JSONContent) {
  const text = collectText(document).join(" ").trim();
  return text ? text.split(/\s+/u).filter(Boolean).length : 0;
}

export function estimateBlogReadingMinutes(wordCount: number) {
  return Math.max(1, Math.ceil(Math.max(0, wordCount) / 220));
}

export function isAllowedBlogEditorLink(value: string) {
  const href = value.trim();
  if (/^\/(?!\/)/u.test(href)) return true;

  try {
    const url = new URL(href);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export type SeoLengthTone = "empty" | "short" | "good" | "long";

export function getSeoLengthTone(value: string, minimum: number, maximum: number): SeoLengthTone {
  const length = value.trim().length;
  if (!length) return "empty";
  if (length < minimum) return "short";
  if (length > maximum) return "long";
  return "good";
}
