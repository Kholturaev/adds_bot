import { Router } from "express";
import { ok } from "../../common/api-response";
import { adIdParamSchema } from "./bot-flow.validation";
import {
  createDraft,
  getBootstrapData,
  getDraftFields,
  getDraftPreview,
  submitDraft,
  upsertDraftFieldValue,
  upsertDraftImage,
  upsertTelegramUser,
} from "./bot-flow.service";

export const botFlowRouter = Router();

botFlowRouter.post("/users/upsert", async (req, res, next) => {
  try {
    const data = await upsertTelegramUser(req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

botFlowRouter.get("/bootstrap", async (_req, res, next) => {
  try {
    const data = await getBootstrapData();
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

botFlowRouter.post("/drafts", async (req, res, next) => {
  try {
    const data = await createDraft(req.body);
    res.status(201).json(ok(data));
  } catch (error) {
    next(error);
  }
});

botFlowRouter.get("/drafts/:adId/fields", async (req, res, next) => {
  try {
    const { adId } = adIdParamSchema.parse(req.params);
    const data = await getDraftFields(adId);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

botFlowRouter.post("/drafts/:adId/field-values", async (req, res, next) => {
  try {
    const { adId } = adIdParamSchema.parse(req.params);
    const data = await upsertDraftFieldValue(adId, req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

botFlowRouter.post("/drafts/:adId/image", async (req, res, next) => {
  try {
    const { adId } = adIdParamSchema.parse(req.params);
    const data = await upsertDraftImage(adId, req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

botFlowRouter.get("/drafts/:adId/preview", async (req, res, next) => {
  try {
    const { adId } = adIdParamSchema.parse(req.params);
    const data = await getDraftPreview(adId);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

botFlowRouter.post("/drafts/:adId/submit", async (req, res, next) => {
  try {
    const { adId } = adIdParamSchema.parse(req.params);
    const data = await submitDraft(adId, req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});
