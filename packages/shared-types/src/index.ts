export interface Business {
  id: string;
  name: string;
  fb_page_id: string | null;
  fb_page_token: string | null;
  wa_phone_id: string | null;
  wa_token: string | null;
  ai_model: string;
  openrouter_api_key: string | null;
  persona: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  phone: string | null;
  fb_psid: string | null;
  wa_id: string | null;
  name: string | null;
  tags: string[] | null;
  source: string | null;
  created_at: string;
}

export type ConversationChannel = "messenger" | "whatsapp";
export type ConversationRole = "customer" | "agent";

export interface Conversation {
  id: string;
  business_id: string;
  customer_id: string | null;
  channel: ConversationChannel;
  role: ConversationRole;
  message: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export type LeadStatus = "new" | "contacted" | "confirmed" | "shipped" | "lost";

export interface Lead {
  id: string;
  business_id: string;
  customer_id: string | null;
  status: LeadStatus;
  product: string | null;
  amount: number | null;
  note: string | null;
  updated_at: string;
}

export type CommentCategory = "abuse" | "negative" | "spam" | "price" | "normal";
export type CommentAction = "deleted" | "hidden" | "replied" | "none";

export interface CommentLogEntry {
  id: string;
  business_id: string;
  comment_id: string | null;
  author: string | null;
  text: string | null;
  category: CommentCategory | null;
  action: CommentAction | null;
  created_at: string;
}
