import { Router } from "express";
import { ok } from "../../common/api-response";
import { adIdParamSchema, listAdsQuerySchema } from "./ads-admin.validation";
import {
  approveAd,
  deleteAd,
  getAdDetail,
  listAds,
  publishAd,
  rejectAd,
  updateAd,
} from "./ads-admin.service";

export const adsAdminRouter = Router();

adsAdminRouter.get("/", async (req, res, next) => {
  try {
    const query = listAdsQuerySchema.parse(req.query);
    const data = await listAds(query);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

adsAdminRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = adIdParamSchema.parse(req.params);
    const data = await getAdDetail(id);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

adsAdminRouter.patch("/:id", async (req, res, next) => {
  try {
    const { id } = adIdParamSchema.parse(req.params);
    const data = await updateAd(id, req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

adsAdminRouter.post("/:id/approve", async (req, res, next) => {
  try {
    const { id } = adIdParamSchema.parse(req.params);
    const data = await approveAd(id);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

adsAdminRouter.post("/:id/publish", async (req, res, next) => {
  try {
    const { id } = adIdParamSchema.parse(req.params);
    const data = await publishAd(id, req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

adsAdminRouter.post("/:id/reject", async (req, res, next) => {
  try {
    const { id } = adIdParamSchema.parse(req.params);
    const data = await rejectAd(id, req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

adsAdminRouter.delete("/:id", async (req, res, next) => {
  try {
    const { id } = adIdParamSchema.parse(req.params);
    const data = await deleteAd(id);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});
