import jwt, { SignOptions, JwtPayload, Secret } from "jsonwebtoken";
import env from "../config/env";
import { Response } from "express";
import User from "../modules/users/user.model"; // 👈 for validateRefreshToken

// ==============================
// 🔐 Secrets and Expiration
// ==============================
const ACCESS_SECRET = env.JWT_ACCESS_SECRET as Secret;
const REFRESH_SECRET = env.JWT_REFRESH_SECRET as Secret;
const ACCESS_EXP = env.ACCESS_TOKEN_EXPIRES;   // e.g. "15m"
const REFRESH_EXP = env.REFRESH_TOKEN_EXPIRES; // e.g. "7d"

// ==============================
// 🔑 Interfaces
// ==============================
export interface TokenPayload {
  sub: string;
  role: string;
}

export type DecodedToken = JwtPayload & TokenPayload;

// ==============================
// 🧾 Signers
// ==============================
const baseSign = (
  payload: TokenPayload,
  secret: Secret,
  expiresIn: string | number,
  overrides: SignOptions = {}
): string => {
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"], ...overrides };
  return jwt.sign(payload, secret, options);
};

export const signAccessToken = (payload: TokenPayload) =>
  baseSign(payload, ACCESS_SECRET, ACCESS_EXP);

export const signRefreshToken = (payload: TokenPayload) =>
  baseSign(payload, REFRESH_SECRET, REFRESH_EXP);

// ==============================
// 🔍 Verifiers
// ==============================
export const verifyAccessToken = (token: string): DecodedToken =>
  jwt.verify(token, ACCESS_SECRET) as DecodedToken;

export const verifyRefreshToken = (token: string): DecodedToken =>
  jwt.verify(token, REFRESH_SECRET) as DecodedToken;

// ==============================
// 🔐 Validate Refresh Token
// ==============================
export const validateRefreshToken = async (token: string): Promise<DecodedToken> => {
  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.sub);
  if (!user) throw new Error("User not found");

  if (user.passwordChangedAt) {
    const passwordChangedAtTimestamp = Math.floor(
      new Date(user.passwordChangedAt).getTime() / 1000
    );
    if (decoded.iat && decoded.iat < passwordChangedAtTimestamp) {
      throw new Error("Refresh token expired due to password change");
    }
  }

  return decoded;
};

// ==============================
// 🍪 Cookie Helpers
// ==============================
interface SetTokenCookiesOptions {
  accessToken: string;
  refreshToken?: string;
  accessMaxAgeMs?: number;
  refreshMaxAgeMs?: number;
}

/**
 * ✅ Automatically adjusts cookie settings for localhost and production
 */
export const setAuthCookies = (
  res: Response,
  {
    accessToken,
    refreshToken,
    accessMaxAgeMs = 15 * 60 * 1000, // 15m
    refreshMaxAgeMs = 7 * 24 * 60 * 60 * 1000, // 7d
  }: SetTokenCookiesOptions
) => {
  const isProd = env.NODE_ENV === "production";

  // Chrome rules:
  // - SameSite=None requires Secure=true
  // - Localhost (HTTP) cannot use Secure
  const cookieOptions = {
    httpOnly: true,
    sameSite: isProd ? ("none" as const) : ("lax" as const),
    secure: isProd, // ✅ HTTPS only in production
    path: "/",
  };


  // Access Token
  res.cookie("access_token", accessToken, {
    ...cookieOptions,
    maxAge: accessMaxAgeMs,
  });
  

  // Refresh Token
  if (refreshToken) {
    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: refreshMaxAgeMs,
    });
   
  }
};

// ==============================
// 🧹 Clear Cookies
// ==============================
export const clearAuthCookies = (res: Response) => {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
  console.log("🧹 Cleared auth cookies");
};
