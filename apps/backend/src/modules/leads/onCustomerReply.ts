import type { Business } from "@rupzone/shared-types";
import {
  getActiveCampaignLeadByCustomer,
  incrementCampaignReplied,
  updateLeadStatus,
} from "@rupzone/db";

/**
 * A reply from a customer who has an open campaign-targeted lead means the
 * campaign reached them — flip the lead to "contacted" and credit the
 * campaign once. Runs alongside handleInboundMessage, not inside it: this
 * is lead-funnel bookkeeping, unrelated to what Rupa says back (rule #6).
 */
export async function onCustomerReply(business: Business, customerId: string): Promise<void> {
  const lead = await getActiveCampaignLeadByCustomer(business.id, customerId);
  if (!lead || !lead.campaign_id) return;

  await updateLeadStatus(lead.id, "contacted");
  await incrementCampaignReplied(lead.campaign_id);
}
