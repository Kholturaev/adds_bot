import dotenv from "dotenv";

dotenv.config();

const DEFAULT_PORT = 3001;

export const env = {
  port: Number(process.env.API_PORT ?? DEFAULT_PORT),
  adminUsername: process.env.ADMIN_USERNAME ?? "admin",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin123",
};
