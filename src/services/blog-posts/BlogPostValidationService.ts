import type {
  BlogCmsActor,
  BlogEditorDocument,
  BlogEditorMark,
  BlogEditorNode,
  BlogJsonObject,
  BlogJsonValue,
  BlogMediaAssetInput,
  BlogPostRevision,
  BlogPostRevisionInput,
  BlogRevisionMediaInput,
} from "@/contracts/blog-cms";
import { blogMediaRoles, blogMediaStorageKinds } from "@/contracts/blog-cms";
import { z } from "zod";
import { BlogCmsValidationError } from "./BlogCmsErrors";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const videoPattern = /^[A-Za-z0-9_-]{6,32}$/;
const checksumPattern = /^[0-9a-f]{64}$/;
const controlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const allowedNodes = new Set([
  "doc",
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
  "horizontalRule",
  "hardBreak",
  "image",
  "managedGallery",
  "text",
]);
const allowedMarks = new Set(["bold", "italic", "strike", "code", "link"]);
const maximumDocumentBytes = 250_000;
const maximumDocumentNodes = 5_000;

const jsonValueSchema: z.ZodType<BlogJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);
const editorMarkSchema = z
  .object({
    type: z.string().min(1).max(50),
    attrs: z.record(z.string(), jsonValueSchema).optional(),
  })
  .strict();
const editorNodeSchema: z.ZodType<BlogEditorNode> = z.lazy(() =>
  z
    .object({
      type: z.string().min(1).max(50),
      attrs: z.record(z.string(), jsonValueSchema).optional(),
      content: z.array(editorNodeSchema).optional(),
      marks: z.array(editorMarkSchema).optional(),
      text: z.string().optional(),
    })
    .strict(),
);
const editorDocumentSchema = z
  .object({
    schemaVersion: z.literal(1),
    doc: editorNodeSchema,
  })
  .strict();

function invalid(message: string): never {
  throw new BlogCmsValidationError(message);
}

function textValue(
  value: unknown,
  field: string,
  maximum: number,
  options: Readonly<{ required?: boolean; multiline?: boolean }> = {},
) {
  if (typeof value !== "string") invalid(`${field} must be text.`);
  const normalized = value.trim();
  if (options.required && !normalized) invalid(`${field} is required.`);
  if (normalized.length > maximum) invalid(`${field} is too long.`);
  if (controlCharacters.test(normalized) || (!options.multiline && /[\r\n]/.test(normalized))) {
    invalid(`${field} contains unsupported characters.`);
  }
  return normalized;
}

function nullableText(value: unknown, field: string, maximum: number) {
  if (value === null || value === undefined || value === "") return null;
  return textValue(value, field, maximum);
}

export function normalizeBlogCmsActor(actor: BlogCmsActor) {
  return { id: textValue(actor.id, "actor id", 200, { required: true }) };
}

export function normalizeBlogSlug(slug: string) {
  const normalized = textValue(slug, "slug", 160, { required: true }).toLowerCase();
  if (!slugPattern.test(normalized)) {
    invalid("Slug must contain lowercase letters, numbers, and single hyphens only.");
  }
  return normalized;
}

export function validateBlogUuid(value: string, field: string) {
  if (!uuidPattern.test(value)) invalid(`${field} is invalid.`);
  return value;
}

function objectValue(value: BlogJsonValue | undefined, field: string): BlogJsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    invalid(`${field} is invalid.`);
  }
  return value as BlogJsonObject;
}

function positiveInteger(value: BlogJsonValue | undefined, field: string, maximum = 20_000) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0 || value > maximum) {
    invalid(`${field} is invalid.`);
  }
  return value;
}

function safeImageSource(value: BlogJsonValue | undefined) {
  if (typeof value !== "string" || !/^\/(?!\/)/.test(value) || value.length > 2_048) {
    invalid("Editor images must use a managed local URL.");
  }
  return value;
}

