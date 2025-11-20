import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, verifyRefreshToken, signAccessToken, signRefreshToken, setAuthCookies, DecodedToken } from "../utils/jwt";
import User from "../modules/users/user.model";
import Subscription from "../modules/subscription/model";
import { asyncHandler } from "../utils/asyncHandler";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// 🔐 Enhanced Authenticate Middleware with Auto-Refresh
export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      // Get access token
      let accessToken = req.cookies?.access_token;
      let refreshToken = req.cookies?.refresh_token;

      if (!accessToken && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
          accessToken = authHeader.split(" ")[1];
        }
      }

      
      // Try to verify access token
      let decoded: DecodedToken | null = null;
      let tokenExpired = false;

      if (accessToken) {
        try {
          decoded = verifyAccessToken(accessToken);
        } catch (error: any) {
          if (error.name === "TokenExpiredError") {
            console.log("⏰ Access token expired, attempting refresh...");
            tokenExpired = true;
          } else {
            return res.status(401).json({
              success: false,
              message: "Invalid access token",
              error: error.message,
            });
          }
        }
      }

      // ✅ If access token expired, try to refresh
    if ((tokenExpired || !accessToken) && refreshToken) {
        console.log("🎫 Access token expired check triggered");
        console.log("🔁 Refresh token present:", !!refreshToken);
        try {
          const refreshDecoded = verifyRefreshToken(refreshToken);
          console.log("🧩 Refresh token decoded:", refreshDecoded);

          
          // Find user
          const user = await User.findById(refreshDecoded.sub).select("-passwordHash");

          
          if (!user) {
            return res.status(401).json({
              success: false,
              message: "User not found",
            });
          }

          // Check token version
          if (refreshDecoded.v !== user.tokenVersion) {
            return res.status(401).json({
              success: false,
              message: "Refresh token invalidated. Please login again.",
            });
          }

          // Generate new tokens
          const payload = { sub: user.id, role: user.role, v: user.tokenVersion };
          const newAccessToken = signAccessToken(payload);
          const newRefreshToken = signRefreshToken(payload);

          // Set new cookies
          setAuthCookies(res, { 
            accessToken: newAccessToken, 
            refreshToken: newRefreshToken 
          });

          console.log("✅ Tokens refreshed automatically");

          // Continue with the user
          req.user = user;
          return next();
        } catch (refreshError: any) {
          return res.status(401).json({
            success: false,
            message: "Session expired. Please login again.",
            error: refreshError.message,
          });
        }
      }

      // No valid token at all
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "Access token not found. Please login.",
        });
      }

      // Find user with valid access token
      const user = await User.findById(decoded.sub).select("-passwordHash");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Check password changed
      if (user.passwordChangedAt) {
        const passwordChangedAtTimestamp = Math.floor(
          new Date(user.passwordChangedAt).getTime() / 1000
        );
        if (decoded.iat && decoded.iat < passwordChangedAtTimestamp) {
          return res.status(401).json({
            success: false,
            message: "Session expired due to password change. Please login again.",
          });
        }
      }

      // Check token version
      if (decoded.v !== undefined && decoded.v !== user.tokenVersion) {
        return res.status(401).json({
          success: false,
          message: "Token has been invalidated. Please login again.",
        });
      }

      // ✅ Add user to request object
      req.user = user;
      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Authentication failed",
        error: error.message,
      });
    }
  }
);

// 🛂 Role-based Authorization
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// ✅ Check Active Subscription
export const checkActiveSubscription = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }

      if (req.user.role === "admin") {
        return next();
      }

      const sub = await Subscription.findById(req.user.currentSubscription);

      if (!sub) {
        return res.status(403).json({
          success: false,
          message: "No active subscription. Please purchase a plan.",
        });
      }

      const now = new Date();

      if (sub.status === "Expired" || sub.expiryDate < now) {
        return res.status(403).json({
          success: false,
          message: "Subscription expired. Please renew your plan.",
        });
      }

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Subscription check failed",
        error: error.message,
      });
    }
  }
);
