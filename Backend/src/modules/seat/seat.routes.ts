import { Router } from "express";
import { getSeats, updateSeat, bulkAddSeats, bulkDeleteSeats } from "./seat.controller";

// This router gets mounted under /api/admin with authenticate + isAdmin applied by admin.routes.ts
const router = Router();

router.get("/", getSeats);
router.patch("/:id", updateSeat);
router.post("/bulk-add", bulkAddSeats);
router.delete("/", bulkDeleteSeats);

export default router;