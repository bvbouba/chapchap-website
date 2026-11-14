# Deploy customer website to Vercel (`www.chapchapticket.com`)

Root directory in the monorepo: **`customer/website`**.

## 1. Vercel project

```bash
cd customer/website
npx vercel login
npx vercel link   # create / link project, set Root Directory = customer/website if from repo root
```

### Environment variables (Production)

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SALEOR_API_URL` | `https://server.chapchapticket.com/graphql/` |
| `NEXT_PUBLIC_STOREFRONT_URL` | `https://www.chapchapticket.com` |
| `SALEOR_APP_TOKEN` | Saleor app token (channel metadata / logos) |
| `NEXT_PUBLIC_SUPPORT_PHONE` | e.g. `+225 …` |
| `NEXT_PUBLIC_SUPPORT_WHATSAPP` | e.g. `22507…` (digits for `wa.me`) |
| `SKIP_GRAPHQL_GENERATE` | `1` (use committed `src/gql`; set automatically when `VERCEL=1`) |

```bash
npx vercel env add NEXT_PUBLIC_SALEOR_API_URL production
# …repeat for each var
```

### Deploy

```bash
cd customer/website
npx vercel --prod
```

Or connect the GitHub repo in Vercel UI → Framework Preset **Next.js** → Root Directory **`customer/website`** → Production Branch.

## 2. Custom domain on Vercel

Vercel → Project → **Settings → Domains**:

1. Add `www.chapchapticket.com`
2. Add `chapchapticket.com` (optional redirect → `www`)

Vercel will show the DNS targets (usually):

```text
www     CNAME   cname.vercel-dns.com
@       A       76.76.21.21
```

(Use the exact values from the Domains panel if they differ.)

## 3. GoDaddy DNS

GoDaddy → **My Products** → **chapchapticket.com** → **DNS** → **Manage DNS**:

| Type | Name | Value | TTL |
|------|------|--------|-----|
| **CNAME** | `www` | `cname.vercel-dns.com` | 1 hour |
| **A** | `@` | `76.76.21.21` | 1 hour |

Optional apex → www: in Vercel set `chapchapticket.com` to **Redirect to www.chapchapticket.com**.

Remove any conflicting old `www` A/CNAME records pointing elsewhere.

DNS can take **5–60 minutes** (sometimes up to 48h).

## 4. Saleor allowlist

On the Saleor droplet, ensure GraphQL clients can use the storefront host:

```env
ALLOWED_CLIENT_HOSTS=www.chapchapticket.com,chapchapticket.com,dashboard.chapchapticket.com,localhost,127.0.0.1
```

Then recreate API:

```bash
cd ~/chapchap/saleor/deployment/digitalocean
docker compose up -d --force-recreate api worker beat
```

### Account deletion (`noNotification` + token)

Phone accounts use virtual emails (`*@chapchapticket.com`), so email delete links are unreliable. ChapChap Saleor includes Autocoq’s `accountRequestDeletion(noNotification: true)` → returns a one-time `token` for `accountDelete`.

After pulling that Saleor change onto the droplet, rebuild/recreate the API containers so production GraphQL accepts `noNotification` and returns `token`. Until then, `/ci/accountDeletion` will fail at the “Continuer” step.
## 5. Smoke test

- https://www.chapchapticket.com/ci
- Search → Réserver → cart → checkout
- https://www.chapchapticket.com/ci/orders
