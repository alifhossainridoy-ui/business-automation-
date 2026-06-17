import Link from "next/link";
import { listBusinesses, listCustomers, listRecentConversations } from "@rupzone/db";

export const dynamic = "force-dynamic";

const CHANNEL_LABEL: Record<string, string> = {
  messenger: "Messenger",
  whatsapp: "WhatsApp",
};

export default async function InboxPage({
  searchParams,
}: {
  searchParams: { business?: string; customer?: string };
}) {
  const businesses = await listBusinesses();
  const selectedBusinessId = searchParams.business ?? businesses[0]?.id;
  const customers = selectedBusinessId ? await listCustomers(selectedBusinessId, 50) : [];
  const selectedCustomerId = searchParams.customer ?? customers[0]?.id;
  const thread = selectedCustomerId ? await listRecentConversations(selectedCustomerId, 200) : [];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Rupa&apos;s Messenger and WhatsApp conversations, read-only. One customer can show
        messages from both channels — that&apos;s the cross-channel memory at work.
      </p>

      <form method="get" className="mt-6 flex items-center gap-3">
        <label className="text-sm font-medium text-neutral-700">Business</label>
        <select
          name="business"
          defaultValue={selectedBusinessId}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
        >
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100"
        >
          View
        </button>
      </form>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="col-span-1 overflow-y-auto rounded-lg border border-neutral-200">
          {customers.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-neutral-500">No customers yet.</p>
          )}
          {customers.map((c) => (
            <Link
              key={c.id}
              href={`/inbox?business=${selectedBusinessId}&customer=${c.id}`}
              className={`block border-b border-neutral-200 px-4 py-3 text-sm hover:bg-neutral-50 ${
                c.id === selectedCustomerId ? "bg-neutral-100" : ""
              }`}
            >
              <div className="font-medium">{c.name ?? c.phone ?? c.wa_id ?? c.fb_psid ?? "Unknown"}</div>
              <div className="text-xs text-neutral-500">
                {[c.fb_psid && "Messenger", c.wa_id && "WhatsApp"].filter(Boolean).join(" + ") ||
                  "—"}
              </div>
            </Link>
          ))}
        </div>

        <div className="col-span-2 rounded-lg border border-neutral-200 p-4">
          {thread.length === 0 && (
            <p className="py-6 text-center text-sm text-neutral-500">
              {selectedCustomerId ? "No messages yet." : "Select a customer to view the thread."}
            </p>
          )}
          <div className="space-y-3">
            {thread.map((m) => (
              <div
                key={m.id}
                className={`max-w-md rounded-lg px-3 py-2 text-sm ${
                  m.role === "agent"
                    ? "ml-auto bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-900"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wide opacity-60">
                  {CHANNEL_LABEL[m.channel] ?? m.channel} ·{" "}
                  {new Date(m.created_at).toLocaleString()}
                </div>
                <div className="mt-1 whitespace-pre-wrap">{m.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
