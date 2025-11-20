import Razorpay from "razorpay";
import crypto from "crypto";
import env from "../../config/env";

// Initialize Razorpay with credentials
let razorpay: Razorpay | null = null;
let initError: Error | null = null;

function initializeRazorpay() {
  if (razorpay) return razorpay;
  if (initError) throw initError;

  try {
    // Check for test mode
    const isTestMode = env.RAZORPAY_KEY_ID.includes("test");
    
    if (isTestMode) {
      console.log("🧪 TEST MODE: Using Razorpay test credentials");
    } else {
      console.log("🔐 PRODUCTION MODE: Using Razorpay live credentials");
    }

    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new Error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env");
    }

    razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
    
    console.log("✅ Razorpay initialized successfully");
    return razorpay;
  } catch (error: any) {
    initError = error;
    console.error("❌ Failed to initialize Razorpay:", error.message);
    console.error("Key ID:", env.RAZORPAY_KEY_ID ? "✓ Present" : "✗ Missing");
    console.error("Key Secret:", env.RAZORPAY_KEY_SECRET ? "✓ Present" : "✗ Missing");
    throw error;
  }
}

// Initialize on first use
razorpay = initializeRazorpay();

// Helper function to create mock order for testing
function createMockOrder(plan: string, amount: number) {
  const timestamp = Date.now();
  const orderId = `order_${timestamp}`;
  
  return {
    id: orderId,
    entity: "order",
    amount: amount * 100,
    amount_paid: 0,
    amount_due: amount * 100,
    currency: "INR",
    receipt: `rcpt_${timestamp}`,
    offer_id: null,
    status: "created",
    attempts: 0,
    notes: {
      plan,
      timestamp: timestamp.toString(),
    },
    created_at: Math.floor(timestamp / 1000),
  };
}

export const createOrder = async (plan: string, amount: number) => {
  console.log("💰 Creating order:", { plan, amount });
  
  // Validate amount
  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }

  const isTestMode = env.RAZORPAY_KEY_ID.includes("test");
  
  try {
    if (isTestMode) {
      console.log("🧪 Test mode: Creating mock order");
      // For test mode, return a mock order without calling Razorpay API
      const mockOrder = createMockOrder(plan, amount);
      console.log("✅ Mock order created:", mockOrder);
      return mockOrder;
    } else {
      if (!razorpay) {
        throw new Error("Razorpay is not initialized");
      }

      // Production mode: call real Razorpay API
      const timestamp = Date.now();
      const receipt = `rcpt_${timestamp}`.substring(0, 40);
      
      const options = {
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: receipt,
        notes: { 
          plan,
          timestamp: timestamp.toString()
        },
      };
      
      const order = await razorpay.orders.create(options as any);
      console.log("✅ Order created:", order);
      return order;
    }
  } catch (error: any) {
    console.error("❌ Order creation error:", error);
    throw new Error(`Failed to create order: ${error.message}`);
  }
};

export const verifyPayment = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  // Allow test mode signatures (for development)
  const isTestMode = env.RAZORPAY_KEY_ID.includes("test");
  if (isTestMode && signature.startsWith("test_signature_")) {
    console.log("🧪 Test mode: Accepting test signature");
    return true;
  }

  // Production mode: verify real signature
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");
  return expectedSignature === signature;
};

export function calculateExpiryDate(duration: string): Date {
  const start = new Date();
  const months = 
    duration === "1 Month" ? 1 : 
    duration === "3 Months" ? 3 : 
    duration === "7 Months" ? 7 : 1;
  const end = new Date(start);
  end.setMonth(end.getMonth() + months);

// TESTING MODE - Set custom durations
  // const start = new Date();
  // const end = new Date(start);
  // switch(duration) {
  //   case "1 Month":
  //     end.setMinutes(end.getMinutes() + 5); // 1 day
  //     break;
  //   case "3 Months":
  //     end.setMinutes(end.getMinutes() + 15); // 3 days
  //     break;
  //   case "7 Months":
  //     end.setMinutes(end.getMinutes() + 30); // 7 days
  //     break;
  //   default:
  //     end.setDate(end.getDate() + 1); // Default 1 day
  // }
  return end;
}

export const getPaymentHistory = async (_userId: string) => {
  return [];
};

export async function fetchOrderById(orderId: string) {
  const isTestMode = env.RAZORPAY_KEY_ID.includes("test");

  try {
    if (isTestMode) {
      console.log("🧪 Test mode: Returning mock order data");
      // For test mode, return mock order data
      return {
        id: orderId,
        entity: "order",
        amount: 50000, // Default amount for testing
        currency: "INR",
        status: "created",
      };
    } else {
      if (!razorpay) {
        throw new Error("Razorpay is not initialized");
      }

      const order = await (razorpay.orders as any).fetch(orderId);
      return order;
    }
  } catch (error: any) {
    console.error("❌ Failed to fetch order:", error);
    throw new Error(`Failed to fetch order: ${error.message}`);
  }
}