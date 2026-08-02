# EigenSol Documentation Agent Notes

This tree contains maintained operational guidance for the EigenSol website.

## Docs Map

- `README.md` is the concise documentation hub.
- `operations/README.md` is the operations hub.
- `operations/blog-cms.md` is the production CMS deployment and recovery runbook.

## Docs Rules

- Every documentation directory has a `README.md` navigation hub.
- Every README links back to its parent hub immediately after its H1.
- Topic documents link back to the README in their directory.
- Keep README files navigational and put procedures in topic files.
- Use exact repository commands and production paths when they are known.
- Never include passwords, tokens, connection strings, recovery codes, or verification values.
- Mark destructive and irreversible operations explicitly.
- Keep deployment and rollback instructions consistent with additive migrations.

## Programming Conventions

- Production application root: `/es/eigensol.com`.
- Durable blog media root: `/es/shared/eigensol-media`.
- Existing website unit: `es_main_site.service`.
- Database migrations run only through `npm run db:migrate`.
- Scheduled jobs use the committed systemd examples in `ops/systemd/`.
