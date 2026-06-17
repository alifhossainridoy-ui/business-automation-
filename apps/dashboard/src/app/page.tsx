import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">RupZone Automation</h1>
      <p className="mt-2 text-neutral-600">
        Phase 2 — agent (Rupa) live. Use Setup to register a business and
        enter its API tokens, Comments for the moderation log, Inbox for
        Messenger/WhatsApp conversations, and Training to correct Rupa&apos;s
        knowledge.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/setup"
          className="inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Go to Setup →
        </Link>
        <Link
          href="/comments"
          className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Go to Comments →
        </Link>
        <Link
          href="/inbox"
          className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Go to Inbox →
        </Link>
        <Link
          href="/training"
          className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Go to Training →
        </Link>
      </div>
    </main>
  );
}
