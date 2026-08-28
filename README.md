# Zucci Supplier Connect — Vue 3

Vendor management platform for Zucci marketplace, built with Vue 3 Composition API.

## Tech Stack

- **Vue 3** (Composition API + `<script setup>`)
- **Vue Router 4**
- **Pinia**
- **Tailwind CSS 3**
- **Chart.js 4**
- **Lucide Vue Next**
- **Vite 6**

## Quick start

### With Make + Docker (recommended)

```bash
make help          # list all targets
make local         # hot-reload dev  → http://localhost:5173
make staging       # staging nginx   → http://localhost:8081
make prod          # production nginx → http://localhost:8080
```

### With npm (no Docker)

```bash
npm install
npm run dev              # http://localhost:5173
npm run build:staging    # dist/ → staging API
npm run build:prod       # dist/ → production API
npm run preview
```

## Environments

| Env | Vite mode | App URL | API base | Docker / Make | Port |
|-----|-----------|---------|----------|---------------|------|
| **local / dev** | `development` | `https://supplier.zucci.local` | `https://api.zucci.xyz/api/v1/` | `make local` | `5173` |
| **staging** | `staging` | `https://supplier.zucci.xyz` | `https://api.zucci.xyz/api/v1/` | `make staging` | `8081` |
| **production** | `production` | `https://supplier.zucci.com` | `https://api.zucci.com/api/v1/` | `make prod` | `8080` |

Config files:

- `.env.development` — local / `npm run dev`
- `.env.staging` — staging builds
- `.env.production` — production builds
- `.env.example` — documented template
- `.env.local` — optional local overrides (gitignored)

## CI / CD (GitHub Actions + Terraform)

Mirrors **Front-end-admin**: OIDC (no long-lived AWS keys), branch → environment, same staging EC2.

| Branch / trigger | Environment | How it deploys | URL |
|------------------|-------------|----------------|-----|
| `staging` push | staging | ECR image (arm64) → SSM on shared API EC2 | `https://supplier.zucci.xyz` (edge :80) |
| `main` push | prod | Vite build → S3 sync → CloudFront invalidation | `https://supplier.zucci.com` |
| **Deploy / Manual Deploy** (Actions UI) | staging or prod | Same pipelines from **any branch** — pick branch + env | — |

Manual run (same as admin/api): **Actions → Deploy** (or **Manual Deploy**) → **Run workflow** → choose branch + `staging` / `prod`.

GitHub Environments must allow the branch (`Settings → Environments → staging|prod → Deployment branches` → All branches, or include your feature branches).

### One-time setup

```bash
# 1. Staging infra (ECR + GitHub OIDC role) — requires API EC2 already up
make tf-apply ENV=staging
make tf-output ENV=staging   # copy github_actions_role_arn

# 2. Production infra (S3 + CloudFront + OIDC role)
make tf-apply ENV=prod
make tf-output ENV=prod      # copy role ARN + cloudfront_distribution_id
```

GitHub repo → **Settings → Environments**:

| Secret / variable | staging | prod |
|-------------------|---------|------|
| `AWS_ROLE_ARN` (secret) | ✅ | ✅ |
| `CLOUDFRONT_DISTRIBUTION_ID` (variable) | — | ✅ |
| `AWS_REGION` (variable, optional) | `us-east-1` | `us-east-1` |

Also open API CORS for `https://supplier.zucci.xyz` / `https://supplier.zucci.com` / `https://supplier.zucci.local` (see `zucci-api` env + `infra/terraform/README.md`).

Point DNS:

- Staging: `supplier.zucci.xyz` → same staging EIP as `api.zucci.xyz` / `admin.zucci.xyz` (Cloudflare → origin :80)
- Prod: CNAME CloudFront domain → `supplier.zucci.com` (or set `route53_zone_id`)

Full details: [`infra/terraform/README.md`](infra/terraform/README.md).

## Docker

Multi-stage `Dockerfile`:

1. **development** — Node + Vite (hot reload)
2. **build** — `vite build --mode <staging|production>`
3. **production** — nginx serving `dist/` (SPA + `/healthz`)

## Project Structure

```
Front-end-supplier/
├── Makefile                   # make local | staging | prod | tf-apply | …
├── Dockerfile                 # multi-stage: development → build → nginx
├── docker-compose.yml         # local / staging / prod services
├── docker/nginx/default.conf  # SPA + healthz
├── .github/workflows/         # CI + Deploy (OIDC → EC2 / S3+CF)
├── infra/terraform/           # staging EC2 sidecar + prod static site
├── scripts/ensure-supplier-on-ec2.sh
├── .env.development           # local → api.zucci.xyz
├── .env.staging               # staging → api.zucci.xyz
├── .env.production            # prod → api.zucci.com
└── src/
    ├── assets/styles/
    ├── components/
    ├── composables/
    ├── data/
    ├── router/
    ├── stores/
    └── views/
```
