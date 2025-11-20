import { Request, Response } from "express";
import User from "../users/user.model";
import Subscription from "../subscription/model";
import Payment from "../payment/model";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Calculate Total Revenue (all time)
    const totalRevenueData = await Payment.aggregate([
      { $match: { status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = totalRevenueData[0]?.total || 0;

    // 2. Calculate Monthly Revenue (current month)
    const monthlyRevenueData = await Payment.aggregate([
      {
        $match: {
          status: "Success",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const monthlyRevenue = monthlyRevenueData[0]?.total || 0;

    // 3. Count Active Students (with active subscriptions)
    const activeStudents = await Subscription.countDocuments({
      status: "Active",
      expiryDate: { $gte: now },
    });

    // 4. Count Expiring Subscriptions (next 7 days)
    const expiringSubscriptions = await Subscription.countDocuments({
      status: "Active",
      expiryDate: {
        $gte: now,
        $lte: sevenDaysFromNow,
      },
    });

    // 5. Count New Signups (last 7 days)
    const newSignups = await User.countDocuments({
      role: "student",
      createdAt: { $gte: oneWeekAgo },
    });

    // 6. Calculate Renewal Rate (users who renewed vs expired in last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const expiredCount = await Subscription.countDocuments({
      status: "Expired",
      expiryDate: { $gte: thirtyDaysAgo, $lte: now },
    });

    const renewedCount = await Subscription.countDocuments({
      status: "Active",
      startDate: { $gte: thirtyDaysAgo },
      createdAt: { $gte: thirtyDaysAgo },
    });

    const renewalRate = expiredCount > 0 
      ? Math.round((renewedCount / (renewedCount + expiredCount)) * 100) 
      : 0;

    // 7. Get Recent Activities (last 10 activities)
    const recentSignups = await User.find({ role: "student" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name createdAt")
      .lean();

    const recentSubscriptions = await Subscription.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "name")
      .select("userId plan createdAt")
      .lean();

    // Combine and format recent activities
    const activities = [];

    // Add signups
    for (const signup of recentSignups) {
      activities.push({
        type: "signup",
        user: signup.name,
        action: "New user signup",
        time: signup.createdAt,
      });
    }

    // Add renewals and new subscriptions
    for (const sub of recentSubscriptions) {
      const user = sub.userId as any;
      const isRenewal = await Subscription.countDocuments({
        userId: sub.userId,
        createdAt: { $lt: (sub as any).createdAt },
      }) > 0;

      activities.push({
        type: isRenewal ? "renewal" : "signup",
        user: user?.name || "Unknown",
        action: isRenewal 
          ? `Renewed ${sub.plan}` 
          : `New ${sub.plan} subscription`,
        time: (sub as any).createdAt,
      });
    }

    // Add expired subscriptions
    const recentExpired = await Subscription.find({
      status: "Expired",
      expiryDate: { $gte: oneWeekAgo },
    })
      .sort({ expiryDate: -1 })
      .limit(3)
      .populate("userId", "name")
      .lean();

    for (const expired of recentExpired) {
      const user = expired.userId as any;
      activities.push({
        type: "expiry",
        user: user?.name || "Unknown",
        action: `${expired.plan} expired`,
        time: expired.expiryDate,
      });
    }

    // Sort by time and take top 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10)
      .map(activity => ({
        ...activity,
        time: getRelativeTime(new Date(activity.time)),
      }));

    // 8. Get users expiring today
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const expiringToday = await Subscription.find({
      status: "Active",
      expiryDate: { $gte: now, $lte: endOfDay },
    })
      .populate("userId", "name phone")
      .select("plan")
      .lean();

    const expiringTodayFormatted = expiringToday.map((sub) => {
      const user = sub.userId as any;
      return {
        name: user?.name || "Unknown",
        plan: sub.plan,
        phone: user?.phone || "N/A",
      };
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          monthlyRevenue,
          activeStudents,
          expiringSubscriptions,
          newSignups,
          renewalRate,
        },
        recentActivities: sortedActivities,
        expiringToday: expiringTodayFormatted,
      },
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

// Helper function to get relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}