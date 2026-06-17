"use server";

import { revalidatePath } from "next/cache";
import {
  assignLeadToCampaign,
  createCampaign,
  getBusiness,
  getCampaign,
  getCustomer,
  listUntargetedNewLeads,
  setCampaignTotal,
} from "@rupzone/db";
import { getCampaignQueue } from "@rupzone/queue";

export async function createCampaignAction(formData: FormData): Promise<void> {
  const business_id = String(formData.get("business_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const template = String(formData.get("template") ?? "").trim();

  if (!business_id || !name || !template) {
    throw new Error("Business, name, and template are required");
  }

  await createCampaign({ business_id, name, template });
  revalidatePath("/campaigns");
}

/**
 * Auto-targets every unattached "new" lead for this business, assigns each
 * to the campaign, and enqueues one rate-limited template-send job per
 * lead. The backend's in-process worker (packages/queue) sends them and
 * updates sent/failed as jobs complete.
 */
export async function runCampaignAction(campaignId: string): Promise<void> {
  const campaign = await getCampaign(campaignId);
  if (!campaign) throw new Error("Campaign not found");
  if (campaign.status !== "draft") return;
  if (!campaign.template) throw new Error("Campaign has no template configured");

  const business = await getBusiness(campaign.business_id);
  if (!business?.wa_token || !business.wa_phone_id) {
    throw new Error("Business has no WhatsApp credentials configured");
  }

  const leads = await listUntargetedNewLeads(campaign.business_id);

  const targets: Array<{ leadId: string; customerId: string; phone: string }> = [];
  for (const lead of leads) {
    if (!lead.customer_id) continue;
    const customer = await getCustomer(lead.customer_id);
    if (!customer?.phone) continue;
    targets.push({ leadId: lead.id, customerId: lead.customer_id, phone: customer.phone });
  }

  if (targets.length === 0) {
    throw new Error("No untargeted new leads with a phone number to send to");
  }

  for (const target of targets) {
    await assignLeadToCampaign(target.leadId, campaign.id);
  }
  await setCampaignTotal(campaign.id, targets.length);

  const queue = getCampaignQueue();
  for (const target of targets) {
    await queue.add("send", {
      business_id: campaign.business_id,
      campaign_id: campaign.id,
      lead_id: target.leadId,
      customer_id: target.customerId,
      phone: target.phone,
      template: campaign.template,
    });
  }

  revalidatePath("/campaigns");
}
