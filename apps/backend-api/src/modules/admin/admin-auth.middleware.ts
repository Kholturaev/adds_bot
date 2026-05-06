import { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";
import { fail } from "../../common/api-response";
import { isValidAdminCredentials } from "./admin-auth.service";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const username = req.header("x-admin-username");
  const password = req.header("x-admin-password");

  const isValid = isValidAdminCredentials(
    username,
    password,
    env.adminUsername,
    env.adminPassword,
  );

  if (!isValid) {
    res.status(401).json(fail("UNAUTHORIZED", "Invalid admin credentials"));
    return;
  }

  next();
}
