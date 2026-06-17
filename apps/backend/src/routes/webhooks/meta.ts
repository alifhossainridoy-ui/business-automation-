import type { FastifyInstance, FastifyRequest } from "fastify";
import { verifyMetaSignature, type MetaWebhookPayload } from "@rupzone/meta-client";
import { getBusinessByFbPageId } from "@rupzone/db";
import { env } from "../../config/env";
import { processComment } from "../../modules/comment-engine";

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

  // Inbound page events (comments only in Phase 1; messages land in Phase 2).
  app.post("/webhooks/meta", async (request: RequestWithRawBody, reply) => {
    const signature = request.headers["x-hub-signature-256"] as string | undefined;

    if (!verifyMetaSignature(request.rawBody ?? "", signature, env.metaAppSecret)) {
      reply.code(401).send("Invalid signature");
      return;
    }

    // Acknowledge immediately; comment volume is low enough to process
    // inline after responding (no queue needed here — BullMQ is reserved
    // for bulk WhatsApp sends per the architecture).
    reply.code(200).send("EVENT_RECEIVED");

    const payload = request.body as MetaWebhookPayload;
    await routeWebhookPayload(payload);
  });
}

async function routeWebhookPayload(payload: MetaWebhookPayload): Promise<void> {
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
  }
}
