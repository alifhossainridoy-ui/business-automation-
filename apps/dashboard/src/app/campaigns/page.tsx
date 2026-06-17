import { listBusinesses, listCampaigns } from "@rupzone/db";
import { createCampaignAction, runCampaignAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: { business?: string };
}) {
  const businesses = await listBusinesses();
  const selectedBusinessId = searchParams.business ?? businesses[0]?.id;
  const campaigns = selectedBusinessId ? await listCampaigns(selectedBusinessId) : [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Campaigns</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Running a campaign sends an approved WhatsApp template to every
        unattached, "new"-status lead for this business (see{" "}
        <a href="/leads" className="underline">
          Leads
        </a>
        ), rate-limited through a shared queue so the WhatsApp Cloud API
        never gets hammered.
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
        action={createCampaignAction}
        className="mt-8 space-y-3 rounded-lg border border-neutral-200 p-4"
      >
        <input type="hidden" name="business_id" value={selectedBusinessId ?? ""} />
        <div>
          <label className="block text-sm font-medium text-neutral-700">Campaign name</label>
          <input
            name="name"
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Approved template name
          </label>
          <input
            name="template"
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Must already be approved in Meta Business Manager.
          </p>
        </div>
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Create campaign
        </button>
      </form>

      <div className="mt-8 space-y-3">
        {campaigns.length === 0 && (
          <p className="text-center text-sm text-neutral-500">No campaigns yet.</p>
        )}
        {campaigns.map((c) => (
          <div key={c.id} className="rounded-lg border border-neutral-200 p-4 text-sm">
            <div className="flex items-center justify-between">
              <div className="font-medium">{c.name}</div>
              <span className="text-xs uppercase text-neutral-500">{c.status}</span>
            </div>
            <div className="mt-1 text-neutral-500">Template: {c.template}</div>
            <div className="mt-2 flex gap-4 text-xs text-neutral-600">
              <span>Total: {c.total ?? "—"}</span>
              <span>Sent: {c.sent}</span>
              <span>Replied: {c.replied}</span>
              <span>Failed: {c.failed}</span>
            </div>
            {c.status === "draft" && (
              <form action={runCampaignAction.bind(null, c.id)} className="mt-3">
                <button
                  type="submit"
                  className="rounded-md border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100"
                >
                  Run
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
