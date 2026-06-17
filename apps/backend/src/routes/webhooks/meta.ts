import type { FastifyInstance, FastifyRequest } from "fastify";
import { verifyMetaSignature, type MetaWebhookPayload } from "@rupzone/meta-client";
import type { WhatsAppWebhookPayload } from "@rupzone/whatsapp-client";
import { getBusinessByFbPageId, getBusinessByWaPhoneId } from "@rupzone/db";
import { env } from "../../config/env";
import { processComment } from "../../modules/comment-engine";
import { handleInboundMessage } from "../../modules/agent";
import { onCustomerReply } from "../../modules/leads";

interface VerifyQuery {
  "hub.mode"?: string;
  "hub.verify_token"?: string;
  "hub.challenge"?: string;
}

interface RequestWithRawBody extends FastifyRequest {
  rawBody?: string;
}

export async function metaWebhookRoutes(app: FastifyInstance) {
  // Capture the raw JSON body (needed for X-Hub-Signature-256 verification)
  // before Fastify parses it. Scoped to this plugin's encapsulation context
  // only, not the whole app.
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (request: RequestWithRawBody, body: string, done) => {
      request.rawBody = body;
      try {
        done(null, body.length ? JSON.parse(body) : {});
      } catch (err) {
        done(err as Error, undefined);
      }
    }
  );

  // Meta's one-time webhook subscription handshake.
  app.get<{ Querystring: VerifyQuery }>("/webhooks/meta", async (request, reply) => {
    const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } =
      request.query;

    if (mode === "subscribe" && token === env.metaWebhookVerifyToken && challenge) {
      reply.send(challenge);
      return;
    }
    reply.code(403).send("Verification failed");
  });

  // One App-level callback URL handles every subscribed product (Page
  // comments + Messenger, and WhatsApp Business Account), distinguished by
  // the top-level `object` field — Meta does not give each product its own
  // webhook URL, so we don't either.
  app.post("/webhooks/meta", async (request: RequestWithRawBody, reply) => {
    const signature = request.headers["x-hub-signature-256"] as string | undefined;

    if (!verifyMetaSignature(request.rawBody ?? "", signature, env.metaAppSecret)) {
      reply.code(401).send("Invalid signature");
      return;
    }

    // Acknowledge immediately; volume is low enough to process inline after
    // responding (no queue needed here — BullMQ is reserved for bulk
    // WhatsApp campaign sends per the architecture, Phase 3).
    reply.code(200).send("EVENT_RECEIVED");

    const payload = request.body as { object?: string };
    if (payload.object === "whatsapp_business_account") {
      await routeWhatsAppPayload(payload as WhatsAppWebhookPayload);
    } else {
      await routePagePayload(payload as MetaWebhookPayload);
    }
  });
}

/** Page-object events: feed changes (comments, Phase 1) and Messenger messages (Phase 2). */
async function routePagePayload(payload: MetaWebhookPayload): Promise<void> {
  if (!payload?.entry) return;

  for (const entry of payload.entry) {
    const business = await getBusinessByFbPageId(entry.id);
    if (!business) {
      console.error(`No business registered for fb_page_id ${entry.id}`);
      continue;
    }

    for (const change of entry.changes ?? []) {
      if (change.field !== "feed") continue;
      if (change.value.item !== "comment" || change.value.verb !== "add") continue;

      await processComment(change.value, business).catch((err) => {
        console.error("Failed to process comment:", err);
      });
    }

    for (const event of entry.messaging ?? []) {
      const text = event.message?.text;
      if (!text) continue;

      await handleInboundMessage(business, {
        channel: "messenger",
        text,
        fb_psid: event.sender.id,
      }).catch((err) => {
        console.error("Failed to process Messenger message:", err);
      });
    }
  }
}

/** whatsapp_business_account-object events: inbound WhatsApp messages. */
async function routeWhatsAppPayload(payload: WhatsAppWebhookPayload): Promise<void> {
  if (!payload?.entry) return;

  for (const entry of payload.entry) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;

      const business = await getBusinessByWaPhoneId(change.value.metadata.phone_number_id);
      if (!business) {
        console.error(
          `No business registered for wa_phone_id ${change.value.metadata.phone_number_id}`
        );
        continue;
      }

      for (const message of change.value.messages ?? []) {
        if (!message.text?.body) continue;
        const name = change.value.contacts?.find((c) => c.wa_id === message.from)?.profile?.name;

        const customer = await handleInboundMessage(business, {
          channel: "whatsapp",
          text: message.text.body,
          wa_id: message.from,
          name,
        }).catch((err) => {
          console.error("Failed to process WhatsApp message:", err);
          return undefined;
        });

        if (customer) {
          await onCustomerReply(business, customer.id).catch((err) => {
            console.error("Failed to process lead reply tracking:", err);
          });
        }
      }
    }
  }
}
