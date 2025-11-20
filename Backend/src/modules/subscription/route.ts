import { Router } from "express";
import * as subscriptionController from "./controller";
import { authenticate } from "../../middleware/auth"; // ✅ JWT middleware (maan ke chalte hain ki tumhare paas hai)

const router = Router();

// ✅ Get current subscription (real-time expiry check included)
router.get("/current", authenticate, subscriptionController.getCurrentSubscription);

// ✅ Update subscription status (Admin use-case)
router.patch("/:id/status", authenticate, subscriptionController.updateSubscriptionStatus);

//payment history
router.get("/history", authenticate, subscriptionController.getCurrentSubscription);

export default router;
