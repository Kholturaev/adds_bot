import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

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
