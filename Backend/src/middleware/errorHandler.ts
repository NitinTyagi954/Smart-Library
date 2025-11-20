// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue: any) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err.message === "Invalid email or password") {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  if (err.message === "Email already registered") {
    return res.status(409).json({
      success: false,
      message: "Email already registered",
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
}
