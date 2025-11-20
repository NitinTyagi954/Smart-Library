import { Request, Response } from "express";
import * as subscriptionService from "./service";
import mongoose from "mongoose";

/**
 * Get current subscription (real-time expiry check included)
 */
export const getCurrentSubscription = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // ✅ Get latest subscription
    const subscription = await subscriptionService.getCurrentSubscription(
      new mongoose.Types.ObjectId(userId)
    );

    if (!subscription) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "No active subscription found",
      });
    }

    // ✅ Calculate days remaining
    let daysRemaining = subscriptionService.calculateDaysRemaining(subscription.expiryDate);

    // ✅ If expired, set status to Expired
    if (subscription.status === "Expired") {
      daysRemaining = 0;
    }

    // ✅ Return clean, frontend-friendly object
    return res.status(200).json({
      success: true,
      data: {
        _id: subscription._id,
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        expiryDate: subscription.expiryDate,
        razorpayOrderId: subscription.razorpayOrderId,
        razorpayPaymentId: subscription.razorpayPaymentId,
        daysRemaining,
        duration: subscription.duration,
        shift: subscription.shift,
        seatType: subscription.seatType,
        amountPaid: subscription.amountPaid,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update subscription status (admin use-case)
 */
export const updateSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "Subscription ID and status are required" });
    }

    const subscription = await subscriptionService.updateSubscriptionStatus(id, status);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.json({
      success: true,
      message: "Subscription status updated",
      subscription,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
