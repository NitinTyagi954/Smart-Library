import bcrypt from "bcrypt";
import crypto from "crypto";
import User, { IUser } from "../users/user.model";
import env from "../../config/env";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "../../utils/jwt";
import { Response } from "express";
import { PasswordResetToken } from "./passwordResetToken.model";
import { sendMail } from "../../utils/mailer";

export class AuthService {
  // ==============================
  // REGISTER
  // ==============================
  static async register(
    data: { name: string; email: string; phone: string; password: string; role?: "student" | "admin" },
    res: Response
  ) {
    const existing = await User.findOne({ email: data.email });
    if (existing) throw new Error("Email already registered");

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);
    const user = await User.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role || "student",
      passwordHash,
    });

    const payload = { sub: user.id, role: user.role, v: user.tokenVersion };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    setAuthCookies(res, { accessToken, refreshToken });
    return user;
  }

  // ==============================
  // LOGIN
  // ==============================
  static async login(
    data: { email: string; password: string },
    res: Response
  ) {
    const user = await User.findOne({ email: data.email });
    if (!user) throw new Error("Invalid email or password");

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) throw new Error("Invalid email or password");

    const payload = { sub: user.id, role: user.role, v: user.tokenVersion };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    setAuthCookies(res, { accessToken, refreshToken });
    return user;
  }

  // ==============================
  // REFRESH TOKENS
  // ==============================
  static async refresh(token: string, res: Response) {
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw new Error("Invalid refresh token");
    }

    const user = await User.findById(decoded.sub);
    if (!user) throw new Error("User not found");

    // check token version (old refresh tokens invalid)
    if (decoded.v !== user.tokenVersion) {
      throw new Error("Refresh token expired");
    }

    const payload = { sub: user.id, role: user.role, v: user.tokenVersion };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    setAuthCookies(res, { accessToken, refreshToken });
    return user;
  }

  // ==============================
  // LOGOUT
  // ==============================
  static async logout(res: Response) {
    clearAuthCookies(res);
    return { message: "Logged out successfully" };
  }




  // ==============================
  // ME ROUTE
  // ==============================
  static async me(userId: string) {
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) throw new Error("User not found");
    console.log("User info:", user); // Print user info
    return user;
  }

  // ==============================
  // FORGOT PASSWORD
  // ==============================
  static async requestPasswordReset(email: string) {
    const user = await User.findOne({ email });
    if (!user) return; // Always generic response (security)

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // delete old tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      usedAt: null, // defensive: ensure it is explicitly null
    });

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;
    await sendMail(user.email, resetUrl);
  }

  // ==============================
  // RESET PASSWORD
  // ==============================
  static async resetPassword(rawToken: string, newPassword: string) {
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const tokenDoc = await PasswordResetToken.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) throw new Error("Invalid or expired token");

    const user = await User.findById(tokenDoc.userId);
    if (!user) throw new Error("User not found");

    const hashed = await bcrypt.hash(newPassword, env.BCRYPT_SALT_ROUNDS);
    user.passwordHash = hashed;
    user.passwordChangedAt = new Date();
    user.tokenVersion += 1; // invalidate old refresh tokens
    await user.save();

    tokenDoc.usedAt = new Date();
    await tokenDoc.save();

    // delete other active tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id, usedAt: null });
  }
}
