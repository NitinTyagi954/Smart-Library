import { Request, Response } from "express";
import { sendWhatsAppTemplate } from "../../utils/whatsappService";

export const sendReminderMessage = async (req: Request, res: Response) => {
  try {
    const { phone, templateName } = req.body;

    if (!phone || !templateName) {
      return res.status(400).json({ success: false, message: "Missing phone or template name" });
    }

    const data = await sendWhatsAppTemplate(phone, templateName);
    res.status(200).json({ success: true, message: "Reminder sent successfully", data });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Failed to send WhatsApp message",
    });
  }
};
