# Blog CMS Production Runbook
[Go Back](README.md)

Deploy and operate the PostgreSQL-backed blog CMS at `/es/eigensol.com`.

## Current Production Layout

| Resource | Production value |
| --- | --- |
| Application | `/es/eigensol.com` |
| Website unit | `es_main_site.service` |
| Website working directory | `/es/eigensol.com` |
| Node/npm | `/root/.nvm/versions/node/v24.18.0/bin` |
| Runtime environment | `/es/eigensol.com/.env`, mode `0600` |
| Durable media | `/es/shared/eigensol-media` |
| Canonical origin | `https://eigensol.com` |

The current website unit runs as `root`. The supplied timer units match that deployed identity. Migrate the website and job units together to a dedicated least-privilege account in a separate hardening change; do not change only the timers because database and media permissions must stay aligned.

## Preflight

Run these checks from the repository before copying a release:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
git check-ignore .env
git diff --check
git diff --cached -- . ':(exclude).env.example'
```

Use a secret scanner such as Gitleaks against the working tree and Git history. Rotate the SMTP password, PostgreSQL application password, Better Auth secret, comment rate-limit secret, stable Server Action key, and any other value exposed during development. Use a separate, new admin password. Never put a bootstrap password or migration-owner connection string in `.env`.

The runtime environment is based on `.env.example`. Required production values are:

| Variable | Operational requirement |
| --- | --- |
| `ADMIN_EMAIL` | Stable, normalized owner allowlist address |
| `BETTER_AUTH_SECRET` | Random server-only value of at least 32 characters |
| `BETTER_AUTH_URL` | `https://eigensol.com` |
| `BLOG_MEDIA_ROOT` | `/es/shared/eigensol-media` |
| `COMMENT_RATE_LIMIT_SECRET` | Independent random value of at least 32 characters |
| `DATABASE_URL` | Least-privilege runtime PostgreSQL role, never `postgres` |
| `DATABASE_SSL` | `false` only for trusted loopback; verified TLS otherwise |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | Stable across releases and instances |
| `ZOHO_SMTP_*` | Rotated Zoho app credentials, not the owner password |

Keep `/es/eigensol.com/.env` mode `0600` and do not print its contents into logs or command output.

## Backup

Create a database and media backup before the first migration and before later schema changes:

```bash
export EIGENSOL_BACKUP_DIR="/es/backups/eigensol/$(date -u +%Y%m%dT%H%M%SZ)"
sudo install -d -m 0700 -o postgres -g postgres "$EIGENSOL_BACKUP_DIR"
sudo -u postgres pg_dump --format=custom --no-owner \
  --dbname=eigensol_website \
  --file="$EIGENSOL_BACKUP_DIR/eigensol_website.dump"
sudo tar --create --gzip --file="$EIGENSOL_BACKUP_DIR/eigensol-media.tar.gz" \
  --directory=/es/shared eigensol-media
sudo sh -c 'chown root:root "$1" "$1"/*; chmod 0700 "$1"; chmod 0600 "$1"/*' \
  sh "$EIGENSOL_BACKUP_DIR"
sudo sh -c 'cd "$1" && sha256sum eigensol_website.dump eigensol-media.tar.gz > SHA256SUMS' \
  sh "$EIGENSOL_BACKUP_DIR"
sudo chmod 0600 "$EIGENSOL_BACKUP_DIR/SHA256SUMS"
unset EIGENSOL_BACKUP_DIR
```

For the first rollout, create the empty media directory before running the backup command:

```bash
sudo install -d -m 0750 -o root -g root /es/shared/eigensol-media
```

Copy both backup artifacts to storage outside the server. A database-only backup is incomplete because revision rows reference files under `BLOG_MEDIA_ROOT`.

Verify a database backup in an isolated PostgreSQL database and list the media archive before relying on it:

```bash
pg_restore --list /path/to/eigensol_website.dump > /dev/null
tar --list --gzip --file=/path/to/eigensol-media.tar.gz > /dev/null
sha256sum --check /path/to/SHA256SUMS
```

