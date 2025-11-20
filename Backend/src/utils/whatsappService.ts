import axios from "axios";

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Function to send a pre-approved message template
export const sendWhatsAppTemplate = async (
  to: string,
  templateName: string,
  languageCode = "en_US"
) => {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ WhatsApp Message Sent:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ WhatsApp Send Error:", error.response?.data || error.message);
    throw new Error("Failed to send WhatsApp message");
  }
};