function assertOnlyKeys(
  value: BlogJsonObject,
  allowedKeys: ReadonlySet<string>,
  field: string,
) {
  const unsupported = Object.keys(value).find((key) => !allowedKeys.has(key));
  if (unsupported) invalid(`${field} contains unsupported attributes.`);
}

const imageAttributeKeys = new Set([
  "assetId",
  "src",
  "alt",
  "decorative",
  "caption",
  "width",
  "height",
  "title",
]);
const galleryImageAttributeKeys = new Set([
  "assetId",
  "src",
  "alt",
  "decorative",
  "caption",
  "width",
  "height",
]);

function validateImageAttributes(
  attributes: BlogJsonObject,
  bodyMediaIds: ReadonlySet<string>,
  field: string,
  allowedKeys: ReadonlySet<string> = imageAttributeKeys,
) {
  assertOnlyKeys(attributes, allowedKeys, field);
  const assetId = attributes.assetId;
  if (typeof assetId !== "string" || !uuidPattern.test(assetId) || !bodyMediaIds.has(assetId)) {
    invalid(`${field} references media that is not attached to the revision.`);
  }
  safeImageSource(attributes.src);
  const decorative = attributes.decorative === true;
  const alt = typeof attributes.alt === "string" ? attributes.alt.trim() : "";
  if (!decorative && !alt) invalid(`${field} requires alternative text.`);
  if (alt.length > 300) invalid(`${field} alternative text is too long.`);
  if (attributes.caption !== null && attributes.caption !== undefined) {
    textValue(attributes.caption, `${field} caption`, 500, { multiline: true });
  }
  if (attributes.title !== null && attributes.title !== undefined) {
    textValue(attributes.title, `${field} title`, 500, { multiline: true });
  }
  positiveInteger(attributes.width, `${field} width`);
  positiveInteger(attributes.height, `${field} height`);
}

function validateLinkMark(mark: BlogEditorMark) {
  const attributes = mark.attrs ?? {};
  assertOnlyKeys(
    attributes,
    new Set(["href", "target", "rel", "class", "title"]),
    "Content link",
  );
  const href = attributes.href;
  if (typeof href !== "string" || href.length > 2_048) invalid("A content link is invalid.");
  if (!/^\/(?!\/)/.test(href)) {
    try {
      const url = new URL(href);
      if ((url.protocol !== "http:" && url.protocol !== "https:") || url.username || url.password) {
        throw new Error();
      }
    } catch {
      invalid("Content links must use a relative path, HTTP URL, or HTTPS URL.");
    }
  }

  if (attributes.target !== undefined && attributes.target !== null && attributes.target !== "_blank") {
    invalid("Content link target is invalid.");
  }
  if (attributes.class !== undefined && attributes.class !== null) {
    invalid("Content links cannot define CSS classes.");
  }
  if (attributes.title !== undefined && attributes.title !== null) {
    textValue(attributes.title, "content link title", 500, { multiline: true });
  }
  if (attributes.rel !== undefined && attributes.rel !== null) {
    if (typeof attributes.rel !== "string") invalid("Content link relationship is invalid.");
    const relationships = new Set(attributes.rel.trim().split(/\s+/u).filter(Boolean));
    if (
      !relationships.has("noopener") ||
      [...relationships].some((value) => !["noopener", "noreferrer", "nofollow"].includes(value))
    ) {
      invalid("Content link relationship is invalid.");
    }
  }
}

function validateMarks(marks: readonly BlogEditorMark[] | undefined) {
  if (!marks) return;
  if (marks.length > 8) invalid("Content text has too many marks.");
  const seen = new Set<string>();
  for (const mark of marks) {
    if (!allowedMarks.has(mark.type)) invalid(`Unsupported content mark: ${mark.type}.`);
    if (seen.has(mark.type)) invalid(`Content text contains duplicate ${mark.type} marks.`);
    seen.add(mark.type);
    if (mark.type === "link") {
      validateLinkMark(mark);
    } else if (mark.attrs && Object.keys(mark.attrs).length > 0) {
      invalid(`${mark.type} marks cannot contain attributes.`);
    }
  }
}

