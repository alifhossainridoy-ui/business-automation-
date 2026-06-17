import { getSupabaseClient } from "../client";
import type { Business } from "@rupzone/shared-types";

export async function listBusinesses(): Promise<Business[]> {
  const { data, error } = await getSupabaseClient()
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data as Business[];
}

export async function getBusiness(businessId: string): Promise<Business | null> {
  const { data, error } = await getSupabaseClient()
    .from("businesses")
    .select("*")
    .eq("id", businessId)
    .maybeSingle();

  if (error) throw error;
  return data as Business | null;
}

/** Routes an incoming webhook event (keyed by Page ID) to its business. */
export async function getBusinessByFbPageId(fbPageId: string): Promise<Business | null> {
  const { data, error } = await getSupabaseClient()
    .from("businesses")
    .select("*")
    .eq("fb_page_id", fbPageId)
    .maybeSingle();

  if (error) throw error;
  return data as Business | null;
}

export type CreateBusinessInput = Partial<
  Omit<Business, "id" | "created_at">
> & { name: string };

export async function createBusiness(input: CreateBusinessInput): Promise<Business> {
  const { data, error } = await getSupabaseClient()
    .from("businesses")
    .insert(input)
    .select("*")
    .single();

  if (error) throw error;
  return data as Business;
}

export type UpdateBusinessInput = Partial<Omit<Business, "id" | "created_at">>;

export async function updateBusiness(
  businessId: string,
  input: UpdateBusinessInput
): Promise<Business> {
  const { data, error } = await getSupabaseClient()
    .from("businesses")
    .update(input)
    .eq("id", businessId)
    .select("*")
    .single();

  if (error) throw error;
  return data as Business;
}
