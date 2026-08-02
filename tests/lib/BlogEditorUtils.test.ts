import { describe, expect, it } from "vitest";
import {
  countBlogEditorWords,
  estimateBlogReadingMinutes,
  getSeoLengthTone,
  isAllowedBlogEditorLink,
} from "@/lib/blog-editor-utils";

describe("blog editor utilities", () => {
  it("counts nested editor text without counting managed media", () => {
    expect(countBlogEditorWords({
      type: "doc",
      content: [
        { type: "heading", content: [{ type: "text", text: "Reliable systems" }] },
        {
          type: "bulletList",
          content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Ship with confidence" }] }] },
          ],
        },
        { type: "managedGallery", attrs: { items: [{ assetId: "asset-1" }] } },
      ],
    })).toBe(5);
  });

  it("uses the same 220 words-per-minute reading estimate as publication", () => {
    expect(estimateBlogReadingMinutes(0)).toBe(1);
    expect(estimateBlogReadingMinutes(220)).toBe(1);
    expect(estimateBlogReadingMinutes(221)).toBe(2);
  });

  it("accepts only site-relative and credential-free HTTP(S) links", () => {
    expect(isAllowedBlogEditorLink("/services/cloud-engineering")).toBe(true);
    expect(isAllowedBlogEditorLink("https://example.com/article")).toBe(true);
    expect(isAllowedBlogEditorLink("//evil.example/path")).toBe(false);
    expect(isAllowedBlogEditorLink("javascript:alert(1)")).toBe(false);
    expect(isAllowedBlogEditorLink("https://user:secret@example.com")).toBe(false);
  });

  it("describes SEO field lengths without claiming a ranking score", () => {
    expect(getSeoLengthTone("", 35, 60)).toBe("empty");
    expect(getSeoLengthTone("Short", 35, 60)).toBe("short");
    expect(getSeoLengthTone("A".repeat(40), 35, 60)).toBe("good");
    expect(getSeoLengthTone("A".repeat(61), 35, 60)).toBe("long");
  });
});