const blockNodeTypes = new Set([
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "blockquote",
  "codeBlock",
  "horizontalRule",
  "image",
  "managedGallery",
]);

function validateChildPlacement(parentType: string | null, node: BlogEditorNode, index: number) {
  if (parentType === null) {
    if (node.type !== "doc") invalid("Content must have one document root.");
    return;
  }
  if (node.type === "doc") invalid("A document root cannot be nested.");

  if (parentType === "doc" || parentType === "blockquote") {
    if (!blockNodeTypes.has(node.type)) invalid(`${node.type} is not valid block content.`);
    return;
  }
  if (parentType === "paragraph" || parentType === "heading") {
    if (node.type !== "text" && node.type !== "hardBreak") {
      invalid(`${parentType} contains unsupported inline content.`);
    }
    return;
  }
  if (parentType === "bulletList" || parentType === "orderedList") {
    if (node.type !== "listItem") invalid("Lists can contain list items only.");
    return;
  }
  if (parentType === "listItem") {
    if (index === 0 && node.type !== "paragraph") {
      invalid("A list item must begin with a paragraph.");
    }
    if (!blockNodeTypes.has(node.type)) invalid("A list item contains unsupported content.");
    return;
  }
  if (parentType === "codeBlock") {
    if (node.type !== "text") invalid("Code blocks can contain text only.");
    return;
  }

  invalid(`${parentType} cannot contain child content.`);
}

