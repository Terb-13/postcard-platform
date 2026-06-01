import { uploadToR2 } from "./r2";

function hasR2Config(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_URL
  );
}

/** Upload a fulfillment manifest (CSV/JSON) for print partners. */
export async function uploadMailingManifest(
  body: string,
  key: string,
  contentType: string
): Promise<{ url: string; key: string }> {
  if (!hasR2Config()) {
    throw new Error(
      "R2 storage is not configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL)."
    );
  }

  const url = await uploadToR2(Buffer.from(body, "utf-8"), key, contentType);
  return { url, key };
}

export { hasR2Config };
