import { Request, Response } from "express";
import { sendEmail } from "../../utils/mailer";

export async function submitFeedback(req: Request, res: Response) {
  try {
    const { name, email, category, subject, message, rating, timestamp } = req.body;

    if (!category || !subject) {
      return res.status(400).json({ success: false, message: "category and subject are required" });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "rozykoranga@gmail.com";
    const mailSubject = `[Feedback - ${category}] ${subject || "No Subject"}`;

    const time = timestamp ? new Date(Number(timestamp)).toISOString() : new Date().toISOString();

    const plain = [
      `Name: ${name || "Anonymous"}`,
      `Email: ${email || "Not provided"}`,
      `Category: ${category}`,
      `Subject: ${subject || ""}`,
      `Rating: ${rating ?? "N/A"}`,
      `Message: ${message || ""}`,
      `Timestamp: ${time}`,
    ].join("\n");

    const html = `
      <h3>New Feedback Submission</h3>
      <p><strong>Name:</strong> ${name || "Anonymous"}</p>
      <p><strong>Email:</strong> ${email || "Not provided"}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Subject:</strong> ${subject || ""}</p>
      <p><strong>Rating:</strong> ${rating ?? "N/A"}</p>
      <p><strong>Message:</strong><br/>${(message || "").replace(/\n/g, "<br/>")}</p>
      <p><em>Submitted at ${time}</em></p>
    `;

    await sendEmail(adminEmail, mailSubject, plain, html);

    return res.status(200).json({ success: true, message: "Feedback emailed to admin" });
  } catch (err: any) {
    console.error("Feedback email error:", err);
    return res.status(500).json({ success: false, message: "Failed to send feedback email", error: err?.message });
  }
}