function validateNodeAttributes(
  node: BlogEditorNode,
  bodyMediaIds: ReadonlySet<string>,
) {
  const attributes = node.attrs ?? {};

  if (node.type === "heading") {
    assertOnlyKeys(attributes, new Set(["level"]), "Heading");
    if (attributes.level !== 2 && attributes.level !== 3) {
      invalid("Content headings must use level 2 or 3.");
    }
    return;
  }
  if (node.type === "orderedList") {
    assertOnlyKeys(attributes, new Set(["start", "type"]), "Ordered list");
    if (attributes.start !== undefined) positiveInteger(attributes.start, "Ordered list start", 1_000_000);
    if (
      attributes.type !== undefined &&
      attributes.type !== null &&
      (typeof attributes.type !== "string" || !["1", "a", "A", "i", "I"].includes(attributes.type))
    ) {
      invalid("Ordered list type is invalid.");
    }
    return;
  }
  if (node.type === "codeBlock") {
    assertOnlyKeys(attributes, new Set(["language"]), "Code block");
    if (
      attributes.language !== undefined &&
      attributes.language !== null &&
      (typeof attributes.language !== "string" || !/^[A-Za-z0-9_+#.-]{1,50}$/.test(attributes.language))
    ) {
      invalid("Code block language is invalid.");
    }
    return;
  }
  if (node.type === "image") {
    validateImageAttributes(attributes, bodyMediaIds, "Image");
    return;
  }
  if (node.type === "managedGallery") {
    assertOnlyKeys(attributes, new Set(["items"]), "Managed gallery");
    const items = attributes.items;
    if (!Array.isArray(items) || items.length < 2 || items.length > 12) {
      invalid("A managed gallery must contain between 2 and 12 images.");
    }
    for (const [index, item] of items.entries()) {
      validateImageAttributes(
        objectValue(item, `Gallery image ${index + 1}`),
        bodyMediaIds,
        `Gallery image ${index + 1}`,
        galleryImageAttributeKeys,
      );
    }
    return;
  }

  assertOnlyKeys(attributes, new Set(), node.type);
}

function validateEditorNode(
  node: BlogEditorNode,
  bodyMediaIds: ReadonlySet<string>,
  state: { count: number },
  depth: number,
  parentType: string | null = null,
  childIndex = 0,
) {
  state.count += 1;
  if (state.count > maximumDocumentNodes || depth > 30) invalid("Content is too complex.");
  if (!allowedNodes.has(node.type)) invalid(`Unsupported content node: ${node.type}.`);
  validateChildPlacement(parentType, node, childIndex);

  if (node.type === "text") {
    validateMarks(node.marks);
    if (parentType === "codeBlock" && node.marks?.length) {
      invalid("Code block text cannot contain marks.");
    }
  } else if (node.marks?.length) {
    invalid(`${node.type} cannot contain text marks.`);
  }

  if (node.type === "text") {
    if (typeof node.text !== "string" || node.text.length > 20_000) {
      invalid("A content text node is invalid.");
    }
  } else if (node.text !== undefined) {
    invalid(`${node.type} cannot contain direct text.`);
  }

  validateNodeAttributes(node, bodyMediaIds);
  const children = node.content ?? [];
  if ((node.type === "bulletList" || node.type === "orderedList" || node.type === "listItem" || node.type === "blockquote") && children.length === 0) {
    invalid(`${node.type} requires child content.`);
  }

  for (const [index, child] of children.entries()) {
    validateEditorNode(child, bodyMediaIds, state, depth + 1, node.type, index);
  }
}

function normalizeRevisionMedia(media: readonly BlogRevisionMediaInput[]) {
  if (media.length > 100) invalid("A revision has too many media references.");
  const keys = new Set<string>();

  return media.map((reference) => {
    validateBlogUuid(reference.mediaId, "media id");
    if (!blogMediaRoles.includes(reference.role)) invalid("Media role is invalid.");
    if (!Number.isSafeInteger(reference.position) || reference.position < 0 || reference.position > 32_767) {
      invalid("Media position is invalid.");
    }
    const key = `${reference.role}:${reference.position}`;
    if (keys.has(key)) invalid("Media role positions must be unique within a revision.");
    keys.add(key);

    const altText = textValue(reference.altText, "media alternative text", 300, {
      multiline: true,
    });
    if (reference.decorative !== true && reference.decorative !== false) {
      invalid("Media decorative state is required.");
    }
    if (!reference.decorative && !altText) {
      invalid("Non-decorative media requires alternative text.");
    }

    return {
      mediaId: reference.mediaId,
      role: reference.role,
      position: reference.position,
      altText,
      decorative: reference.decorative,
      caption: nullableText(reference.caption, "media caption", 500),
    } satisfies BlogRevisionMediaInput;
  });
}

function validateEditorDocument(
  document: BlogEditorDocument,
  media: readonly BlogRevisionMediaInput[],
) {
  let serialized: string;
  try {
    serialized = JSON.stringify(document);
  } catch {
    invalid("Content document schema is invalid.");
  }
  if (!serialized || serialized.length > maximumDocumentBytes) {
    invalid("Content document is too large.");
  }
  const parsed = editorDocumentSchema.safeParse(document);
  if (!parsed.success || parsed.data.doc.type !== "doc") {
    invalid("Content document schema is invalid.");
  }
  const bodyMediaIds = new Set(
    media.filter((reference) => reference.role === "body").map((reference) => reference.mediaId),
  );
  validateEditorNode(parsed.data.doc, bodyMediaIds, { count: 0 }, 0);
  return parsed.data as BlogEditorDocument;
}

function documentWordCount(document: BlogEditorDocument) {
  let text = "";
  const visit = (node: BlogEditorNode) => {
    if (node.type === "text" && node.text) text += ` ${node.text}`;
    for (const child of node.content ?? []) visit(child);
  };
  visit(document.doc);
  return text.trim() ? text.trim().split(/\s+/u).length : 0;
}

export function normalizeBlogRevision(input: BlogPostRevisionInput): BlogPostRevisionInput {
  const media = normalizeRevisionMedia(input.media);
  const content = validateEditorDocument(input.content, media);
  const tags = [...new Set(input.tags.map((tag) => textValue(tag, "tag", 80, { required: true })))]
    .slice(0, 30);
  const wordCount = documentWordCount(content);

  return {
    title: textValue(input.title, "title", 200, { required: true }),
    excerpt: textValue(input.excerpt, "excerpt", 500, { multiline: true }),
    category: textValue(input.category, "category", 100),
    content,
    tags,
    author: textValue(input.author, "author", 100),
    authorRole: textValue(input.authorRole, "author role", 100),
    authorBio: textValue(input.authorBio, "author biography", 1_000, { multiline: true }),
    videoId:
      input.videoId && videoPattern.test(input.videoId)
        ? input.videoId
        : input.videoId
          ? invalid("Video id is invalid.")
          : null,
    seoTitle: nullableText(input.seoTitle, "SEO title", 200),
    seoDescription: nullableText(input.seoDescription, "SEO description", 320),
    readTimeMinutes: Math.max(1, Math.min(240, Math.ceil(wordCount / 220))),
    media,
  };
}

export function assertBlogRevisionPublishable(
  revision: BlogPostRevisionInput | BlogPostRevision,
) {
  if (!revision.excerpt || !revision.category || !revision.author || !revision.authorRole) {
    invalid("Published posts require excerpt, category, author, and author role.");
  }
  if (documentWordCount(revision.content) === 0) {
    invalid("Published posts require meaningful article content.");
  }
  const covers = revision.media.filter((reference) => reference.role === "cover");
  if (covers.length !== 1) invalid("Published posts require exactly one cover image.");
}

export function normalizeBlogMediaAssetInput(
  input: BlogMediaAssetInput,
): BlogMediaAssetInput {
  if (input.id) validateBlogUuid(input.id, "media id");
  if (!blogMediaStorageKinds.includes(input.storageKind)) invalid("Media storage kind is invalid.");
  const storageKey = textValue(input.storageKey, "storage key", 500, { required: true });
  if (storageKey.startsWith("/") || storageKey.includes("..") || /\\/.test(storageKey)) {
    invalid("Media storage key is invalid.");
  }
  const publicUrl = textValue(input.publicUrl, "public URL", 2_048, { required: true });
  if (!/^\/(?!\/)/.test(publicUrl) && !/^https:\/\//.test(publicUrl)) {
    invalid("Media public URL must use a local path or HTTPS CDN URL.");
  }
  const originalFilename = textValue(input.originalFilename, "original filename", 255, {
    required: true,
  });
  const mimeType = textValue(input.mimeType, "MIME type", 100, { required: true }).toLowerCase();
  if (!/^image\/[a-z0-9.+-]+$/.test(mimeType)) invalid("Only image media is supported.");
  const width = input.width ?? null;
  const height = input.height ?? null;
  if ((width === null) !== (height === null)) invalid("Media width and height must be provided together.");
  if (width !== null && (!Number.isSafeInteger(width) || width <= 0 || width > 20_000)) {
    invalid("Media width is invalid.");
  }
  if (height !== null && (!Number.isSafeInteger(height) || height <= 0 || height > 20_000)) {
    invalid("Media height is invalid.");
  }
  const byteSize = input.byteSize ?? null;
  if (byteSize !== null && (!Number.isSafeInteger(byteSize) || byteSize <= 0)) {
    invalid("Media byte size is invalid.");
  }
  const checksumSha256 = input.checksumSha256?.toLowerCase() ?? null;
  if (checksumSha256 !== null && !checksumPattern.test(checksumSha256)) {
    invalid("Media checksum is invalid.");
  }

  return {
    ...input,
    storageKey,
    publicUrl,
    originalFilename,
    mimeType,
    width,
    height,
    byteSize,
    checksumSha256,
  };
}

export function normalizePublicationDate(value: string | undefined, now = new Date()) {
  if (!value) return now.toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) invalid("Publication date is invalid.");
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    invalid("Publication date is invalid.");
  }
  return value;
}
