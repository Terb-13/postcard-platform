import { getSupabaseAdmin } from "../supabase";

export const CAMPAIGN_ARTWORK_BUCKET = "campaign-artwork";

/** Public object URL for a file in the campaign-artwork bucket. */
export function publicCampaignArtworkUrl(storagePath: string): string {
  const base = (
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    ""
  ).replace(/\/$/, "");
  const path = storagePath.replace(/^\//, "");
  return `${base}/storage/v1/object/public/${CAMPAIGN_ARTWORK_BUCKET}/${path}`;
}

export async function ensureCampaignArtworkBucket(): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error(
      "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === CAMPAIGN_ARTWORK_BUCKET);
  if (exists) return;

  const { error } = await supabase.storage.createBucket(CAMPAIGN_ARTWORK_BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Failed to create bucket ${CAMPAIGN_ARTWORK_BUCKET}: ${error.message}`);
  }
}

export async function uploadCampaignArtworkFile(
  storagePath: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error(
      "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  await ensureCampaignArtworkBucket();

  const path = storagePath.replace(/^\//, "");
  const { error } = await supabase.storage.from(CAMPAIGN_ARTWORK_BUCKET).upload(path, body, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload failed for ${path}: ${error.message}`);
  }

  return publicCampaignArtworkUrl(path);
}
