import express from "express";
import { ok } from "./common/api-response";
import { errorHandler } from "./common/error-handler";
import { requireAdmin } from "./modules/admin/admin-auth.middleware";
import { adsAdminRouter } from "./modules/ads-admin/ads-admin.router";
import { botFlowRouter } from "./modules/bot-flow/bot-flow.router";
import { catalogRouter } from "./modules/catalog/catalog.router";

export const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] ||
      "Content-Type, Authorization, X-Requested-With",
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json(ok({ status: "ok" }));
});

app.use("/bot", botFlowRouter);
app.use("/admin/catalog", requireAdmin, catalogRouter);
app.use("/admin/ads", requireAdmin, adsAdminRouter);

app.use(errorHandler);
