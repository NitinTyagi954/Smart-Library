import { Request, Response } from "express";
import User from "../users/user.model";
import Subscription from "../subscription/model";
import Payment from "../payment/model";
import mongoose from "mongoose";

// Define plan prices (update these to match your actual prices)
const PLAN_PRICES: Record<string, number> = {
  "Daily Pass": 50,
  "Weekly": 300,
  "Monthly": 1000,
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search = "", status = "all", page = "1", limit = "20" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { role: "student" };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // ✅ Handle multiple status values (e.g., "expired,expiring")
    let statusList: string[] = [];
    if (typeof status === "string" && status !== "all") {
      statusList = status.split(",").map((s) => s.trim().toLowerCase());
    }

    const users = await User.find(filter)
      .select("-passwordHash -tokenVersion -passwordChangedAt")
      .sort({ createdAt: -1 })
      .lean();

    // ✅ Enrich ALL users first
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const currentSub = user.currentSubscription
          ? await Subscription.findById(user.currentSubscription).lean()
          : null;

        let subscriptionStatus = "No active plan";
        let daysRemaining = 0;
        let isExpiringSoon = false;

        if (currentSub) {
          const now = new Date();
          const expiryDate = new Date(currentSub.expiryDate);
          daysRemaining = Math.ceil(
            (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (currentSub.status === "Expired" || daysRemaining <= 0) {
            subscriptionStatus = "expired";
            daysRemaining = 0;
          } else if (daysRemaining <= 2) {
            subscriptionStatus = "expiring";
            isExpiringSoon = true;
          } else {
            subscriptionStatus = "active";
          }
        }

        const allSubscriptions = await Subscription.find({
          userId: user._id,
        }).lean();

        const orderIds = allSubscriptions.map((sub) => sub.razorpayOrderId);

        const payments = await Payment.find({
          userId: user._id,
          orderId: { $in: orderIds },
          status: "Success",
        }).lean();

        let totalPaid = payments.reduce(
          (sum, p) => sum + Number(p.amount || 0),
          0
        );

        if (totalPaid === 0 && allSubscriptions.length > 0) {
          totalPaid = allSubscriptions.reduce((sum, sub) => {
            return sum + (PLAN_PRICES[sub.plan] || 0);
          }, 0);
        }

        let currentPlanAmount = 0;
        if (currentSub) {
          const currentPayment = payments.find(
            (p) => p.orderId === currentSub.razorpayOrderId
          );
          currentPlanAmount = Number(currentPayment?.amount || 0);
          if (currentPlanAmount === 0) {
            currentPlanAmount = PLAN_PRICES[currentSub.plan] || 0;
          }
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          plan: currentSub ? currentSub.plan : "No Plan",
          status: subscriptionStatus,
          startDate: currentSub ? currentSub.startDate : null,
          endDate: currentSub ? currentSub.expiryDate : null,
          currentPlanAmount,
          totalPaid,
          daysRemaining,
          isExpiringSoon,
          createdAt: user.createdAt,
        };
      })
    );

    // ✅ Filter by status AFTER enrichment
    let filteredUsers = enrichedUsers;
    if (statusList.length > 0) {
      filteredUsers = enrichedUsers.filter((u) =>
        statusList.includes(u.status)
      );
    }

    // ✅ Apply pagination on FILTERED results
    const totalFiltered = filteredUsers.length;
    const paginatedUsers = filteredUsers.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalFiltered / limitNum),
          totalUsers: totalFiltered,
          limit: limitNum,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};


/**
 * Get detailed user info with payment history
 */
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(id)
      .select("-passwordHash -tokenVersion -passwordChangedAt")
      .lean();

    if (!user || user.role !== "student") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentSub = user.currentSubscription
      ? await Subscription.findById(user.currentSubscription).lean()
      : null;

    const allSubscriptions = await Subscription.find({ userId: id })
      .sort({ startDate: -1 })
      .lean();

    const orderIds = allSubscriptions.map((sub) => sub.razorpayOrderId);
    const payments = await Payment.find({
      userId: id,
      orderId: { $in: orderIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    const paymentHistory = payments.map((payment) => {
      const relatedSub = allSubscriptions.find((sub) => sub.razorpayOrderId === payment.orderId);
      return {
        _id: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        plan: relatedSub ? relatedSub.plan : "Unknown",
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        createdAt: payment.createdAt,
      };
    });

    // Calculate total paid - use Payment collection first, fallback to plan prices
    let totalPaid = payments
      .filter((p) => p.status === "Success")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    if (totalPaid === 0 && allSubscriptions.length > 0) {
      totalPaid = allSubscriptions.reduce((sum, sub) => {
        return sum + (PLAN_PRICES[sub.plan] || 0);
      }, 0);
    }

    let subscriptionStatus = "No active plan";
    let daysRemaining = 0;

    if (currentSub) {
      const now = new Date();
      const expiryDate = new Date(currentSub.expiryDate);
      daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (currentSub.status === "Expired" || daysRemaining <= 0) {
        subscriptionStatus = "expired";
        daysRemaining = 0;
      } else if (daysRemaining <= 2) {
        subscriptionStatus = "expiring";
      } else {
        subscriptionStatus = "active";
      }
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
        },
        currentSubscription: currentSub
          ? {
              plan: currentSub.plan,
              status: subscriptionStatus,
              startDate: currentSub.startDate,
              expiryDate: currentSub.expiryDate,
              daysRemaining,
            }
          : null,
        totalPaid,
        paymentHistory,
        subscriptionHistory: allSubscriptions.map((sub) => ({
          plan: sub.plan,
          status: sub.status,
          startDate: sub.startDate,
          expiryDate: sub.expiryDate,
          amount: PLAN_PRICES[sub.plan] || 0, // Add amount from plan prices
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details",
      error: error.message,
    });
  }
};