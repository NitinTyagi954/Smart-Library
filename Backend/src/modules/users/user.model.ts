// src/modules/users/user.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  role: "student" | "admin";
  passwordHash: string;
  createdAt: Date;
  tokenVersion: number;
  updatedAt: Date;
  passwordChangedAt: Date;
  currentSubscription: mongoose.Types.ObjectId | null;
  
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    passwordHash: { type: String, required: true },
    tokenVersion: { type: Number, default: 0 },
    passwordChangedAt: { type: Date, default: null },
    currentSubscription: { type: Schema.Types.ObjectId, ref: "Subscription", default: null },
  },
  { timestamps: true }
);

userSchema.methods.invalidateTokens = function() {
  this.tokenVersion += 1;
  return this.save();
};

export default mongoose.model<IUser>("User", userSchema);
