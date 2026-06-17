import { listBusinesses, listLeads } from "@rupzone/db";
import type { Lead, LeadStatus } from "@rupzone/shared-types";
import { importLeadsAction, markLeadConfirmedAction } from "./actions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  shipped: "Shipped",
  lost: "Lost",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { business?: string };
}) {
  const businesses = await listBusinesses();
  const selectedBusinessId = searchParams.business ?? businesses[0]?.id;
  const leads = selectedBusinessId ? await listLeads(selectedBusinessId) : [];

  const counts = countByStatus(leads);

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Leads</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Import leads from CSV (columns: <code>phone</code> required,{" "}
        <code>name</code>, <code>product</code>, <code>note</code> optional).
        New leads are auto-targeted the next time a campaign runs on the{" "}
        <a href="/campaigns" className="underline">
          Campaigns
        </a>{" "}
        page. Moving a lead to Confirmed is a manual step here.
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

      <form
        action={importLeadsAction}
        className="mt-8 space-y-3 rounded-lg border border-neutral-200 p-4"
      >
        <input type="hidden" name="business_id" value={selectedBusinessId ?? ""} />
        <div>
          <label className="block text-sm font-medium text-neutral-700">CSV file</label>
          <input type="file" name="csv" accept=".csv" required className="mt-1 block text-sm" />
        </div>
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Import
        </button>
      </form>

      <div className="mt-8 flex flex-wrap gap-2 text-sm">
        {(Object.keys(STATUS_LABEL) as LeadStatus[]).map((status) => (
          <span
            key={status}
            className="rounded-full border border-neutral-300 px-3 py-1 text-neutral-700"
          >
            {STATUS_LABEL[status]}: {counts[status] ?? 0}
          </span>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100 text-neutral-600">
            <tr>
              <th className="px-4 py-2">Updated</th>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Note</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  No leads yet.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-neutral-200">
                <td className="px-4 py-2 whitespace-nowrap text-neutral-500">
                  {new Date(lead.updated_at).toLocaleString()}
                </td>
                <td className="px-4 py-2">{lead.product ?? "—"}</td>
                <td className="px-4 py-2 max-w-xs truncate">{lead.note ?? "—"}</td>
                <td className="px-4 py-2 capitalize">{STATUS_LABEL[lead.status]}</td>
                <td className="px-4 py-2">
                  {lead.status === "new" || lead.status === "contacted" ? (
                    <form action={markLeadConfirmedAction.bind(null, lead.id)}>
                      <button
                        type="submit"
                        className="rounded-md border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100"
                      >
                        Mark Confirmed
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-neutral-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function countByStatus(leads: Lead[]): Partial<Record<LeadStatus, number>> {
  const counts: Partial<Record<LeadStatus, number>> = {};
  for (const lead of leads) {
    counts[lead.status] = (counts[lead.status] ?? 0) + 1;
  }
  return counts;
}
