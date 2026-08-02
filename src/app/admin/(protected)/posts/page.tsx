import { FilePlus2, Pencil, Search } from "lucide-react";
import Link from "next/link";
import type { BlogPostStatus } from "@/contracts/blog-cms";
import { requireOwner } from "@/services/auth/AdminAuthService";
import {
  listAdminBlogPosts,
  listBlogCategories,
} from "@/services/blog-posts/BlogPostService";
import ui from "@/components/admin/AdminUi.module.css";

type PostsPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pageHref(
  page: number,
  filters: Readonly<{ search?: string; status?: string; category?: string }>,
) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/posts?${query}` : "/admin/posts";
}

const pakistanDate = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Karachi",
});

export default async function AdminPostsPage({ searchParams }: PostsPageProps) {
  await requireOwner();
  const params = await searchParams;
  const search = firstValue(params.search)?.trim() || undefined;
  const category = firstValue(params.category)?.trim() || undefined;
  const statusValue = firstValue(params.status);
  const status = ["draft", "published", "archived"].includes(statusValue ?? "")
    ? (statusValue as BlogPostStatus)
    : undefined;
  const requestedPage = Number(firstValue(params.page) ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [result, categories] = await Promise.all([
    listAdminBlogPosts({ search, status, category, page, pageSize: 20 }),
    listBlogCategories(),
  ]);
  const filters = { search, status, category };

  return (
    <div className={ui.page}>
      <header className={ui.pageHeader}>
        <div className={ui.pageHeaderCopy}>
          <p className={ui.eyebrow}>Publishing</p>
          <h1 className={ui.title}>Blog posts</h1>
          <p className={ui.description}>
            Draft, preview, publish, schedule, and archive articles without changing the public URL structure.
          </p>
        </div>
        <div className={ui.actions}>
          <Link className={ui.button} href="/admin/posts/new">
            <FilePlus2 aria-hidden="true" />
            New post
          </Link>
        </div>
      </header>

      <form className={ui.filterBar} action="/admin/posts" method="get" role="search">
        <label className={ui.field}>
          <span>Search posts</span>
          <input
            className={ui.input}
            name="search"
            defaultValue={search}
            placeholder="Title or slug"
          />
        </label>
        <label className={ui.fieldCompact}>
          <span>Status</span>
          <select className={ui.select} name="status" defaultValue={status ?? ""}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className={ui.fieldCompact}>
          <span>Category</span>
          <select className={ui.select} name="category" defaultValue={category ?? ""}>
            <option value="">All categories</option>
            {categories.map((item) => (
              <option value={item} key={item}>{item}</option>
            ))}
          </select>
        </label>
        <button className={ui.buttonSecondary} type="submit">
          <Search aria-hidden="true" />
          Filter
        </button>
      </form>

      <section className={ui.tablePanel} aria-label="Blog post results">
        {result.posts.length ? (
          <>
            <div className={ui.tableScroller}>
              <table className={ui.table}>
                <thead>
                  <tr>
                    <th scope="col">Post</th>
                    <th scope="col">Status</th>
                    <th scope="col">Revision</th>
                    <th scope="col">Schedule</th>
                    <th scope="col">Updated</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {result.posts.map((post) => (
                    <tr key={post.id}>
                      <td>
                        <div className={ui.primaryCell}>
                          <strong>{post.title}</strong>
                          <span>/{post.slug}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={ui.badge}
                          data-tone={
                            post.status === "published"
                              ? "success"
                              : post.status === "archived"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {post.status}
                        </span>
                      </td>
                      <td>#{post.currentRevisionNumber}</td>
                      <td>
                        {post.activeSchedule
                          ? `${post.activeSchedule.action} ${pakistanDate.format(new Date(post.activeSchedule.executeAt))}`
                          : "—"}
                      </td>
                      <td>{pakistanDate.format(new Date(post.updatedAt))}</td>
                      <td>
                        <Link className={ui.buttonGhost} href={`/admin/posts/${post.id}/edit`}>
                          <Pencil aria-hidden="true" />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav className={ui.pagination} aria-label="Post pagination">
              <span>
                Page {result.page} of {Math.max(1, result.totalPages)} · {result.total} posts
              </span>
              <div>
                {result.page > 1 ? (
                  <Link className={ui.buttonGhost} href={pageHref(result.page - 1, filters)}>
                    Previous
                  </Link>
                ) : null}
                {result.page < result.totalPages ? (
                  <Link className={ui.buttonGhost} href={pageHref(result.page + 1, filters)}>
                    Next
                  </Link>
                ) : null}
              </div>
            </nav>
          </>
        ) : (
          <div className={ui.emptyState}>
            <h2>No posts found</h2>
            <p>Adjust the filters or create a new draft.</p>
            <Link className={ui.button} href="/admin/posts/new">Create a post</Link>
          </div>
        )}
      </section>
    </div>
  );
}
