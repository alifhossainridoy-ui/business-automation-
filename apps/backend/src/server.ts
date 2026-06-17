import Fastify from "fastify";
import { env } from "./config/env";
import { healthRoute } from "./routes/health";
import { metaWebhookRoutes } from "./routes/webhooks/meta";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(healthRoute);
  await app.register(metaWebhookRoutes);

  await app.listen({ port: env.port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
