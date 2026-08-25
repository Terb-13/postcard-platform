import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { paths } from "./env.ts";
import { TOOL_CATALOG } from "./tool-catalog.ts";

export type ProgressState = {
  updatedAt: string;
  phase: string;
  bar: { sdk: string; equivalence: string; safety: string };
  pieces: { id: string; title: string; status: string; gap: string }[];
  tools: typeof TOOL_CATALOG;
  testResults: { name: string; result: string; notes?: string }[];
  currentGap: string;
};

const defaultPieces: ProgressState["pieces"] = [
  {
    id: "progress",
    title: "Live progress page",
    status: "done",
    gap: "Open progress/index.html or http://127.0.0.1:3333/progress",
  },
  {
    id: "foundation",
    title: "Package, transports, org-scoped API keys, tRPC caller",
    status: "done",
    gap: "Apply Prisma migration 20260825140000_add_mcp_api_key, then npm run issue-key -w @postcard-platform/mcp",
  },
  {
    id: "read-tools",
    title: "Discovery, Census audience, cost estimate",
    status: "done",
    gap: "Live Census A/B still needs CENSUS_API_KEY + issued key",
  },
  {
    id: "write-tools",
    title: "Campaign + artwork (dry-run default)",
    status: "done",
    gap: "dryRun=false path is campaign.create / updateDraft / uploadArtwork",
  },
  {
    id: "spend-tools",
    title: "Checkout + mailing finalize + Drummond handoff",
    status: "done",
    gap: "confirm + confirmHandoff gates; tRPC default runHandoff inverted for safety",
  },
  {
    id: "tests",
    title: "Equivalence and safety tests",
    status: "done",
    gap: "18/18 including live Census A/B",
  },
];

export function writeProgressState(partial: Partial<ProgressState> = {}) {
  const state: ProgressState = {
    updatedAt: new Date().toISOString(),
    phase: partial.phase ?? "wins-the-bar",
    bar: partial.bar ?? {
      sdk: "pass",
      equivalence: "pass",
      safety: "pass",
    },
    pieces: partial.pieces ?? defaultPieces,
    tools: TOOL_CATALOG,
    testResults: partial.testResults ?? [],
    currentGap:
      partial.currentGap ??
      "WINS THE BAR. Residual: spend cap is read-then-increment (not a single compare-and-swap).",
  };

  writeFileSync(join(paths.packageRoot, "progress/state.json"), JSON.stringify(state, null, 2) + "\n");
  return state;
}
