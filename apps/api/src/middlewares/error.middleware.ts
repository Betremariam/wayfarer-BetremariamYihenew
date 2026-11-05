import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { ZodError } from "zod";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  // Handle custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Handle Zod validation errors (checking both instanceof and name/issues for robust monorepo support)
  if (err instanceof ZodError || err?.name === "ZodError" || Array.isArray(err?.issues)) {
    const issues = err.issues || err.errors || [];
    return res.status(400).json({
      error: issues.length > 0 ? issues[0].message : "Validation error",
      code: "VALIDATION_ERROR",
      details: issues.map((e: any) => ({
        field: Array.isArray(e.path) ? e.path.join(".") : String(e.path),
        message: e.message,
      })),
    });
  }

  // Generic/Database errors: never leak raw DB errors or sensitive internals to the client
  console.error("[Unhandled Error]:", err);

  return res.status(500).json({
    error: "An unexpected internal server error occurred. Please try again later.",
    code: "INTERNAL_SERVER_ERROR",
  });
}
