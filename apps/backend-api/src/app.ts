import express from "express";
import { ok } from "./common/api-response";
import { errorHandler } from "./common/error-handler";
import { requireAdmin } from "./modules/admin/admin-auth.middleware";
import { botFlowRouter } from "./modules/bot-flow/bot-flow.router";
import { catalogRouter } from "./modules/catalog/catalog.router";

export const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json(ok({ status: "ok" }));
});

app.use("/bot", botFlowRouter);
app.use("/admin/catalog", requireAdmin, catalogRouter);

app.use(errorHandler);
