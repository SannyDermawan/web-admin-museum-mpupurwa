// Reads backend/.env (see .env.example). Import this file before anything that needs env values.
import "dotenv/config";

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (isProduction) throw new Error("SESSION_SECRET must be set when NODE_ENV=production");
  // Development fallback only.
  return "dev-only-secret-change-me";
}

export const config = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || 5000,
  /** The only origin allowed by CORS (the Next.js frontend). */
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  /** Signs the login cookie. */
  sessionSecret: getSessionSecret(),
};
