import { app } from "./app";
import { config } from "./config";

app.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port} (${config.nodeEnv})`);
  console.log(`Allowing requests from ${config.frontendUrl}`);
});
