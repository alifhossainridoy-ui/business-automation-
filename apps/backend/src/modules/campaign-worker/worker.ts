import { Worker, type Job } from "bullmq";
import { CAMPAIGN_QUEUE_NAME, getQueueConnection, type CampaignJobData } from "@rupzone/queue";
import { getBusiness, incrementCampaignFailed, incrementCampaignSent } from "@rupzone/db";
import { sendWhatsAppTemplate } from "@rupzone/whatsapp-client";
import { reportError } from "@rupzone/notify";
import { env } from "../../config/env";

/**
 * One shared, rate-limited worker for every business's campaign sends.
 * Only one business runs bulk WhatsApp campaigns today, and the actual
 * bottleneck is the Cloud API's own per-number throughput — split into
 * per-business queues if concurrent multi-business campaigns become an
 * issue later.
 */
export function startCampaignWorker(): Worker<CampaignJobData> {
  return new Worker<CampaignJobData>(
    CAMPAIGN_QUEUE_NAME,
    async (job: Job<CampaignJobData>) => {
      const { business_id, campaign_id, phone, template } = job.data;

      // Credential lookup lives inside the try too — a missing token must
      // still count as a failed send, or the campaign's sent+failed total
      // never reaches `total` and its status stays "running" forever.
      try {
        const business = await getBusiness(business_id);
        if (!business?.wa_token || !business.wa_phone_id) {
          throw new Error(`Business ${business_id} has no WhatsApp credentials configured`);
        }
        await sendWhatsAppTemplate(phone, template, "bn", business.wa_token, business.wa_phone_id);
        await incrementCampaignSent(campaign_id);
      } catch (err) {
        await incrementCampaignFailed(campaign_id);
        await reportError({
          source: "campaign-worker",
          message: err instanceof Error ? err.message : String(err),
          business_id,
          botToken: env.telegramBotToken,
          chatId: env.telegramChatId,
        }).catch(() => {});
        throw err;
      }
    },
    {
      connection: getQueueConnection(),
      limiter: { max: 5, duration: 1000 },
    }
  );
}
