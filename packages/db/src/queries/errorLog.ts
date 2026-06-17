import { getSupabaseClient } from "../client";
import type { ErrorLogEntry } from "@rupzone/shared-types";

export interface InsertErrorLogInput {
  business_id?: string | null;
  source: string;
  message: string;
}

export async function insertErrorLog(input: InsertErrorLogInput): Promise<void> {
  const { error } = await getSupabaseClient().from("error_log").insert(input);
  if (error) throw error;
}

/** Most recent errors across every business — the Health page's "Recent errors" feed. */
export async function listRecentErrorLogs(limit = 20): Promise<ErrorLogEntry[]> {
  const { data, error } = await getSupabaseClient()
    .from("error_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as ErrorLogEntry[];
}
