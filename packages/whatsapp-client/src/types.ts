/**
 * WhatsApp Cloud API webhooks arrive on the same App-level callback URL as
 * Page events, distinguished by `object: "whatsapp_business_account"` —
 * this is a different payload shape from MetaWebhookPayload, not a variant
 * of it.
 */
export interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppWebhookEntry[];
}

export interface WhatsAppWebhookEntry {
  /** WhatsApp Business Account ID. */
  id: string;
  changes: WhatsAppWebhookChange[];
}

export interface WhatsAppWebhookChange {
  field: string;
  value: WhatsAppMessageValue;
}

export interface WhatsAppMessageValue {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: Array<{
    profile?: { name?: string };
    wa_id: string;
  }>;
  messages?: WhatsAppInboundMessage[];
}

export interface WhatsAppInboundMessage {
  from: string;
  id: string;
  timestamp?: string;
  type: string;
  text?: { body: string };
}
