import Fastify from "fastify";
import { env } from "./config/env";
import { healthRoute } from "./routes/health";
import { metaWebhookRoutes } from "./routes/webhooks/meta";
import { startCampaignWorker } from "./modules/campaign-worker";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(healthRoute);
  await app.register(metaWebhookRoutes);

  // In-process BullMQ worker for bulk WhatsApp campaign sends (Phase 3) —
  // no separate service, same backend process, rate-limited consumer of
  // the queue the dashboard enqueues into on "Run".
  startCampaignWorker();

  await app.listen({ port: env.port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
