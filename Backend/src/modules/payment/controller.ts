import { Request, Response } from "express";
import * as paymentService from "./service";
import Payment from "./model";
import Subscription from "../subscription/model";
import User from "../users/user.model";

/**
 * Create a new Razorpay order
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    console.log("🔐 Received request from userId:", userId);
    
    if (!userId) {
      console.log("❌ No user ID found in request");
      return res.status(401).json({ error: "Unauthorized - User not authenticated" });
    }
    
    const { plan, amount } = req.body;
    console.log("📦 Request body:", { plan, amount });

    if (!amount || !plan) {
      console.log("❌ Missing plan or amount");
      return res.status(400).json({ error: "Missing plan or amount" });
    }

    if (typeof amount !== "number" || amount <= 0) {
      console.log("❌ Invalid amount:", amount);
      return res.status(400).json({ error: "Invalid amount" });
    }

    console.log("📦 Creating order for userId:", userId, { plan, amount });
    
    const order = await paymentService.createOrder(plan, amount);
    
    console.log("✅ Order created successfully:", order.id);
    
    res.json(order);
  } catch (error: any) {
    console.error("❌ Create order error:", error);
    res.status(500).json({ 
      error: error.message || "Failed to create order",
      details: error.toString()
    });
  }
};

/**
 * Verify Razorpay payment and activate subscription
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, paymentId, signature, plan, duration, shift, seatType, amount, addOns } = req.body;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized - User not authenticated" });
    }
    
    if (!orderId || !paymentId || !signature || !plan) {
      return res.status(400).json({ error: "Missing required fields: orderId, paymentId, signature, plan" });
    }

    try {
      const isValid = paymentService.verifyPayment(orderId, paymentId, signature);
      
      if (!isValid) {
        return res.status(400).json({ error: "Invalid payment signature - Payment verification failed" });
      }
    } catch (sigError: any) {
      console.error("❌ Signature verification error:", sigError);
      return res.status(400).json({ error: "Failed to verify payment signature" });
    }

    let order;
    try {
      order = await paymentService.fetchOrderById(orderId);
    } catch (orderError: any) {
      console.error("❌ Order fetch error:", orderError);
      return res.status(400).json({ error: "Failed to fetch order details from Razorpay" });
    }

    const amountRupees = Math.round(Number(order?.amount || 0) / 100);
    const currency = order?.currency || "INR";

    const startDate = new Date();
    const expiryDate = paymentService.calculateExpiryDate(duration || "1 Month");

    const subscription = await Subscription.create({
      userId,
      plan: plan,
      status: "Active",
      startDate,
      expiryDate,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      duration,
      shift,
      seatType,
      amountPaid: amountRupees,
    });

    await User.findByIdAndUpdate(userId, { currentSubscription: subscription._id });

    const payment = await Payment.create({
      userId,
      orderId,
      paymentId,
      signature,
      amount: amountRupees,
      currency,
      status: "Success",
      plan,
      duration,
      shift,
      seatType,
      registrationIncluded: !!addOns?.registration,
      lockerIncluded: !!addOns?.locker,
    });

    return res.json({ 
      success: true, 
      message: "Payment verified", 
      subscription, 
      payment 
    });
  } catch (err: any) {
    console.error("❌ verifyPayment error:", err);
    return res.status(500).json({ error: err.message || "Payment verification failed" });
  }
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const history = await Payment.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, history });
  } catch (error: any) {
    console.error("❌ Payment history error:", error);
    res.status(500).json({ error: error.message });
  }
};