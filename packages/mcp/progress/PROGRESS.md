# Postcard MCP — live progress

**Status: wins the bar** (critic round 5). Watch `index.html` or `http://127.0.0.1:3333/progress`.

## Bar

1. Official `@modelcontextprotocol/sdk` + current Anthropic/Cursor-style business tools — **WIN**
2. Functional equivalence with tRPC callers / Drummond services — **WIN**
3. Dry-run defaults, confirm flags, spend caps, org-scoped keys, agent-usable schemas — **WIN**

## Test results

- 18/18 vitest passed
- Live A/B: `estimate_audience` === `targeting.estimateAudience` (ZIP 80202, `minMoverPercent: 10`)
- Live A/B: targeted `create_campaign` dry-run quantity/total === unfiltered `getCensusStatsForZctas` pricing (same as `campaign.create`)
- HTTP: `/health` 200, `/progress` 200, `POST /mcp` without Bearer → 401

## Spend cap

`reserveSpend` uses a single `UPDATE ... WHERE remaining >= amount RETURNING`. Checkout reserves before Stripe and releases if `createCheckoutSession` throws.

## Cursor-dev key

Prefix `mcp_0IjRZkev` — scopes `read,draft`, spend cap $0, org `org_lupylloyd_demo`. Plaintext is in the gitignored `packages/mcp/.env.cursor-dev-key.local`.

## Next for you

1. Point Cursor / Claude Desktop at `packages/mcp` (see README) with `MCP_API_KEY` from the local key file
2. Smoke `http://127.0.0.1:3333/progress` and one dry-run new-mover flow
