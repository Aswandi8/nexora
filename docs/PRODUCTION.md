# Nexora Production Guide

Dokumen ini mendefinisikan baseline deployment, security, migration, health check, release verification, dan rollback Nexora.

## Architecture

Nexora menggunakan monorepo dengan dua aplikasi utama:

```text
Browser / X crawler
        │
        ├──────────────────────┐
        ▼                      ▼
nexora-console            nexora-core
        │                      │
        └──────────┬───────────┘
                   │
                   ▼
               PostgreSQL
```

nexora-console adalah dashboard administratif.

nexora-core menangani authentication, authorization, API, business logic, public Shortlink, media inspection, audit, dan database access.

Console tidak boleh mengakses PostgreSQL secara langsung.

Required Environment

Environment production harus disediakan melalui deployment platform atau secret manager.

Core membutuhkan setidaknya:

DATABASE_URL
BETTER_AUTH_URL
BETTER_AUTH_SECRET
NEXORA_PUBLIC_URL
NEXORA_CONSOLE_URL

Console membutuhkan:

NEXORA_CORE_URL

Email membutuhkan:

RESEND_API_KEY
NEXORA_EMAIL_FROM

NEXORA_PUBLIC_URL adalah source of truth untuk public Shortlink dan social metadata.

Public origin tidak boleh dibangun dari Host, X-Forwarded-Host, atau X-Forwarded-Proto.

Deployment Order

Urutan deployment:

1. Install dependencies
2. Run readiness guards
3. Generate Prisma Client
4. Apply database migrations
5. Verify migration status
6. Run tests
7. Typecheck dan lint
8. Build Core
9. Build Console
10. Start Core
11. Start Console
12. Run production smoke tests
13. Route production traffic

Baseline command:

pnpm install --frozen-lockfile
pnpm audit:readiness
pnpm db:generate
pnpm db:migrate:deploy
pnpm db:migrate:status
pnpm test:core
pnpm check
pnpm build

Setelah service production aktif:

pnpm test:smoke
Database Migration

Migration production berasal dari:

apps/nexora-core/prisma/migrations

Apply migration menggunakan:

pnpm db:migrate:deploy

Kemudian:

pnpm db:migrate:status

harus berhasil.

Jangan menggunakan development migration command pada production.

Schema production tidak boleh dimodifikasi manual untuk menggantikan migration source.

Reverse Proxy and HTTPS

Production harus menggunakan HTTPS.

Core default:

3000

Console default:

3001

Canonical public origin tetap berasal dari:

NEXORA_PUBLIC_URL

Jangan menggunakan request header sebagai source canonical origin.

Security headers dikelola melalui next.config.ts.

HSTS hanya aktif pada production.

Health and Readiness

Core menyediakan:

GET /api/health/live

untuk liveness process.

Dan:

GET /api/health/ready

untuk readiness aplikasi beserta dependency penting seperti PostgreSQL.

Load balancer sebaiknya memakai readiness sebelum memberikan traffic ke instance.

Console login page bukan pengganti Core database readiness.

Release Verification

Sebelum deployment manual:

pnpm release:verify

harus berhasil.

Release verification mencakup:

readiness guards
Prisma generation
migration status
security/regression tests
TypeScript
ESLint
Core build
Console build

CI juga menguji migration terhadap PostgreSQL sementara dan menjalankan production runtime smoke test.

Release dianggap gagal jika salah satu gate gagal.

Runtime Security

Production mempertahankan:

Content-Security-Policy
X-Content-Type-Options
X-Frame-Options
Referrer-Policy
Permissions-Policy
Strict-Transport-Security

Console dan Core tidak boleh dapat di-frame oleh origin lain.

CSP production tidak menggunakan unsafe-eval.

Authorization tetap ditegakkan oleh Core.

UI permission di Console bukan pengganti authorization API.

Public media fetch harus mempertahankan SSRF protection:

HTTP/HTTPS only
no URL credentials
private IPv4 blocked
private IPv6 blocked
IPv4-mapped IPv6 blocked
all DNS answers validated
validated IP connection pinning
redirect revalidation
download size limit
timeout

Sensitive information tidak boleh dicetak ke log:

Authorization
Cookie
password
secret
token
access token
refresh token
API key
credential
Cache Policy

Dashboard aggregate menggunakan bounded cache untuk mengurangi query database berulang.

Mutation terkait harus melakukan invalidation.

Termasuk:

User mutation
Role mutation
Shortlink CREATE
Shortlink UPDATE
Shortlink DELETE

Jangan mengganti invalidation dengan polling Console.

Public poster menggunakan versioned cache key dan ETag.

Email Verification

Email-change verification tidak melakukan mutation melalui GET.

Mutation hanya dilakukan melalui:

POST /api/account/email/verify

Flow:

request email change
↓
persist token hash
↓
send verification email
↓
open confirmation page
↓
explicit confirmation
↓
POST verification
↓
change email
↓
revoke previous sessions
Logging

Application error harus menggunakan structured logger.

Logger wajib menyensor sensitive values baik dari object key maupun string/error message.

Production client response tidak boleh membocorkan stack trace atau internal implementation detail.

Rollback

Jika release gagal sebelum menerima production traffic, pertahankan application release sebelumnya.

Jika smoke test gagal, jangan arahkan traffic ke instance baru.

Application rollback harus memperhitungkan migration yang sudah diaplikasikan.

Jangan otomatis melakukan destructive schema rollback hanya karena application deployment gagal.

Migration sebaiknya mengikuti prinsip expand-migrate-contract ketika perubahan schema berpotensi tidak backward-compatible.

Production Checklist

Sebelum traffic diarahkan ke deployment baru:

[ ] environment tersedia
[ ] frozen-lockfile install berhasil
[ ] audit:readiness berhasil
[ ] Prisma generate berhasil
[ ] migrate deploy berhasil
[ ] migrate status berhasil
[ ] security/regression tests berhasil
[ ] typecheck berhasil
[ ] lint berhasil
[ ] Core build berhasil
[ ] Console build berhasil
[ ] Core readiness berhasil
[ ] Console dapat dibuka
[ ] production smoke test berhasil
[ ] HTTPS aktif
[ ] NEXORA_PUBLIC_URL benar

Deployment belum dianggap selesai hanya karena process berhasil start.

Sekarang 8 heading yang dicari readiness semuanya tersedia persis:

```text
## Required Environment
## Deployment Order
## Database Migration
## Reverse Proxy and HTTPS
## Health and Readiness
## Release Verification
## Runtime Security
## Rollback

Jadi jangan ubah readiness.mjs hanya agar PASS. Readiness benar; dokumennya yang belum memenuhi contract.
```
