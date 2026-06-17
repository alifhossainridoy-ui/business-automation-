import { getSupabaseClient } from "../client";
import type { Correction } from "@rupzone/shared-types";

export interface InsertCorrectionInput {
  business_id: string;
  question: string;
  wrong_answer: string;
  right_answer: string;
}

export async function insertCorrection(input: InsertCorrectionInput): Promise<Correction> {
  const { data, error } = await getSupabaseClient()
    .from("corrections")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as Correction;
}

export async function listCorrections(businessId: string, limit = 50): Promise<Correction[]> {
  const { data, error } = await getSupabaseClient()
    .from("corrections")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Correction[];
}

export async function getCorrection(id: string): Promise<Correction | null> {
  const { data, error } = await getSupabaseClient()
    .from("corrections")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Correction | null;
}

export async function markCorrectionApplied(id: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("corrections")
    .update({ applied: true })
    .eq("id", id);
  if (error) throw error;
}
