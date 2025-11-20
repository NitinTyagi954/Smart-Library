// src/modules/auth/auth.controller.ts
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { registerSchema, loginSchema,forgotPasswordSchema,resetPasswordSchema } from "./auth.schema";
import { asyncHandler } from "../../utils/asyncHandler";
import { z } from "zod";
import { sendEmail } from "../../utils/mailer";
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

// Helper function to format user response (remove sensitive data)
const formatUserResponse = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// ✅ Common validator wrapper for Zod
function validate<T>(schema: any, data: any, res: Response): T | undefined {
  const validationResult = schema.safeParse(data);
  if (!validationResult.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationResult.error.issues.map((issue: import("zod").ZodIssue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }
  return validationResult.data as T;
}

// Register Controller
export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = validate<RegisterInput>(registerSchema, req.body, res);
  if (!parsed) return;

  const { name, email, phone, password, role } = parsed;
  const user = await AuthService.register({ name, email, phone, password, role }, res);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: { user: formatUserResponse(user) },
  });
});

// Login Controller
export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = validate<LoginInput>(loginSchema, req.body, res);
  if (!parsed) return;

  const { email, password } = parsed;
  const user = await AuthService.login({ email, password }, res);

res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user: formatUserResponse(user) },
  });
});

// Logout Controller
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.logout(res);
  res.status(200).json({ success: true, message: result.message });
});

// Refresh Token Controller
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: "Refresh token not found",
    });
  } 

  const user = await AuthService.refresh(refreshToken, res);
  res.status(200).json({
    success: true,
    message: "Tokens refreshed successfully",
    data: { user: formatUserResponse(user) },
  });
});

// Get Current User Controller
export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated",
    });
  }
  res.status(200).json({
    success: true,
    message: "Current user retrieved successfully",
    data: { user: formatUserResponse(user) },
  });
});


// ==================== Forgot & Reset Password ==================== //

// Forgot Password Controller
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
   const parsed = validate<ForgotPasswordInput>(forgotPasswordSchema, req.body, res);

  if (!parsed) return;

  await AuthService.requestPasswordReset(parsed.email);

  res.status(200).json({
    success: true,
    message: "If an account exists, we’ve emailed a reset link.",
  });
});

// Reset Password Controller
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  console.log("RESET PASSWORD BODY:", req.body);
  const parsed = validate<ResetPasswordInput>(resetPasswordSchema, req.body, res);
  if (!parsed) return;

  // Allow token either in body (preferred) or as query fallback
  const token = (parsed.token || (req.query.token as string) || "").trim();
  const { password /*, confirmPassword*/ } = parsed;

  await AuthService.resetPassword(token, password);

  res.status(200).json({
    success: true,
    message: "Password updated successfully. Please log in again.",
  });
});

// Submit Feedback Controller
export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, category, subject, message, rating, timestamp } = req.body || {}
  const adminEmail = process.env.ADMIN_EMAIL || "rozykoranga@gmail.com"
  const mailSubject = `[Feedback - ${category}] ${subject || "No Subject"}`
  const text = `Name: ${name || "Anonymous"}\nEmail: ${email || "Not provided"}\nCategory: ${category}\nSubject: ${subject}\nRating: ${rating ?? "N/A"}\nMessage:\n${message || ""}\nTime: ${new Date(timestamp || Date.now()).toISOString()}`
  await sendEmail(adminEmail, mailSubject, text)
  res.status(200).json({ success: true, message: "Feedback emailed to admin" })
})

