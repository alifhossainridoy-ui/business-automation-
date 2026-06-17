"use server";

import { revalidatePath } from "next/cache";
import { getBusiness, getCommentLogEntry, insertCommentLog } from "@rupzone/db";
import { unhideComment } from "@rupzone/meta-client";

/**
 * Undo is only meaningful for "hidden" comments — Meta's Graph API lets you
 * un-hide. Deleted comments cannot be restored via the API at all, and a
 * "replied" entry's private_reply (a Messenger message) can't be recalled
 * either, so this action only ever runs against hide outcomes.
 */
export async function undoHideAction(logId: string): Promise<void> {
  const entry = await getCommentLogEntry(logId);
  if (!entry || entry.action !== "hidden") {
    throw new Error("Undo is only available for hidden comments");
  }

  const business = await getBusiness(entry.business_id);
  if (!business?.fb_page_token) {
    throw new Error("Business has no fb_page_token configured");
  }

  await unhideComment(entry.comment_id!, business.fb_page_token);

  await insertCommentLog({
    business_id: entry.business_id,
    comment_id: entry.comment_id!,
    author: entry.author,
    text: entry.text,
    category: entry.category ?? "normal",
    action: "none",
  });

  revalidatePath("/comments");
}
