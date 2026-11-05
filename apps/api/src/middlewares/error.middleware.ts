import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error.js";
import { ZodError } from "zod";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
  }

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

  console.error("[Unhandled Error]:", err);

  return res.status(500).json({
    error: "An unexpected internal server error occurred. Please try again later.",
    code: "INTERNAL_SERVER_ERROR",
  });
}
