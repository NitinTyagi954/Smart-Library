import { Router } from "express";
import { submitFeedback } from "./feedback.controller";

const router = Router();

// Public route to submit feedback (emails admin)
router.post("/", submitFeedback);

export default router;