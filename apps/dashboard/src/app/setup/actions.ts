"use server";

import { revalidatePath } from "next/cache";
import { createBusiness, updateBusiness } from "@rupzone/db";

export async function createBusinessAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    throw new Error("Business name is required");
  }

  await createBusiness({
    name,
    fb_page_id: emptyToNull(formData.get("fb_page_id")),
    fb_page_token: emptyToNull(formData.get("fb_page_token")),
    wa_phone_id: emptyToNull(formData.get("wa_phone_id")),
    wa_token: emptyToNull(formData.get("wa_token")),
    openrouter_api_key: emptyToNull(formData.get("openrouter_api_key")),
    ai_model: String(formData.get("ai_model") || "moonshotai/kimi-k2"),
    persona: emptyToNull(formData.get("persona")),
  });

  revalidatePath("/setup");
}

export async function updateBusinessAction(businessId: string, formData: FormData) {
  await updateBusiness(businessId, {
    fb_page_id: emptyToNull(formData.get("fb_page_id")),
    fb_page_token: emptyToNull(formData.get("fb_page_token")),
    wa_phone_id: emptyToNull(formData.get("wa_phone_id")),
    wa_token: emptyToNull(formData.get("wa_token")),
    openrouter_api_key: emptyToNull(formData.get("openrouter_api_key")),
    ai_model: String(formData.get("ai_model") || "moonshotai/kimi-k2"),
    persona: emptyToNull(formData.get("persona")),
  });

  revalidatePath("/setup");
}

function emptyToNull(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? "").trim();
  return str.length > 0 ? str : null;
}
