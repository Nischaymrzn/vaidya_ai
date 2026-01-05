import { env } from "./config/env";
import { logger } from "./lib/logger";
import app from "./app";

app.listen(env.PORT || 5500, () => {
  logger.info("Server Started on port : " + env.PORT);
});
