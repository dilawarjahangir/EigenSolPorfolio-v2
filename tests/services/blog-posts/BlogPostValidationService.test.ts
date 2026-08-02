// @vitest-environment node

import { getSchema } from "@tiptap/core";
import { describe, expect, it } from "vitest";
import type { BlogPostRevisionInput } from "@/contracts/blog-cms";
import { blogContentExtensions } from "@/lib/blog-content-extensions";
import {
  assertBlogRevisionPublishable,
  normalizeBlogRevision,
} from "@/services/blog-posts/BlogPostValidationService";

const mediaId = "00000000-0000-4000-8000-000000000001";

function revisionWithContent(
  content: BlogPostRevisionInput["content"]["doc"]["content"],
): BlogPostRevisionInput {
  return {
    title: "A useful engineering article",
    excerpt: "A concise article summary.",
    category: "Engineering",
    content: { schemaVersion: 1, doc: { type: "doc", content } },
    tags: ["Engineering"],
    author: "EigenSol Engineering",
    authorRole: "Engineering Team",
    authorBio: "EigenSol engineering team.",
    media: [
      {
        mediaId,
        role: "body",
        position: 0,
        altText: "Architecture diagram",
        decorative: false,
      },
    ],
  };
}

describe("blog editor document validation", () => {
  it("accepts a managed gallery whose assets are attached as body media", () => {
    const revision = revisionWithContent([
      {
        type: "managedGallery",
        attrs: {
          items: [
            {
              assetId: mediaId,
              src: "/media/first.webp",
              alt: "First architecture view",
              decorative: false,
              caption: null,
              width: 1200,
              height: 800,
            },
            {
              assetId: mediaId,
              src: "/media/second.webp",
              alt: "Second architecture view",
              decorative: false,
              caption: "A detail view",
              width: 1200,
              height: 800,
            },
          ],
        },
      },
    ]);

    expect(normalizeBlogRevision(revision).content).toEqual(revision.content);
  });

  it("rejects mail links and body images that are not attached to the revision", () => {
    const mailLink = revisionWithContent([
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Contact us",
            marks: [{ type: "link", attrs: { href: "mailto:hello@example.com" } }],
          },
        ],
      },
    ]);
    expect(() => normalizeBlogRevision(mailLink)).toThrow(
      "Content links must use a relative path, HTTP URL, or HTTPS URL.",
    );

    const unattachedImage = revisionWithContent([
      {
        type: "image",
        attrs: {
          assetId: "00000000-0000-4000-8000-000000000002",
          src: "/media/unattached.webp",
          alt: "Unattached image",
          decorative: false,
          caption: null,
          width: 1200,
          height: 800,
        },
      },
    ]);
    expect(() => normalizeBlogRevision(unattachedImage)).toThrow(
      "references media that is not attached",
    );
  });

  it("requires explicit accessible alternatives for revision media", () => {
    const revision = revisionWithContent([{ type: "paragraph" }]);
    const invalid = {
      ...revision,
      media: [{ ...revision.media[0], altText: "", decorative: false }],
    };

    expect(() => normalizeBlogRevision(invalid)).toThrow(
      "Non-decorative media requires alternative text.",
    );
  });

  it("does not publish an editor document that has structure but no meaningful text", () => {
    const revision = revisionWithContent([{ type: "paragraph" }]);

    expect(() => assertBlogRevisionPublishable(revision)).toThrow(
      "Published posts require meaningful article content.",
    );
  });

  it("rejects structurally invalid arbitrary JSON before semantic traversal", () => {
    const revision = revisionWithContent([{ type: "paragraph" }]);
    const invalid = {
      ...revision,
      content: {
        schemaVersion: 1,
        doc: { type: "doc", unexpected: "field" },
      },
    } as unknown as BlogPostRevisionInput;

    expect(() => normalizeBlogRevision(invalid)).toThrow(
      "Content document schema is invalid.",
    );
  });

  it("rejects unsupported node attributes and invalid parent-child combinations", () => {
    const unknownAttributes = revisionWithContent([
      {
        type: "paragraph",
        attrs: { className: "untrusted" },
        content: [{ type: "text", text: "Paragraph" }],
      },
    ]);
    expect(() => normalizeBlogRevision(unknownAttributes)).toThrow(
      "paragraph contains unsupported attributes.",
    );

    const invalidChildren = revisionWithContent([
      {
        type: "bulletList",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Invalid" }] }],
      },
    ]);
    expect(() => normalizeBlogRevision(invalidChildren)).toThrow(
      "Lists can contain list items only.",
    );
  });

  it("accepts canonical JSON emitted by the configured Tiptap schema", () => {
    const tiptapDocument = getSchema(blogContentExtensions)
      .nodeFromJSON({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Architecture" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Read the guide",
                marks: [
                  {
                    type: "link",
                    attrs: {
                      href: "/services",
                      target: "_blank",
                      rel: "noopener noreferrer",
                      class: null,
                      title: null,
                    },
                  },
                ],
              },
            ],
          },
          {
            type: "orderedList",
            attrs: { start: 1, type: null },
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "First step" }],
                  },
                ],
              },
            ],
          },
        ],
      })
      .toJSON();
    const revision = revisionWithContent(tiptapDocument.content);

    expect(normalizeBlogRevision(revision).content.doc).toEqual(tiptapDocument);
  });
});
