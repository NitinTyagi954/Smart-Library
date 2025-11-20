import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  plan: "Daily Pass" | "Weekly Pass" | "Monthly Pass" | string; // keep compatible
  status: "Active" | "Expired";
  startDate: Date;
  expiryDate: Date;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  // New fields
  planId?: mongoose.Types.ObjectId | null;
  duration?: string;
  shift?: string;
  seatType?: string;
  amountPaid?: number;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, required: true },
    status: { type: String, enum: ["Active", "Expired"], default: "Active" },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, required: true },
    razorpaySignature: { type: String, required: true },
    planId: { type: Schema.Types.ObjectId, default: null },
    duration: { type: String },
    shift: { type: String },
    seatType: { type: String },
    amountPaid: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>("Subscription", subscriptionSchema);
