import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;
  paymentId: string;
  signature: string;
  amount: number; // final amount paid
  currency: string;
  status: "Success" | "Failed";
  plan: string; // legacy plan name
  // New detailed fields
  planId?: mongoose.Types.ObjectId | null;
  duration?: string;
  shift?: string;
  seatType?: string;
  registrationIncluded?: boolean;
  lockerIncluded?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true },
    paymentId: { type: String, required: true },
    signature: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ["Success", "Failed"], required: true },
    plan: { type: String, required: true },
    planId: { type: Schema.Types.ObjectId, default: null },
    duration: { type: String },
    shift: { type: String },
    seatType: { type: String },
    registrationIncluded: { type: Boolean, default: false },
    lockerIncluded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", paymentSchema);
