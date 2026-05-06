import { Router } from "express";
import { z } from "zod";
import { ok } from "../../common/api-response";
import {
  createAdvertisingPlan,
  createBrand,
  createCategory,
  createFieldDefinition,
  deleteAdvertisingPlan,
  deleteBrand,
  deleteCategory,
  deleteFieldDefinition,
  listAdvertisingPlans,
  listBrands,
  listCategories,
  listFieldDefinitions,
  updateAdvertisingPlan,
  updateBrand,
  updateCategory,
  updateFieldDefinition,
} from "./catalog.service";
import { idParamSchema } from "./catalog.validation";

export const catalogRouter = Router();

catalogRouter.get("/categories", async (_req, res, next) => {
  try {
    const data = await listCategories();
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.post("/categories", async (req, res, next) => {
  try {
    const data = await createCategory(req.body);
    res.status(201).json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.put("/categories/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = await updateCategory(id, req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.delete("/categories/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = await deleteCategory(id);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.get("/brands", async (_req, res, next) => {
  try {
    const data = await listBrands();
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.post("/brands", async (req, res, next) => {
  try {
    const data = await createBrand(req.body);
    res.status(201).json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.put("/brands/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = await updateBrand(id, req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.delete("/brands/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = await deleteBrand(id);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.get("/field-definitions", async (_req, res, next) => {
  try {
    const data = await listFieldDefinitions();
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.post("/field-definitions", async (req, res, next) => {
  try {
    const data = await createFieldDefinition(req.body);
    res.status(201).json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.put("/field-definitions/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = await updateFieldDefinition(id, req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.delete("/field-definitions/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = await deleteFieldDefinition(id);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.get("/advertising-plans", async (_req, res, next) => {
  try {
    const data = await listAdvertisingPlans();
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.post("/advertising-plans", async (req, res, next) => {
  try {
    const data = await createAdvertisingPlan(req.body);
    res.status(201).json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.put("/advertising-plans/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = await updateAdvertisingPlan(id, req.body);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.delete("/advertising-plans/:id", async (req, res, next) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = await deleteAdvertisingPlan(id);
    res.json(ok(data));
  } catch (error) {
    next(error);
  }
});

catalogRouter.get("/_test-auth", (_req, res) => {
  res.json(ok({ authenticated: true }));
});

catalogRouter.get("/_validate-response-shape", (_req, res) => {
  const result = z
    .object({
      success: z.boolean(),
      data: z.unknown().nullable(),
      error: z.unknown().nullable(),
    })
    .safeParse(ok({ shape: "ok" }));

  res.json(ok({ valid: result.success }));
});
