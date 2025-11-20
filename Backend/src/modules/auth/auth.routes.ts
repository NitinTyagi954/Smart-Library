// src/modules/auth/auth.routes.ts
import { Router } from "express";
import {
  register,
  login,
  logout,
  refresh,
  me,
  forgotPassword,
  resetPassword,
  submitFeedback, // <- ensure this is imported
} from "./auth.controller";
import { authenticate } from "../../middleware/auth"; // JWT verification middleware

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/feedback", submitFeedback);

// Protected routes (requires authentication)
router.get("/me", authenticate, me);

export default router;