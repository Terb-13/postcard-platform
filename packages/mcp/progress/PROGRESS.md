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

## Residual risk

Spend cap is read-then-increment (not a single SQL compare-and-swap). Concurrent `prepare_checkout` on one key could both pass the cap check.

## Next for you

1. Apply `packages/db/prisma/migrations/20260825140000_add_mcp_api_key`
2. `npm run issue-key -w @postcard-platform/mcp -- --org-id … --user-email …`
3. Point Cursor / Claude Desktop at `packages/mcp` (see README)
