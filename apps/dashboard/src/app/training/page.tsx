import { listBusinesses, listCorrections } from "@rupzone/db";
import { addCorrectionAction, applyCorrectionAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function TrainingPage({
  searchParams,
}: {
  searchParams: { business?: string };
}) {
  const businesses = await listBusinesses();
  const selectedBusinessId = searchParams.business ?? businesses[0]?.id;
  const corrections = selectedBusinessId ? await listCorrections(selectedBusinessId) : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Training</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Rupa gets better by improving data, not by retraining a model. When she answers a
        question wrong, write the right answer here — applying it embeds it into{" "}
        <code>product_kb</code> so she retrieves it correctly next time.
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

      <form action={addCorrectionAction} className="mt-8 space-y-3 rounded-lg border border-neutral-200 p-4">
        <input type="hidden" name="business_id" value={selectedBusinessId ?? ""} />
        <div>
          <label className="block text-sm font-medium text-neutral-700">Customer's question</label>
          <input
            name="question"
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">What Rupa said (wrong)</label>
          <textarea
            name="wrong_answer"
            rows={2}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Correct answer</label>
          <textarea
            name="right_answer"
            required
            rows={2}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Save correction
        </button>
      </form>

      <div className="mt-8 space-y-3">
        {corrections.length === 0 && (
          <p className="text-center text-sm text-neutral-500">No corrections yet.</p>
        )}
        {corrections.map((c) => (
          <div key={c.id} className="rounded-lg border border-neutral-200 p-4 text-sm">
            <div className="font-medium">{c.question}</div>
            {c.wrong_answer && (
              <div className="mt-1 text-neutral-500 line-through">{c.wrong_answer}</div>
            )}
            <div className="mt-1 text-neutral-900">{c.right_answer}</div>
            <div className="mt-3">
              {c.applied ? (
                <span className="text-xs text-neutral-400">Applied to product_kb</span>
              ) : (
                <form action={applyCorrectionAction.bind(null, c.id)}>
                  <button
                    type="submit"
                    className="rounded-md border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100"
                  >
                    Apply to product_kb
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