## Database Rollout

The migration command obtains a PostgreSQL advisory lock and enforces this order:

```text
001_blog_comments
  -> 002_blog_cms
  -> idempotent six-post legacy seed
  -> 003_comment_admin
  -> 004_admin_auth
  -> 005_admin_audit
  -> 006_auth_uuid_defaults
```

The runner skips ledgered migrations, reruns the safe six-post seed, and refuses an out-of-order database. Supply the administrative connection interactively so it is not stored in shell history or the application environment:

```bash
cd /es/eigensol.com
read -r -s -p "Migration database URL: " MIGRATION_DATABASE_URL
printf '\n'
export MIGRATION_DATABASE_URL
npm run db:migrate
```

Grant only runtime data access to the application role created for this site. The `psql` variable is identifier-quoted; enter the role name, not a connection string:

```bash
read -r -p "Runtime PostgreSQL role: " EIGENSOL_APP_DB_ROLE
psql "$MIGRATION_DATABASE_URL" --set=app_role="$EIGENSOL_APP_DB_ROLE" <<'SQL'
GRANT CONNECT ON DATABASE eigensol_website TO :"app_role";
GRANT USAGE ON SCHEMA comments, content, auth TO :"app_role";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA comments TO :"app_role";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA content TO :"app_role";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO :"app_role";
ALTER DEFAULT PRIVILEGES IN SCHEMA comments
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app_role";
ALTER DEFAULT PRIVILEGES IN SCHEMA content
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app_role";
ALTER DEFAULT PRIVILEGES IN SCHEMA auth
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"app_role";
SQL
unset EIGENSOL_APP_DB_ROLE MIGRATION_DATABASE_URL
```

Use `npm run cms:seed-legacy` only to verify or repair the six-post seed after `002` has been applied. It is idempotent, but it is not a replacement for the ordered migration command.

## Application Deploy

Build and deploy the selected, reviewed commit, then migrate and restart the existing website service:

```bash
cd /es/eigensol.com
git status --short
git rev-parse HEAD
sudo systemctl stop es_main_site.service
npm ci
npm run lint
npm run typecheck
npm test
npm run build
# Run the interactive `npm run db:migrate` procedure above.
sudo systemctl start es_main_site.service
sudo systemctl --no-pager --full status es_main_site.service
```

Record the previous and deployed commit IDs in the change ticket. Do not run unreviewed migration SQL manually and do not enable automatic production schema creation in Better Auth.

## Owner Bootstrap and Recovery

Bootstrap exactly one owner after all migrations. The command prompts twice for the new password without echoing it or placing it in shell history:

```bash
cd /es/eigensol.com
npm run admin:bootstrap
```

Sign in at `/admin/login`, enroll TOTP immediately, and store the displayed recovery codes in an offline password manager. Public registration stays disabled.

Use the email password-reset flow first. These interactive SSH recovery commands are break-glass operations; both revoke every existing owner session and write a non-sensitive audit event:

```bash
# Replace the password; TOTP remains enrolled.
npm run admin:reset-password

# Remove TOTP and recovery codes; enroll again after signing in.
npm run admin:reset-2fa
```

The audit trail never stores email addresses, passwords, tokens, recovery codes, article content, or comment content.

## Scheduled Jobs

Install the committed unit examples after reviewing their absolute Node path, runtime user, environment file, and media path against the live website unit:

```bash
cd /es/eigensol.com
sudo install -m 0644 ops/systemd/eigensol-cms-publisher.service /etc/systemd/system/
sudo install -m 0644 ops/systemd/eigensol-cms-publisher.timer /etc/systemd/system/
sudo install -m 0644 ops/systemd/eigensol-cms-maintenance.service /etc/systemd/system/
sudo install -m 0644 ops/systemd/eigensol-cms-maintenance.timer /etc/systemd/system/
sudo systemd-analyze verify /etc/systemd/system/eigensol-cms-*.service \
  /etc/systemd/system/eigensol-cms-*.timer
sudo systemctl daemon-reload
sudo systemctl enable --now eigensol-cms-publisher.timer eigensol-cms-maintenance.timer
systemctl list-timers 'eigensol-cms-*'
```

