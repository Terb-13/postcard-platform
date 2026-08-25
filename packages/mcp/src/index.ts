#!/usr/bin/env npx tsx
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolveApiKey } from "./auth.ts";
import { createOrgCaller } from "./caller.ts";
import { loadEnv } from "./env.ts";
import { listenHttp } from "./http.ts";
import { writeProgressState } from "./progress-state.ts";
import { createPostcardMcpServer } from "./server.ts";

loadEnv();

function parseArgs(argv: string[]) {
  return {
    stdio: argv.includes("--stdio") || (!argv.includes("--http") && !argv.includes("--progress-only")),
    http: argv.includes("--http") || argv.includes("--progress-only"),
    progressOnly: argv.includes("--progress-only"),
    port: Number(process.env.MCP_HTTP_PORT ?? "3333"),
    host: process.env.MCP_HTTP_HOST ?? "127.0.0.1",
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  writeProgressState({ phase: "running" });

  if (args.http) {
    listenHttp(args.port, args.host);
    if (args.progressOnly) return;
  }

  if (!args.stdio) return;

  const server = createPostcardMcpServer(async () => {
    const auth = await resolveApiKey(process.env.MCP_API_KEY);
    return { auth, caller: await createOrgCaller(auth) };
  });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Postcard MCP stdio ready");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
