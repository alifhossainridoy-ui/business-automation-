import { getSupabaseClient } from "../client";
import type { Lead, LeadStatus } from "@rupzone/shared-types";

export interface InsertLeadInput {
  business_id: string;
  customer_id: string;
  product?: string | null;
  amount?: number | null;
  note?: string | null;
}

export async function insertLead(input: InsertLeadInput): Promise<Lead> {
  const { data, error } = await getSupabaseClient()
    .from("leads")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as Lead;
}

export async function listLeads(businessId: string, limit = 200): Promise<Lead[]> {
  const { data, error } = await getSupabaseClient()
    .from("leads")
    .select("*")
    .eq("business_id", businessId)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Lead[];
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await getSupabaseClient()
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as Lead | null;
}

/** Leads never targeted by a campaign yet, still in "new" status — the auto-target pool when a campaign runs. */
export async function listUntargetedNewLeads(businessId: string): Promise<Lead[]> {
  const { data, error } = await getSupabaseClient()
    .from("leads")
    .select("*")
    .eq("business_id", businessId)
    .eq("status", "new")
    .is("campaign_id", null);
  if (error) throw error;
  return data as Lead[];
}

export async function assignLeadToCampaign(leadId: string, campaignId: string): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("leads")
    .update({ campaign_id: campaignId })
    .eq("id", leadId);
  if (error) throw error;
}

export async function updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
  const { error } = await getSupabaseClient()
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId);
  if (error) throw error;
}

/** The open campaign-targeted lead for a customer, if any — used to credit a campaign reply. */
export async function getActiveCampaignLeadByCustomer(
  businessId: string,
  customerId: string
): Promise<Lead | null> {
  const { data, error } = await getSupabaseClient()
    .from("leads")
    .select("*")
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .eq("status", "new")
    .not("campaign_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Lead | null;
}