The publisher runs once per minute and uses row locks, so overlapping or repeated invocations remain idempotent. The daily worker recovers stale schedules, retains active plus the latest 50 unreferenced revisions, expires pending comments, purges expired tokens and old redacted tombstones, trashes orphaned media, and physically purges managed files only after 30 days and a final reference/path safety check.

Test each oneshot before relying on its timer:

```bash
sudo systemctl start eigensol-cms-publisher.service
sudo systemctl start eigensol-cms-maintenance.service
journalctl -u eigensol-cms-publisher.service -u eigensol-cms-maintenance.service \
  --since today --no-pager
```

## Smoke Tests

Verify the deployed origin, not `www`:

```bash
curl --fail --silent --show-error --head https://eigensol.com/
curl --fail --silent --show-error https://eigensol.com/robots.txt > /dev/null
curl --fail --silent --show-error https://eigensol.com/sitemap.xml > /dev/null
curl --fail --silent --show-error --head https://eigensol.com/admin/login
curl --silent --show-error --head https://www.eigensol.com/
curl --silent --show-error --head http://eigensol.com/
```

Confirm through the browser:

- Login, mandatory TOTP, logout, and session revocation.
- Draft save, authenticated preview, publish, update, and Pakistan-time scheduling.
- Media upload and `/media/<hash>.webp` delivery.
- Historical slug HTTP 308 redirect and canonical metadata.
- Comment submission, notification failure/retry, approval, rejection, and removal.
- Published-only blog listing, real pagination, Article JSON-LD, and sitemap inclusion.
- `noindex`, private/no-store, no-referrer, and clickjacking headers on admin routes.
- Permanent HTTP and `www` redirects, HTTPS, and HSTS at Cloudflare.

Validate representative public pages with Google Rich Results Test and Schema.org Validator after deployment.

## Rollback

Migrations are additive and intentionally have no automatic down migration. If application verification fails:

```bash
sudo systemctl disable --now eigensol-cms-publisher.timer eigensol-cms-maintenance.timer
sudo systemctl stop es_main_site.service
cd /es/eigensol.com
# Restore the previously recorded, reviewed application commit or release artifact.
npm ci
npm run build
sudo systemctl start es_main_site.service
```

Keep the migrated database and durable media in place for a code-first rollback. Do not restore the database backup over live post-migration data unless a separately reviewed disaster-recovery decision accepts losing every post, comment, session, and media change made after the backup.

Retain the pre-deploy database and media backups until the CMS has passed production verification and the backup has been copied off-host.

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Migration refuses to run | A later ledger entry exists before an earlier one | Stop; inspect schema history and backup before manual repair |
| `003_comment_admin` cannot backfill | A stored comment slug has no seeded CMS post | Do not delete the comment; verify the six-post seed and slug data |
| Admin bootstrap says owner exists | Bootstrap already completed or the single-owner table contains a different account | Use recovery for the configured owner; inspect identity before changing `ADMIN_EMAIL` |
| Scheduled post remains pending | Timer disabled, database unavailable, or schedule was rescheduled after a transient failure | Check `systemctl list-timers` and the publisher journal |
| Maintenance reports failed schedules | A stale schedule exhausted three attempts | Inspect the admin audit/post state before replacing the schedule |
| Media upload fails | Missing directory, ownership mismatch, or invalid image | Check `BLOG_MEDIA_ROOT`, mode/owner, and the 10 MB/6000-pixel limits |
| Media file returns 404 | Asset is trashed/missing or storage key failed safety validation | Inspect the media record and job journal; restore only from a matched DB/media backup |
| Password/TOTP recovery cannot start | Command is not attached to a TTY | Run it from an interactive trusted SSH session |
| Timer cannot find `node` | Production NVM path changed | Update both unit files, verify them, daemon-reload, and restart timers |
