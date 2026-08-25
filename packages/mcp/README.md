# Postcard Platform MCP

Official-SDK MCP server so Claude Desktop, Cursor, and custom agents can discover and drive campaigns through the **existing** tRPC procedures and services. Human UX is unchanged.

## What it wraps

| Agent tool | Existing procedure / service |
| --- | --- |
| `estimate_audience*` / `get_census_stats` | `targeting.estimateAudience*` |
| `calculate_cost` | `mailing.calculatePricing` → `pricing.service.ts` |
| `preview_eddm_routes` | `mailing.eddmRoutes` |
| `create_campaign` / `update_campaign_draft` | `campaign.create` / `campaign.updateDraft` |
| `attach_artwork` | `campaign.uploadArtwork` |
| `prepare_checkout` | `campaign.createCheckoutSession` |
| `finalize_mailing` | `mailing.finalize` → `finalizeMailingJob` → `handoffToDrummond` |

Draft tools default to `dryRun=true`. Stripe and Drummond require explicit `confirm` (and `confirmHandoff` for the R2 manifest).

## Setup

1. Apply the Prisma migration (adds `McpApiKey`):

```bash
npm run db:push
# or migrate
```

2. Install workspace deps (from repo root):

```bash
npm install
```

3. Issue an org-scoped key (plaintext shown once):

```bash
npm run issue-key -w @postcard-platform/mcp -- \
  --org-id org_xxx \
  --user-email you@company.com \
  --name "Cursor" \
  --scopes read,draft \
  --spend-cap-cents 0
```

Add `spend` / `fulfill` and a positive `--spend-cap-cents` only for agents that may open Stripe or send mail.

## Run

```bash
# Claude Desktop / Cursor (stdio). Do not console.log — stdout is JSON-RPC.
MCP_API_KEY=mcp_... npm start -w @postcard-platform/mcp

# Remote agents (Streamable HTTP) + live progress page
MCP_API_KEY=mcp_... npm run start:http -w @postcard-platform/mcp
# POST http://127.0.0.1:3333/mcp
# GET  http://127.0.0.1:3333/progress
```

Uses the same env files as the app (`DATABASE_URL`, `CENSUS_API_KEY`, Stripe, R2, Mapbox).

### Cursor

`~/.cursor/mcp.json` (or project `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "postcard": {
      "command": "npx",
      "args": ["tsx", "packages/mcp/src/index.ts", "--stdio"],
      "cwd": "/absolute/path/to/postcard-platform",
      "env": {
        "MCP_API_KEY": "mcp_..."
      }
    }
  }
}
```

### Claude Desktop

```json
{
  "mcpServers": {
    "postcard": {
      "command": "npx",
      "args": ["tsx", "packages/mcp/src/index.ts", "--stdio"],
      "cwd": "/absolute/path/to/postcard-platform",
      "env": {
        "MCP_API_KEY": "mcp_..."
      }
    }
  }
}
```

### HTTP agents

```
Authorization: Bearer mcp_...
POST /mcp
```

## Example agent flow

1. `get_workflow_guide`
2. `get_spend_status`
3. `estimate_audience_from_zctas` `{ "zctas": ["80202","80205"], "filters": { "minMoverPercent": 10 }, "size": "6x9" }`
4. `create_campaign` (default dry-run) then same payload with `dryRun: false`
5. `attach_artwork` after a file is on R2
6. `get_payment_readiness` — checkout only after ops APPROVED artwork
7. `prepare_checkout` `{ "confirm": true }` (spend scope + cap)
8. After paid: `finalize_mailing` `{ "confirm": true }` then, if mailing for real, `runHandoff: true, confirmHandoff: true`

## Env

| Variable | Purpose |
| --- | --- |
| `MCP_API_KEY` | Stdio auth (HTTP uses `Authorization`) |
| `MCP_HTTP_PORT` | Default `3333` |
| `MCP_HTTP_HOST` | Default `127.0.0.1` |
| Existing app env | `DATABASE_URL`, `CENSUS_API_KEY`, Stripe, R2, Mapbox |

## Tests

```bash
npm test -w @postcard-platform/mcp
```
