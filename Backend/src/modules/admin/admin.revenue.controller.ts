import { Request, Response } from "express";
import Payment from "../payment/model";

export const getRevenueMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

    // Base match
    const match: any = { status: "Success" };

    // Add date filter only if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.createdAt = { $gte: start, $lte: end };
    }

    // Debug
    const total = await Payment.countDocuments();
    const matched = await Payment.countDocuments(match);
    console.log("payments.total:", total, "payments.matched:", matched, "match:", match);

    const totalRevenueAgg = await Payment.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const monthlyRevenue =
      await Payment.aggregate([
        { $match: match },
        { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } },
        { $sort: { _id: 1 } },
      ]);

    const subscriptionBreakdown = await Payment.aggregate([
      { $match: match },
      { $group: { _id: "$plan", total: { $sum: "$amount" } } },
    ]);

    const dailyRevenue =
      await Payment.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            amount: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, day: "$_id", amount: 1 } },
      ]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenueAgg[0]?.total || 0,
        monthlyRevenue,
        subscriptionBreakdown,
        dailyRevenue,
      },
    });
  } catch (e: any) {
    console.error("revenue error:", e);
    res.status(500).json({ success: false, message: e.message });
  }
};