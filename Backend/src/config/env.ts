import dotenv from "dotenv";

dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",
  
  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES || "15m",
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  
  // Bcrypt
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  
  // URLs
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  // Comma-separated list of allowed origins for CORS. Example:
  // ALLOWED_ORIGINS=https://gentle-bay-0cb5bce00.azurestaticapps.net,https://gentle-bay-0cb5bce00.3.azurestaticapps.net,http://localhost:3000
  // If not set, default to FRONTEND_URL and a known variant including .3 for Azure SWA static URL.
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || (() => {
    const frontend = process.env.FRONTEND_URL || "http://localhost:3000";
    // If it's an Azure static apps domain (missing `.3`) add a `.3` variant too
    if (frontend.includes("azurestaticapps.net") && !frontend.includes(".3.")) {
      const with3 = frontend.replace(".azurestaticapps.net", ".3.azurestaticapps.net");
      return `${frontend},${with3}`;
    }
    return frontend;
  })(),
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5000",
  
  // Email
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "",
  
  // Razorpay
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || "",
  
  // WhatsApp
  WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || "",
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  WHATSAPP_WABA_ID: process.env.WHATSAPP_WABA_ID || "",
  WHATSAPP_API_URL: process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v20.0",
} as const;

export default env;
