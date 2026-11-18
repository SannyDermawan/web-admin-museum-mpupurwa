import { app } from "./app";
import { config } from "./config";
import { logger } from "./lib/logger";

const server = app.listen(config.port, () => {
  logger.info(`Backend running on http://localhost:${config.port} (${config.nodeEnv})`);
  logger.info(`Allowing requests from ${config.frontendUrl}`);
});

// Last line of defence: record the problem before the process dies, so the cause is in the log.
process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception, shutting down");
  server.close(() => process.exit(1));
  // If connections do not close in time, stop anyway.
  setTimeout(() => process.exit(1), 5000).unref();
});
