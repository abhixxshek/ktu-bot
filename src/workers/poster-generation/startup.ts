import { closeDB, initDB } from "../../db/connection.js";
import logger from "../../utils/logger.js";
import { posterGenerationQueue } from "./queue.js";
import { createPosterGenerationProcessor } from "./worker.js";
import { startWorkerMonitoring } from "../shared/start-worker.js";
import { createWorker } from "../shared/worker-runtime.js";

const serviceName = "poster-generation-worker";

async function start(): Promise<void> {
  try {
    const db = await initDB({ applicationName: serviceName });

    const processor = createPosterGenerationProcessor({ dbInstance: db });

    const worker = await createWorker({
      workerName: serviceName,
      queue: posterGenerationQueue,
      processor,
      concurrency: 2,
    });

    const port = Number(process.env.POSTER_WORKER_PORT ?? 4005);

    startWorkerMonitoring({
      worker,
      queue: posterGenerationQueue,
      serviceName,
      port,
      closeDB,
    });

    logger.info({ serviceName, port }, "Poster generation worker started");
  } catch (error) {
    logger.error({ err: error, serviceName }, "Failed to start poster generation worker");
    process.exit(1);
  }
}

void start();

