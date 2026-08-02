This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

Production CMS deployment, backup, scheduling, and recovery procedures are documented in [the operator runbook](docs/operations/blog-cms.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## SEO deployment

The site uses `https://eigensol.com` as its canonical origin. Configure the hosting platform to permanently redirect all `https://www.eigensol.com/*` requests to the matching non-www URL. Keep the path and query string intact.

Search-engine ownership verification is optional and environment-driven:

```bash
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-token
NEXT_PUBLIC_BING_SITE_VERIFICATION=your-bing-token
```

Do not commit real verification tokens. After deployment, submit `https://eigensol.com/sitemap.xml` to Google Search Console and Bing Webmaster Tools.

## Forms and blog-comment moderation

Project inquiries are delivered through Zoho SMTP. Blog comments are first stored in PostgreSQL as pending, then an email containing a private, single-use moderation link is sent to the site administrator. Only approved comments are rendered publicly.

The server requires these environment variables:

```bash
ZOHO_SMTP_HOST=smtp.zoho.com
ZOHO_SMTP_PORT=465
ZOHO_SMTP_USER=your-mailbox
ZOHO_SMTP_PASS=your-app-password
CONTACT_FROM_EMAIL=your-mailbox
CONTACT_TO_EMAIL=your-moderation-mailbox
DATABASE_URL=postgresql://least-privilege-role:password@host:5432/database
DATABASE_SSL=true
COMMENT_RATE_LIMIT_SECRET=a-random-secret-at-least-32-characters-long
```

Keep real values in an ignored `.env` file or the hosting platform's secret store. The runtime database role should have only `CONNECT`, schema `USAGE`, and the required `SELECT`, `INSERT`, `UPDATE`, and `DELETE` privileges; never use the PostgreSQL superuser in `DATABASE_URL`. Set `DATABASE_SSL=false` only for a trusted loopback connection such as `127.0.0.1` on the same server.

Apply database migrations and the idempotent six-post seed in their required order with an administrative PostgreSQL account before deploying the application:

```bash
npm run db:migrate
```

The moderation page is intentionally `noindex` and receives the raw token only through the URL fragment. Moderation is performed by an explicit POST request; visiting or previewing the email link cannot approve a comment.

## Admin authentication

The private `/admin` workspace uses Better Auth with PostgreSQL sessions, database-backed rate limits, password reset through the configured Zoho mailbox, and mandatory authenticator-app TOTP. Public account creation is disabled and the database permits only one owner account.

Add these server-only values to the deployment secret store:

```bash
ADMIN_EMAIL=owner@example.com
BETTER_AUTH_SECRET=a-random-secret-at-least-32-characters-long
BETTER_AUTH_URL=https://eigensol.com
```

Apply all migrations, then bootstrap the owner once. The command reads the initial password twice from an interactive terminal without echoing or persisting it:

```bash
npm run admin:bootstrap
```

After the first password sign-in, `/admin/settings/security` requires TOTP enrollment and presents the recovery codes once. For break-glass recovery when both the authenticator and recovery codes are unavailable, run the following from a trusted administrative environment. It revokes every admin session and requires fresh TOTP enrollment:

```bash
npm run admin:reset-2fa
```

An interactive `npm run admin:reset-password` command is also available for SSH break-glass password recovery. Both recovery commands revoke all existing owner sessions and write a non-sensitive audit event. Keep `ADMIN_EMAIL` stable after bootstrapping; changing it intentionally locks out the existing account until the database identity is migrated to the new allowlisted address.
