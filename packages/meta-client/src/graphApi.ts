const GRAPH_BASE = "https://graph.facebook.com/v19.0";

async function graphPost(
  path: string,
  pageToken: string,
  body: Record<string, unknown>
): Promise<void> {
  const url = `${GRAPH_BASE}/${path}?access_token=${encodeURIComponent(pageToken)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph API ${path} failed (${res.status}): ${text}`);
  }
}

async function graphDelete(path: string, pageToken: string): Promise<void> {
  const url = `${GRAPH_BASE}/${path}?access_token=${encodeURIComponent(pageToken)}`;
  const res = await fetch(url, { method: "DELETE" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph API DELETE ${path} failed (${res.status}): ${text}`);
  }
}

/** Hides a comment — visible to the author, not to others. Reversible. */
export async function hideComment(commentId: string, pageToken: string): Promise<void> {
  await graphPost(commentId, pageToken, { is_hidden: true });
}

/** Reverses hideComment. */
export async function unhideComment(commentId: string, pageToken: string): Promise<void> {
  await graphPost(commentId, pageToken, { is_hidden: false });
}

/** Permanently deletes a comment. Not reversible via the Graph API. */
export async function deleteComment(commentId: string, pageToken: string): Promise<void> {
  await graphDelete(commentId, pageToken);
}

/** Posts a public reply comment. The reply itself can later be deleted as an undo. */
export async function replyToComment(
  commentId: string,
  message: string,
  pageToken: string
): Promise<void> {
  await graphPost(`${commentId}/comments`, pageToken, { message });
}

/**
 * Sends a private reply (Messenger-side message) in response to a comment.
 * Only valid shortly after the comment is made; not a comment object itself,
 * so it cannot be recalled/undone.
 */
export async function sendPrivateReply(
  commentId: string,
  message: string,
  pageToken: string
): Promise<void> {
  await graphPost(`${commentId}/private_replies`, pageToken, { message });
}
