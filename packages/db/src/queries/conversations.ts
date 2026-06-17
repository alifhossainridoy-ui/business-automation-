import { getSupabaseClient } from "../client";
import type { Conversation, ConversationChannel, ConversationRole } from "@rupzone/shared-types";

export interface InsertConversationInput {
  business_id: string;
  customer_id: string;
  channel: ConversationChannel;
  role: ConversationRole;
  message: string;
  meta?: Record<string, unknown> | null;
}

export async function insertConversation(
  input: InsertConversationInput
): Promise<Conversation> {
  const { data, error } = await getSupabaseClient()
    .from("conversations")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as Conversation;
}

/** Cross-channel history for one customer, oldest first (for prompt context). */
export async function listRecentConversations(
  customerId: string,
  limit = 10
): Promise<Conversation[]> {
  const { data, error } = await getSupabaseClient()
    .from("conversations")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as Conversation[]).reverse();
}
