import express from "express";
import { sendReminderMessage } from "../whatsapp/controller";

const router = express.Router();

router.post("/send-reminder", sendReminderMessage);

export default router;
