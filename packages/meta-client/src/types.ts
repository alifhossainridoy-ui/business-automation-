/** Meta sends one POST per batch of page changes. */
export interface MetaWebhookPayload {
  object: string;
  entry: MetaWebhookEntry[];
}

export interface MetaWebhookEntry {
  /** The Facebook Page ID this entry belongs to. */
  id: string;
  time?: number;
  /** Present for "feed" (comment) events. */
  changes?: MetaWebhookChange[];
  /** Present for Messenger events — a different shape from `changes`. */
  messaging?: MetaMessagingEvent[];
}

export interface MetaWebhookChange {
  field: string;
  value: MetaCommentChangeValue;
}

/** Shape of `value` when `field === "feed"` and `value.item === "comment"`. */
export interface MetaCommentChangeValue {
  item: string;
  verb: "add" | "edited" | "remove" | string;
  comment_id: string;
  post_id?: string;
  parent_id?: string;
  sender_id: string;
  sender_name?: string;
  message?: string;
  created_time?: number;
}

/** One inbound Messenger message, as delivered in entry.messaging[]. */
export interface MetaMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp?: number;
  message?: {
    mid: string;
    text?: string;
  };
}
