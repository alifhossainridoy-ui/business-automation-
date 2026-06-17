import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">RupZone Automation</h1>
      <p className="mt-2 text-neutral-600">
        Phase 3 — bulk + leads live. Use Setup to register a business and
        enter its API tokens, Comments for the moderation log, Inbox for
        Messenger/WhatsApp conversations, Training to correct Rupa&apos;s
        knowledge, Leads to import and track customers, and Campaigns to
        send bulk WhatsApp templates.
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
        <Link
          href="/leads"
          className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Go to Leads →
        </Link>
        <Link
          href="/campaigns"
          className="inline-block rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
        >
          Go to Campaigns →
        </Link>
      </div>
    </main>
  );
}
