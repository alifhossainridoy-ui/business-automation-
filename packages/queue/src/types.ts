/** One job = one templated WhatsApp send to one lead's customer. */
export interface CampaignJobData {
  business_id: string;
  campaign_id: string;
  lead_id: string;
  customer_id: string;
  phone: string;
  template: string;
}
