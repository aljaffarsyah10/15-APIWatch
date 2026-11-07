import { logger } from "./lib/logger";
import { defaultRedisConnection } from "./lib/redis";
import { SchedulerPoller } from "./scheduler/poller";
import { createCheckWorker } from "./jobs/check.worker";
import {
  createAlertEmailWorker,
  createAlertWebhookWorker,
} from "./jobs/alert.worker";

async function bootstrap() {
  logger.info("WORKER_INITIALIZING", {
    nodeEnv: process.env.NODE_ENV,
    concurrency: process.env.WORKER_CONCURRENCY || "10",
  });

  // Start workers
  const checkWorker = createCheckWorker();
  const alertEmailWorker = createAlertEmailWorker();
  const alertWebhookWorker = createAlertWebhookWorker();

  // Start scheduler
  const scheduler = new SchedulerPoller();
  scheduler.start();

  logger.info("WORKER_READY", {
    queues: ["monitor-check", "alert-email", "alert-webhook"],
  });

  // Graceful shutdown handling
  let isShuttingDown = false;

  async function shutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info("WORKER_SHUTTING_DOWN", { signal });

    scheduler.stop();

    await Promise.allSettled([
      checkWorker.close(),
      alertEmailWorker.close(),
      alertWebhookWorker.close(),
      defaultRedisConnection.quit(),
    ]);

    logger.info("WORKER_SHUTDOWN_COMPLETED");
    process.exit(0);
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  logger.error("WORKER_FATAL_ERROR", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});
