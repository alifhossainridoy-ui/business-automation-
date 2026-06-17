import { getSupabaseClient } from "../client";
import type { ProductKbEntry } from "@rupzone/shared-types";

export async function insertProductKbEntry(
  businessId: string,
  content: string,
  embedding: number[]
): Promise<ProductKbEntry> {
  const { data, error } = await getSupabaseClient()
    .from("product_kb")
    .insert({ business_id: businessId, content, embedding })
    .select("id, business_id, content")
    .single();
  if (error) throw error;
  return data as ProductKbEntry;
}

/** pgvector cosine search via the match_product_kb RPC (see migration 0002). */
export async function searchProductKb(
  businessId: string,
  queryEmbedding: number[],
  matchCount = 4
): Promise<ProductKbEntry[]> {
  const { data, error } = await getSupabaseClient().rpc("match_product_kb", {
    p_business_id: businessId,
    query_embedding: queryEmbedding,
    match_count: matchCount,
  });
  if (error) throw error;
  return data as ProductKbEntry[];
}
