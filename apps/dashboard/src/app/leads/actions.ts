"use server";

import { revalidatePath } from "next/cache";
import { findOrCreateCustomer, insertLead, updateLeadStatus } from "@rupzone/db";

export async function importLeadsAction(formData: FormData): Promise<void> {
  const business_id = String(formData.get("business_id") ?? "");
  const file = formData.get("csv");

  if (!business_id || !(file instanceof File) || file.size === 0) {
    throw new Error("Business and a CSV file are required");
  }

  const rows = parseCsv(await file.text());

  for (const row of rows) {
    const phone = row.phone?.trim();
    if (!phone) continue;

    const customer = await findOrCreateCustomer({
      business_id,
      phone,
      name: row.name?.trim() || null,
      source: "csv_import",
    });

    await insertLead({
      business_id,
      customer_id: customer.id,
      product: row.product?.trim() || null,
      note: row.note?.trim() || null,
    });
  }

  revalidatePath("/leads");
}

/**
 * Manual, not AI-inferred — a false-positive "confirmed" would fire a
 * Pixel Purchase event downstream with no real order behind it.
 */
export async function markLeadConfirmedAction(leadId: string): Promise<void> {
  await updateLeadStatus(leadId, "confirmed");
  await notifyOrderConfirmed(leadId);
  revalidatePath("/leads");
}

/** Placeholder: WooCommerce order sync + Meta Pixel Purchase event are both pending real credentials/schema fields. */
async function notifyOrderConfirmed(leadId: string): Promise<void> {
  console.log(`[placeholder] order confirmed for lead ${leadId} — WooCommerce/Pixel integration pending`);
}

/** Simple comma-split parser — operator-supplied CSVs only, no quoted-field/embedded-comma support. */
function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = (cells[i] ?? "").trim();
    });
    return row;
  });
}
