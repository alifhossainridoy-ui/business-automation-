"use server";

import { revalidatePath } from "next/cache";
import {
  getBusiness,
  getCorrection,
  insertCorrection,
  insertProductKbEntry,
  markCorrectionApplied,
} from "@rupzone/db";
import { aiClient } from "@rupzone/ai-client";

export async function addCorrectionAction(formData: FormData): Promise<void> {
  const business_id = String(formData.get("business_id") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const wrong_answer = String(formData.get("wrong_answer") ?? "").trim();
  const right_answer = String(formData.get("right_answer") ?? "").trim();

  if (!business_id || !question || !right_answer) {
    throw new Error("Question and right answer are required");
  }

  await insertCorrection({ business_id, question, wrong_answer, right_answer });
  revalidatePath("/training");
}

/**
 * This is retrieval improvement, NOT fine-tuning: the correction is embedded
 * and stored as a normal product_kb row, so the next matching question
 * retrieves it via RAG — the model itself never gets retrained.
 */
export async function applyCorrectionAction(correctionId: string): Promise<void> {
  const correction = await getCorrection(correctionId);
  if (!correction) throw new Error("Correction not found");
  if (correction.applied) return;

  const business = await getBusiness(correction.business_id);
  if (!business?.openrouter_api_key) {
    throw new Error("Business has no openrouter_api_key configured");
  }

  const content = `প্রশ্ন: ${correction.question}\nউত্তর: ${correction.right_answer}`;
  const { embedding } = await aiClient.embed({
    apiKey: business.openrouter_api_key,
    input: content,
  });

  await insertProductKbEntry(business.id, content, embedding);
  await markCorrectionApplied(correction.id);

  revalidatePath("/training");
}
