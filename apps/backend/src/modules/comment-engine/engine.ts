import type { Business, CommentLogCategory } from "@rupzone/shared-types";
import type { MetaCommentChangeValue } from "@rupzone/meta-client";
import { hideComment, deleteComment, replyToComment, sendPrivateReply } from "@rupzone/meta-client";
import { findBlocklistEntry, insertCommentLog } from "@rupzone/db";
import { matchesAbuseWordlist } from "./wordlist";
import { classifyComment } from "./classifier";

const PRICE_REPLY_TEXT =
  "ধন্যবাদ আপু! দাম ও অর্ডার ডিটেইলস ইনবক্সে পাঠিয়ে দিচ্ছি 💝";
const PRICE_PRIVATE_REPLY_TEXT =
  "আসসালামু আলাইকুম! আপনার প্রশ্নের জন্য ধন্যবাদ। প্রোডাক্টের দাম ও অর্ডার করার নিয়ম নিচে দেওয়া হলো — আরও কিছু জানতে চাইলে এখানেই লিখুন।";

/**
 * Processes one inbound comment event end-to-end for a single business:
 * blocklist → abuse word-list → AI classifier → dispatch action → log.
 * Every branch logs to comment_log (build-brief rule #5), scoped by
 * business_id (rule #1).
 */
export async function processComment(
  value: MetaCommentChangeValue,
  business: Business
): Promise<void> {
  const commentId = value.comment_id;
  const text = value.message ?? "";
  const author = value.sender_name ?? value.sender_id;
  const pageToken = business.fb_page_token;

  if (!pageToken) {
    console.error(`Business ${business.id} has no fb_page_token; skipping comment ${commentId}`);
    return;
  }

  // 1. Blocklist — silent hide, no AI needed.
  const blocked = await findBlocklistEntry(business.id, value.sender_id);
  if (blocked) {
    await safeguard(() => hideComment(commentId, pageToken));
    await logResult(business.id, commentId, author, text, "blocklist", "hidden");
    return;
  }

  // 2. Abuse word-list — instant delete, no judgment needed.
  if (matchesAbuseWordlist(text)) {
    await safeguard(() => deleteComment(commentId, pageToken));
    await logResult(business.id, commentId, author, text, "abuse", "deleted");
    return;
  }

  // 3. AI classifier (via aiClient — rule #3).
  if (!business.openrouter_api_key) {
    console.error(`Business ${business.id} has no openrouter_api_key; skipping comment ${commentId}`);
    return;
  }

  const category = await classifyComment(text, business.openrouter_api_key, business.ai_model);

  switch (category) {
    case "abuse":
      // Word-list missed it but the model is confident — never delete on
      // classifier judgment alone would be safer, but rule #4 says abuse
      // always deletes regardless of detection method.
      await safeguard(() => deleteComment(commentId, pageToken));
      await logResult(business.id, commentId, author, text, "abuse", "deleted");
      break;

    case "negative":
    case "spam":
      // Never delete — hide only (rule #4).
      await safeguard(() => hideComment(commentId, pageToken));
      await logResult(business.id, commentId, author, text, category, "hidden");
      break;

    case "price":
      await safeguard(() => replyToComment(commentId, PRICE_REPLY_TEXT, pageToken));
      await safeguard(() => sendPrivateReply(commentId, PRICE_PRIVATE_REPLY_TEXT, pageToken));
      await logResult(business.id, commentId, author, text, "price", "replied");
      break;

    case "normal":
    default:
      await logResult(business.id, commentId, author, text, "normal", "none");
      break;
  }
}

async function safeguard(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (err) {
    console.error("Comment-engine Graph API call failed:", err);
  }
}

async function logResult(
  businessId: string,
  commentId: string,
  author: string,
  text: string,
  category: CommentLogCategory,
  action: "deleted" | "hidden" | "replied" | "none"
): Promise<void> {
  await insertCommentLog({
    business_id: businessId,
    comment_id: commentId,
    author,
    text,
    category,
    action,
  });
}
