import { Router } from "express";
import * as paymentController from "./controller";
import { authenticate } from "../../middleware/auth"; // ✅ JWT auth middleware (maan ke chal ra hu ki tumhare paas hai)

const router = Router();

// ✅ Create Razorpay order
router.post("/create-order", authenticate, paymentController.createOrder);

// ✅ Verify payment & activate subscription
router.post("/verify", authenticate, paymentController.verifyPayment);

// history 
router.get("/history", authenticate, paymentController.getPaymentHistory);

export default router;
