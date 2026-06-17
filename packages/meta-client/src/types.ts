/** Meta sends one POST per batch of page changes. */
export interface MetaWebhookPayload {
  object: string;
  entry: MetaWebhookEntry[];
}

export interface MetaWebhookEntry {
  /** The Facebook Page ID this entry belongs to. */
  id: string;
  time?: number;
  changes: MetaWebhookChange[];
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
