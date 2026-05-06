import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { fail } from "./api-response";
import { HttpError } from "./http-error";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  void next;

  if (err instanceof ZodError) {
    res
      .status(400)
      .json(
        fail("VALIDATION_ERROR", "Request validation failed", err.flatten()),
      );
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json(fail(err.code, err.message, err.details));
    return;
  }

  res
    .status(500)
    .json(fail("INTERNAL_ERROR", "Unexpected internal server error"));
}
