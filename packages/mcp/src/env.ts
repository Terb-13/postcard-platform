import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const here = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(here, "..");
const repoRoot = resolve(packageRoot, "../..");

const candidates = [
  resolve(repoRoot, ".env"),
  resolve(repoRoot, ".env.local"),
  resolve(repoRoot, "apps/web/.env.local"),
  resolve(repoRoot, "apps/web/.env"),
  resolve(repoRoot, "packages/db/.env"),
  resolve(packageRoot, ".env"),
  resolve(packageRoot, ".env.cursor-dev-key.local"),
];

export function loadEnv(): void {
  for (const path of candidates) {
    if (existsSync(path)) {
      config({ path, override: false });
    }
  }
}

export const paths = { packageRoot, repoRoot };
