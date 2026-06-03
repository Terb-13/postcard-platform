#!/usr/bin/env node
/**
 * Upload demo-artwork PNGs to Supabase Storage and ensure DB rows match public URLs.
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL (or POSTGRES_*)
 * Files: apps/web/public/demo-artwork/{campaignId}-front.png|back.png
 */
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.join(repoRoot, "apps/web/.env.local"));
loadEnvFile(path.join(repoRoot, ".env.local"));
loadEnvFile(path.join(repoRoot, "packages/db/.env"));

const DEMO_DIR = path.join(repoRoot, "apps/web/public/demo-artwork");
const BUCKET = "campaign-artwork";

const CAMPAIGNS = [
  { id: "camp_draft_lupy", artworkId: "art_draft_lupy" },
  { id: "camp_prod_lupy", artworkId: "art_prod_lupy" },
  { id: "camp_ship_lupy", artworkId: "art_ship_lupy" },
];

function supabaseUrl() {
  return (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(
    /\/$/,
    ""
  );
}

function publicUrl(storagePath) {
  return `${supabaseUrl()}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

async function loadSupabase() {
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY in apps/web/.env.local"
    );
    process.exit(1);
  }
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url, key, { auth: { persistSession: false } });
}

async function ensureBucket(supabase) {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (buckets?.some((b) => b.name === BUCKET)) return;

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`createBucket: ${error.message}`);
  }
  console.log(`Created public bucket "${BUCKET}"`);
}

async function uploadFile(supabase, localPath, storagePath) {
  const buf = await readFile(localPath);
  const ext = path.extname(localPath).toLowerCase();
  const contentType =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buf, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`upload ${storagePath}: ${error.message}`);
  return publicUrl(storagePath);
}

async function main() {
  const supabase = await loadSupabase();
  await ensureBucket(supabase);

  let files;
  try {
    files = (await readdir(DEMO_DIR)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  } catch {
    console.error(`Demo artwork folder not found: ${DEMO_DIR}`);
    console.error("Add PNGs from docs/GROK_DEMO_ARTWORK_PROMPTS.md, then re-run.");
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`No images in ${DEMO_DIR}. See docs/GROK_DEMO_ARTWORK_PROMPTS.md`);
    process.exit(1);
  }

  const uploaded = {};

  for (const file of files) {
    const storagePath = `demo/${file}`;
    const localPath = path.join(DEMO_DIR, file);
    const url = await uploadFile(supabase, localPath, storagePath);
    uploaded[file] = url;
    console.log(`Uploaded ${file} → ${url}`);
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    for (const { id: campaignId, artworkId } of CAMPAIGNS) {
      const frontKey = `${campaignId}-front.png`;
      const backKey = `${campaignId}-back.png`;
      const frontUrl = uploaded[frontKey];
      const backUrl = uploaded[backKey];

      if (!frontUrl) {
        console.warn(`Skip DB update for ${campaignId}: missing ${frontKey}`);
        continue;
      }

      await prisma.artwork.upsert({
        where: { campaignId },
        create: {
          id: artworkId,
          campaignId,
          status: campaignId === "camp_draft_lupy" ? "UPLOADED" : "APPROVED",
          fileUrl: frontUrl,
          thumbnailUrl: frontUrl,
          pageCount: backUrl ? 2 : 1,
          fileName: frontKey,
        },
        update: {
          fileUrl: frontUrl,
          thumbnailUrl: frontUrl,
          pageCount: backUrl ? 2 : 1,
          fileName: frontKey,
        },
      });

      await prisma.artworkThumbnail.upsert({
        where: { artworkId_page: { artworkId, page: 1 } },
        create: { artworkId, page: 1, url: frontUrl },
        update: { url: frontUrl },
      });

      if (backUrl) {
        await prisma.artworkThumbnail.upsert({
          where: { artworkId_page: { artworkId, page: 2 } },
          create: { artworkId, page: 2, url: backUrl },
          update: { url: backUrl },
        });
      }

      console.log(`Linked artwork for ${campaignId}`);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log("\nDone. Open /campaigns and /account/orders to verify previews.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
