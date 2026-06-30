# Certificate Inventory Platform

This repository contains the full assignment deliverable:

- Rust/Axum certificate metadata API backed by PostgreSQL
- Local TLS termination through Caddy
- Next.js TypeScript inventory UI with SSR/server components
- Large synthetic inventory table with filtering, sorting, pagination, and accessible markup

## Run locally with Cargo

```bash
cargo run
```

The API expects PostgreSQL. You can override the default connection string with `DATABASE_URL`:

```bash
DATABASE_URL="postgres://cert_service:cert_service@localhost:5432/cert_service" cargo run
```

## Run locally with Docker

```bash
docker compose up --build
```

Services:

- Rust API: `http://localhost:8080`
- TLS proxy: `https://localhost:8443`
- Next.js app: `http://localhost:3000/inventory`
- PostgreSQL: internal Docker network only

Caddy uses a local self-signed certificate. The frontend container sets `NODE_TLS_REJECT_UNAUTHORIZED=0` only for this local assignment environment; production should mount and trust a private CA certificate instead.

## Endpoints

### Create certificate metadata

```bash
curl -X POST http://localhost:8080/certificates \
  -H "content-type: application/json" \
  -d '{
    "subject": "api.example.com",
    "expiration": "2027-01-01T00:00:00Z",
    "issuer": "Example CA",
    "san_entries": ["api.example.com", "www.example.com"]
  }'
```

### List certificate metadata

```bash
curl http://localhost:8080/certificates
```

### Get certificate metadata

```bash
curl http://localhost:8080/certificates/<id>
```

### Parse a PEM certificate

```bash
curl -X POST http://localhost:8080/certificates/parse \
  -H "content-type: application/json" \
  -d '{"pem":"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"}'
```

### Call through local TLS proxy

```bash
curl -k https://localhost:8443/certificates
```

## Notes

- The service uses Axum for async HTTP handling.
- SQLx is used for PostgreSQL access.
- The Docker image runs the service as a non-root user.
- SAN values are stored as a PostgreSQL `text[]` and returned as an array by the API.
- Caddy provides the local HTTPS endpoint for the full-stack assignment.
- The inventory UI uses server rendering and query-string driven table state to avoid unnecessary client re-renders.
- The large inventory dashboard simulates 50,000 records, filters/sorts with memoized React state, and virtualizes rows so the browser only mounts the visible table slice.
- The certificate panel is server-rendered with initial data and uses SWR for lightweight client refreshes.
- Accessibility checks to run before submission: keyboard tab through `/inventory`, verify table headers/captions are announced by a screen reader, and run Lighthouse or axe on the page.
# cert-service
