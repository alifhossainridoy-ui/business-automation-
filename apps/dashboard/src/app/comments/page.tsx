import { listBusinesses, listCommentLog } from "@rupzone/db";
import { undoHideAction } from "./actions";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  deleted: "Deleted",
  hidden: "Hidden",
  replied: "Replied",
  none: "No action",
};

export default async function CommentsPage({
  searchParams,
}: {
  searchParams: { business?: string };
}) {
  const businesses = await listBusinesses();
  const selectedId = searchParams.business ?? businesses[0]?.id;
  const log = selectedId ? await listCommentLog(selectedId, 100) : [];

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Comments</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Every moderation outcome — deleted, hidden, replied, or left alone —
        is logged here for audit. Undo is only possible for hidden comments;
        Meta&apos;s API doesn&apos;t support restoring a deleted comment.
      </p>

      <form method="get" className="mt-6 flex items-center gap-3">
        <label className="text-sm font-medium text-neutral-700">Business</label>
        <select
          name="business"
          defaultValue={selectedId}
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

      <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-100 text-neutral-600">
            <tr>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Author</th>
              <th className="px-4 py-2">Comment</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Undo</th>
            </tr>
          </thead>
          <tbody>
            {log.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-neutral-500">
                  No comment activity yet.
                </td>
              </tr>
            )}
            {log.map((entry) => (
              <tr key={entry.id} className="border-t border-neutral-200">
                <td className="px-4 py-2 whitespace-nowrap text-neutral-500">
                  {new Date(entry.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2">{entry.author ?? "—"}</td>
                <td className="px-4 py-2 max-w-sm truncate">{entry.text ?? "—"}</td>
                <td className="px-4 py-2 capitalize">{entry.category ?? "—"}</td>
                <td className="px-4 py-2">
                  {entry.action ? ACTION_LABEL[entry.action] ?? entry.action : "—"}
                </td>
                <td className="px-4 py-2">
                  {entry.action === "hidden" ? (
                    <form action={undoHideAction.bind(null, entry.id)}>
                      <button
                        type="submit"
                        className="rounded-md border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100"
                      >
                        Unhide
                      </button>
                    </form>
                  ) : entry.action === "deleted" ? (
                    <span className="text-xs text-neutral-400" title="Meta's API can't restore a deleted comment">
                      Not reversible
                    </span>
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
