import { getSupabaseClient } from "../client";
import type { Campaign } from "@rupzone/shared-types";

export interface CreateCampaignInput {
  business_id: string;
  name: string;
  template: string;
}

export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  const { data, error } = await getSupabaseClient()
    .from("campaigns")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as Campaign;
}

export async function listCampaigns(businessId: string, limit = 50): Promise<Campaign[]> {
  const { data, error } = await getSupabaseClient()
    .from("campaigns")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Campaign[];
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const { data, error } = await getSupabaseClient()
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Campaign | null;
}

/** Sets the target count and flips the campaign to "running" when a "Run" enqueues its sends. */
export async function setCampaignTotal(id: string, total: number): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("campaigns")
    .update({ total, status: "running" })
    .eq("id", id);
  if (error) throw error;
}

export async function incrementCampaignSent(id: string): Promise<void> {
  await incrementCampaignCounter(id, "sent");
}

export async function incrementCampaignFailed(id: string): Promise<void> {
  await incrementCampaignCounter(id, "failed");
}

export async function incrementCampaignReplied(id: string): Promise<void> {
  await incrementCampaignCounter(id, "replied");
}

/**
 * Read-modify-write, not an atomic SQL increment — safe here because the
 * campaign worker processes one job at a time (BullMQ's default
 * concurrency), so sent/failed updates never race against themselves.
 * Replied updates come from the webhook path instead, but only ever one
 * customer reply at a time, so the same reasoning holds.
 */
async function incrementCampaignCounter(
  id: string,
  column: "sent" | "failed" | "replied"
): Promise<void> {
  const db = getSupabaseClient();
  const { data, error } = await db.from("campaigns").select("*").eq("id", id).single();
  if (error) throw error;
  const campaign = data as Campaign;
  const nextValue = (campaign[column] ?? 0) + 1;

  const patch: Partial<Campaign> = { [column]: nextValue };
  if (column !== "replied" && campaign.total != null) {
    const sent = column === "sent" ? nextValue : campaign.sent;
    const failed = column === "failed" ? nextValue : campaign.failed;
    if (sent + failed >= campaign.total) patch.status = "done";
  }

  const { error: updateError } = await db.from("campaigns").update(patch).eq("id", id);
  if (updateError) throw updateError;
}
