import { getSupabaseClient } from "../client";
import type { CommentLogEntry, CommentAction, CommentLogCategory } from "@rupzone/shared-types";

export interface InsertCommentLogInput {
  business_id: string;
  comment_id: string;
  author: string | null;
  text: string | null;
  category: CommentLogCategory;
  action: CommentAction;
}

export async function insertCommentLog(
  input: InsertCommentLogInput
): Promise<CommentLogEntry> {
  const { data, error } = await getSupabaseClient()
    .from("comment_log")
    .insert(input)
    .select("*")
    .single();

  if (error) throw error;
  return data as CommentLogEntry;
}

export async function listCommentLog(
  businessId: string,
  limit = 100
): Promise<CommentLogEntry[]> {
  const { data, error } = await getSupabaseClient()
    .from("comment_log")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as CommentLogEntry[];
}

export async function getCommentLogEntry(id: string): Promise<CommentLogEntry | null> {
  const { data, error } = await getSupabaseClient()
    .from("comment_log")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as CommentLogEntry | null;
}
