/**
 * Abuse/profanity word-list for instant DELETE (no AI judgment needed —
 * build-brief rule #4). This ships as a structural placeholder only: real
 * Bengali (and English) slurs are intentionally not authored into the
 * codebase, mirroring how the blueprint itself redacts examples to
 * "[গালি]". The owner is expected to fill this list in directly.
 *
 * Matching is case-insensitive substring match against the comment text.
 */
export const ABUSE_WORDLIST: string[] = [
  // placeholder entries — replace/extend with real terms
  "example_abuse_term_1",
  "example_abuse_term_2",
];

export function matchesAbuseWordlist(text: string): boolean {
  const normalized = text.toLowerCase();
  return ABUSE_WORDLIST.some((term) => normalized.includes(term.toLowerCase()));
}
