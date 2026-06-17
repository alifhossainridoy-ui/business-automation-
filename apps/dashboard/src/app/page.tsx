import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">RupZone Automation</h1>
      <p className="mt-2 text-neutral-600">
        Phase 1 — comment engine live. Use Setup to register a business and
        enter its API tokens, then check Comments for the moderation log.
      </p>
      <div className="mt-6 flex gap-3">
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
      </div>
    </main>
  );
}
