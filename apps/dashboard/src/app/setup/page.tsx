import { listBusinesses } from "@rupzone/db";
import { createBusinessAction, updateBusinessAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const businesses = await listBusinesses();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">Setup / Connections</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Every business&apos;s Facebook, WhatsApp, and OpenRouter
        credentials are entered here and stored in the <code>businesses</code>{" "}
        table — never hardcoded in source.
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Add a business</h2>
        <form action={createBusinessAction} className="mt-4 space-y-4">
          <TokenFields />
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Create business
          </button>
        </form>
      </section>

      <section className="mt-14">
        <h2 className="text-lg font-medium">Existing businesses</h2>
        {businesses.length === 0 && (
          <p className="mt-2 text-sm text-neutral-500">None yet.</p>
        )}
        <div className="mt-4 space-y-8">
          {businesses.map((business) => (
            <div key={business.id} className="rounded-lg border border-neutral-200 p-5">
              <h3 className="font-medium">{business.name}</h3>
              <p className="mt-1 text-xs text-neutral-500">id: {business.id}</p>
              <form
                action={updateBusinessAction.bind(null, business.id)}
                className="mt-4 space-y-4"
              >
                <TokenFields business={business} hideName />
                <button
                  type="submit"
                  className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-100"
                >
                  Save tokens
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function TokenFields({
  business,
  hideName,
}: {
  business?: {
    name: string;
    fb_page_id: string | null;
    fb_page_token: string | null;
    wa_phone_id: string | null;
    wa_token: string | null;
    openrouter_api_key: string | null;
    ai_model: string;
    persona: string | null;
  };
  hideName?: boolean;
}) {
  return (
    <>
      {!hideName && (
        <Field label="Business name" name="name" defaultValue={business?.name} required />
      )}
      <Field label="Facebook Page ID" name="fb_page_id" defaultValue={business?.fb_page_id} />
      <Field
        label="Facebook Page Token"
        name="fb_page_token"
        type="password"
        defaultValue={business?.fb_page_token}
      />
      <Field label="WhatsApp Phone ID" name="wa_phone_id" defaultValue={business?.wa_phone_id} />
      <Field
        label="WhatsApp Token"
        name="wa_token"
        type="password"
        defaultValue={business?.wa_token}
      />
      <Field
        label="OpenRouter API Key"
        name="openrouter_api_key"
        type="password"
        defaultValue={business?.openrouter_api_key}
      />
      <Field
        label="AI model (primary)"
        name="ai_model"
        defaultValue={business?.ai_model ?? "moonshotai/kimi-k2"}
      />
      <div>
        <label className="block text-sm font-medium text-neutral-700">Persona</label>
        <textarea
          name="persona"
          rows={3}
          defaultValue={business?.persona ?? ""}
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
    </div>
  );
}
