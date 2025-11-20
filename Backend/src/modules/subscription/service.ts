import mongoose from "mongoose";
import Subscription, { ISubscription } from "./model";
import User from "../users/user.model";

/**
 * Get the user's current subscription (with real-time expiry check)
 */
export const getCurrentSubscription = async (
  userId: mongoose.Types.ObjectId
): Promise<ISubscription | null> => {
  let subscription = await Subscription.findOne({ userId }).sort({ createdAt: -1 });

  if (!subscription) return null;

  const now = new Date();

  // If expired by date but still Active → expire
  if (subscription.expiryDate < now && subscription.status === "Active") {
    subscription.status = "Expired";
    await subscription.save();
    await User.findByIdAndUpdate(userId, { currentSubscription: null });
  }

  // If status already Expired → ensure user's currentSubscription is null
  if (subscription.status === "Expired") {
    await User.findByIdAndUpdate(userId, { currentSubscription: null });
  }

  return subscription;
};

/**
 * Update subscription status manually (Admin use-case)
 */
export const updateSubscriptionStatus = async (
  subscriptionId: string,
  status: "Active" | "Expired"
): Promise<ISubscription | null> => {
  const subscription = await Subscription.findByIdAndUpdate(
    subscriptionId,
    { status },
    { new: true }
  );

  if (subscription && status === "Expired") {
    await User.findByIdAndUpdate(subscription.userId, { currentSubscription: null });
  }

  return subscription;
};

/**
 * Calculate days remaining for a subscription
 */
export const calculateDaysRemaining = (expiryDate: Date): number => {
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

