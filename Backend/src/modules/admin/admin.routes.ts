import { Router } from "express";
import * as adminController from "./admin.controller";
import { authenticate } from "../../middleware/auth";
import { isAdmin } from "../../middleware/isAdmin";
import { getRevenueMetrics } from "./admin.revenue.controller";
import { getDashboardStats } from "./admin.dashboard.controller";
import seatRoutes from "../seat/seat.routes";

const router = Router();

// All routes require authentication + admin role
router.use(authenticate, isAdmin);

// Dashboard stats endpoint
router.get("/dashboard-stats", getDashboardStats);

// Get all users with pagination, search, and filtering
router.get("/users", adminController.getAllUsers);

// Get detailed user info with payment history
router.get("/users/:id", adminController.getUserDetails);

// Revenue metrics endpoint
router.get("/revenue", getRevenueMetrics);

// ✅ Seat management routes
router.use("/seats", seatRoutes);

export default router;