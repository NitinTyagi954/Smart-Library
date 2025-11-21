import mongoose, { Schema, Document, Model } from "mongoose";

export type SeatType = "REGULAR" | "SPECIAL";
export type OccupancyType = "FULL_DAY" | "MORNING" | "EVENING";

export interface ISeat extends Document {
  seatNumber: string;                 // e.g., "R-1", "S-27"
  type: SeatType;                     // "REGULAR" | "SPECIAL"
  occupied: boolean;
  occupiedBy?: string;                // Name of person occupying the seat
  occupancyType: OccupancyType | null;
  userId?: string;                    // ID of user who booked the seat
  createdAt: Date;
  updatedAt: Date;
}

const SeatSchema = new Schema<ISeat>(
  {
    seatNumber: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["REGULAR", "SPECIAL"], required: true },
    occupied: { type: Boolean, default: false },
    occupiedBy: { type: String, default: null },
    occupancyType: {
      type: String,
      enum: ["FULL_DAY", "MORNING", "EVENING"],
      default: null,
    },
    userId: { type: String, default: null },
  },
  { timestamps: true }
);

export const Seat: Model<ISeat> = mongoose.model<ISeat>("Seat", SeatSchema);