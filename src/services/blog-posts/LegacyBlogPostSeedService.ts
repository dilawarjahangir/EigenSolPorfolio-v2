import "server-only";

import type { BlogCmsActor } from "@/contracts/blog-cms";
import { legacyBlogCmsSeed } from "@/data/legacy-blog-cms-seed";
import { seedLegacyBlogPostRecords } from "@/repositories/LegacyBlogPostSeedRepository";
import { normalizeBlogCmsActor } from "./BlogPostValidationService";

const legacySeedActor: BlogCmsActor = { id: "system:legacy-blog-seed" };

export function seedLegacyBlogPosts(actor: BlogCmsActor = legacySeedActor) {
  return seedLegacyBlogPostRecords(legacyBlogCmsSeed, normalizeBlogCmsActor(actor).id);
}
