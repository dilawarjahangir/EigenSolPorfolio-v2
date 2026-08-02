import { Node } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import { isAllowedBlogEditorLink } from "@/lib/blog-editor-utils";

export const ManagedBlogImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      assetId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-asset-id"),
        renderHTML: (attributes) =>
          typeof attributes.assetId === "string" && attributes.assetId
            ? { "data-asset-id": attributes.assetId }
            : {},
      },
      decorative: {
        default: false,
        parseHTML: (element) => element.getAttribute("data-decorative") === "true",
        renderHTML: (attributes) =>
          attributes.decorative === true ? { "data-decorative": "true" } : {},
      },
      caption: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-caption"),
        renderHTML: (attributes) =>
          typeof attributes.caption === "string" && attributes.caption
            ? { "data-caption": attributes.caption }
            : {},
      },
      width: {
        default: null,
        parseHTML: (element) => Number(element.getAttribute("width")) || null,
        renderHTML: (attributes) =>
          typeof attributes.width === "number" && attributes.width > 0
            ? { width: attributes.width }
            : {},
      },
      height: {
        default: null,
        parseHTML: (element) => Number(element.getAttribute("height")) || null,
        renderHTML: (attributes) =>
          typeof attributes.height === "number" && attributes.height > 0
            ? { height: attributes.height }
            : {},
      },
    };
  },
});

export const ManagedBlogGallery = Node.create({
  name: "managedGallery",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      items: {
        default: [],
        parseHTML: (element) => {
          const serialized = element.getAttribute("data-items");
          if (!serialized) return [];

          try {
            const value: unknown = JSON.parse(serialized);
            return Array.isArray(value) ? value : [];
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({
          "data-items": JSON.stringify(Array.isArray(attributes.items) ? attributes.items : []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-managed-gallery]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const count = Array.isArray(node.attrs.items) ? node.attrs.items.length : 0;
    return [
      "div",
      { ...HTMLAttributes, "data-managed-gallery": "true" },
      `${count} image gallery`,
    ];
  },
});

export const blogContentExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: false,
  }),
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: "https",
    isAllowedUri: (url) => isAllowedBlogEditorLink(url),
    shouldAutoLink: (url) => isAllowedBlogEditorLink(url),
    HTMLAttributes: {
      rel: "noopener noreferrer",
    },
  }),
  ManagedBlogImage.configure({
    allowBase64: false,
    inline: false,
    HTMLAttributes: {
      loading: "lazy",
      decoding: "async",
    },
  }),
  ManagedBlogGallery,
];
