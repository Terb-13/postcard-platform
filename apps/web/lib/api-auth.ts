import { getCurrentUser } from "@/lib/auth";

export async function requireOrgUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user };
}
