import dotenv from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const envCandidates = [
  resolve(process.cwd(), ".env"),
  resolve(process.cwd(), "../../.env"),
];
const envPath = envCandidates.find((candidate) => existsSync(candidate));

if (envPath) {
  dotenv.config({ path: envPath });
}

const envSchema = z.object({
  BOT_TOKEN: z.string().min(10),
  BACKEND_API_URL: z.string().url().default("http://localhost:3001"),
});

const parsed = envSchema.parse({
  BOT_TOKEN: process.env.BOT_TOKEN,
  BACKEND_API_URL: process.env.BACKEND_API_URL,
});

export const env = {
  botToken: parsed.BOT_TOKEN,
  backendApiUrl: parsed.BACKEND_API_URL,
};
    