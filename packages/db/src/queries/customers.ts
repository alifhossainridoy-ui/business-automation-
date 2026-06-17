import { getSupabaseClient } from "../client";
import type { Customer } from "@rupzone/shared-types";

export interface FindOrCreateCustomerInput {
  business_id: string;
  phone?: string | null;
  fb_psid?: string | null;
  wa_id?: string | null;
  name?: string | null;
  source?: string | null;
}

/**
 * Finds the customer an inbound message belongs to, or creates one.
 * Looked up by phone first (the cross-channel key), then by whichever
 * channel id the event carries. If an existing customer is missing the
 * channel id this event came in on, backfills it — this is how a customer
 * already known on one channel gets linked to another, once both carry the
 * same phone number.
 */
export async function findOrCreateCustomer(
  input: FindOrCreateCustomerInput
): Promise<Customer> {
  const db = getSupabaseClient();
  const { business_id, phone, fb_psid, wa_id, name, source } = input;

  let existing: Customer | null = null;

  for (const [column, value] of [
    ["phone", phone],
    ["fb_psid", fb_psid],
    ["wa_id", wa_id],
  ] as const) {
    if (existing || !value) continue;
    const { data, error } = await db
      .from("customers")
      .select("*")
      .eq("business_id", business_id)
      .eq(column, value)
      .maybeSingle();
    if (error) throw error;
    existing = data as Customer | null;
  }

  if (existing) {
    const patch: Partial<Customer> = {};
    if (phone && !existing.phone) patch.phone = phone;
    if (fb_psid && !existing.fb_psid) patch.fb_psid = fb_psid;
    if (wa_id && !existing.wa_id) patch.wa_id = wa_id;
    if (name && !existing.name) patch.name = name;

    if (Object.keys(patch).length === 0) return existing;

    const { data, error } = await db
      .from("customers")
      .update(patch)
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data as Customer;
  }

  const { data, error } = await db
    .from("customers")
    .insert({
      business_id,
      phone: phone ?? null,
      fb_psid: fb_psid ?? null,
      wa_id: wa_id ?? null,
      name: name ?? null,
      source: source ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Customer;
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const { data, error } = await getSupabaseClient()
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Customer | null;
}

export async function listCustomers(businessId: string, limit = 50): Promise<Customer[]> {
  const { data, error } = await getSupabaseClient()
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Customer[];
}
