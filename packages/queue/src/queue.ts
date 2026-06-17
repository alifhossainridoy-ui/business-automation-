import { Queue } from "bullmq";
import IORedis from "ioredis";
import type { CampaignJobData } from "./types";

export const CAMPAIGN_QUEUE_NAME = "campaign-sends";

let connection: IORedis | null = null;
let queue: Queue<CampaignJobData> | null = null;

/**
 * One Redis connection shared by the queue producer (dashboard) and the
 * consumer (backend's in-process Worker) — BullMQ requires
 * maxRetriesPerRequest: null on connections used for blocking commands.
 */
export function getQueueConnection(): IORedis {
  if (!connection) {
    const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
    connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });
  }
  return connection;
}

/** Producer factory — the dashboard enqueues here on "Run"; the backend's Worker consumes the same queue. */
export function getCampaignQueue(): Queue<CampaignJobData> {
  if (!queue) {
    queue = new Queue<CampaignJobData>(CAMPAIGN_QUEUE_NAME, { connection: getQueueConnection() });
  }
  return queue;
}
