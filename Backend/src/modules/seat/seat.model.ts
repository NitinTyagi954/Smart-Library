import mongoose, { Schema, Document, Model } from "mongoose";

export type SeatType = "REGULAR" | "SPECIAL";
export type OccupancyType = "FULL_DAY" | "MORNING" | "EVENING";

export interface ISeat extends Document {
  seatNumber: string;                 // e.g., "R-1", "S-27"
  type: SeatType;                     // "REGULAR" | "SPECIAL"
  occupied: boolean;
  occupancyType: OccupancyType | null;
  createdAt: Date;
  updatedAt: Date;
}

const SeatSchema = new Schema<ISeat>(
  {
    seatNumber: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["REGULAR", "SPECIAL"], required: true },
    occupied: { type: Boolean, default: false },
    occupancyType: {
      type: String,
      enum: ["FULL_DAY", "MORNING", "EVENING"],
      default: null,
    },
  },
  { timestamps: true }
);

export const Seat: Model<ISeat> = mongoose.model<ISeat>("Seat", SeatSchema);