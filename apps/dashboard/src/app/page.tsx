import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">RupZone Automation</h1>
      <p className="mt-2 text-neutral-600">
        Phase 0 — foundation. Use Setup to register a business and enter its
        API tokens.
      </p>
      <Link
        href="/setup"
        className="mt-6 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Go to Setup →
      </Link>
    </main>
  );
}
