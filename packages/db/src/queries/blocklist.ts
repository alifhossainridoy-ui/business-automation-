import { getSupabaseClient } from "../client";

export async function findBlocklistEntry(
  businessId: string,
  fbUserId: string
): Promise<{ id: string; reason: string | null } | null> {
  const { data, error } = await getSupabaseClient()
    .from("blocklist")
    .select("id, reason")
    .eq("business_id", businessId)
    .eq("fb_user_id", fbUserId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
