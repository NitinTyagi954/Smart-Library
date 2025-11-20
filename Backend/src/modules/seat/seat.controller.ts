import { Request, Response } from "express";
import { Seat, ISeat, SeatType, OccupancyType } from "./seat.model";

function parseSeatNumber(num: string): number {
  // "R-12" -> 12
  const parts = num.split("-");
  const n = Number(parts[1] || "0");
  return Number.isFinite(n) ? n : 0;
}

function sortSeats(seats: ISeat[]): ISeat[] {
  const typeOrder: Record<SeatType, number> = { REGULAR: 0, SPECIAL: 1 };
  return seats.sort((a, b) => {
    if (a.type !== b.type) return typeOrder[a.type] - typeOrder[b.type];
    return parseSeatNumber(a.seatNumber) - parseSeatNumber(b.seatNumber);
  });
}

async function seedIfEmpty(): Promise<ISeat[]> {
  const count = await Seat.countDocuments();
  if (count > 0) {
    const seats = await Seat.find();
    return sortSeats(seats);
  }

  const docs: Partial<ISeat>[] = [];

  // 80 Regular seats: R-1 ... R-80
  for (let i = 1; i <= 80; i++) {
    docs.push({
      seatNumber: `R-${i}`,
      type: "REGULAR",
      occupied: false,
      occupancyType: null,
    } as Partial<ISeat>);
  }

  // 27 Special seats: S-1 ... S-27
  for (let i = 1; i <= 27; i++) {
    docs.push({
      seatNumber: `S-${i}`,
      type: "SPECIAL",
      occupied: false,
      occupancyType: null,
    } as Partial<ISeat>);
  }

  const inserted = await Seat.insertMany(docs);
  return sortSeats(inserted as ISeat[]);
}

export const getSeats = async (_req: Request, res: Response) => {
  const seats = await seedIfEmpty();
  return res.json({ success: true, data: seats });
};

export const updateSeat = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { occupied, occupancyType }: Partial<Pick<ISeat, "occupied" | "occupancyType">> = req.body || {};

  const seat = await Seat.findById(id);
  if (!seat) {
    return res.status(404).json({ success: false, message: "Seat not found" });
  }

  // Apply partial updates with rules:
  // - If occupied becomes true, occupancyType must be provided (defaults to FULL_DAY if not passed)
  // - If occupied becomes false, occupancyType must be null
  // - If only occupancyType is provided while currently not occupied, set occupied=true
  let nextOccupied = seat.occupied;
  let nextOccType = seat.occupancyType;

  if (typeof occupied === "boolean") {
    nextOccupied = occupied;
    if (occupied) {
      nextOccType = (occupancyType as OccupancyType) || "FULL_DAY";
    } else {
      nextOccType = null;
    }
  } else if (occupancyType !== undefined) {
    const val = occupancyType as OccupancyType | null;
    if (val === null) {
      // clearing occupancy type implies available
      nextOccupied = false;
      nextOccType = null;
    } else {
      // selecting a type implies occupied
      if (!["FULL_DAY", "MORNING", "EVENING"].includes(val)) {
        return res.status(400).json({ success: false, message: "Invalid occupancyType" });
      }
      nextOccupied = true;
      nextOccType = val;
    }
  }

  // Validate: when occupied = true -> occupancyType must be set
  if (nextOccupied && !nextOccType) {
    return res.status(400).json({ success: false, message: "occupancyType required when occupied is true" });
  }

  seat.occupied = nextOccupied;
  seat.occupancyType = nextOccType as any;
  await seat.save();

  return res.json({ success: true, data: seat });
};

export const bulkAddSeats = async (req: Request, res: Response) => {
  const { type, count } = req.body as { type: SeatType; count: number };

  if (!["REGULAR", "SPECIAL"].includes(type)) {
    return res.status(400).json({ success: false, message: "Invalid type" });
  }
  if (!Number.isFinite(count) || count <= 0) {
    return res.status(400).json({ success: false, message: "count must be a positive number" });
  }

  const prefix = type === "REGULAR" ? "R" : "S";

  const existing = await Seat.find({ type }, { seatNumber: 1 });
  const maxNum =
    existing.reduce((max, s) => Math.max(max, parseSeatNumber(s.seatNumber)), 0) || 0;

  const docs = Array.from({ length: count }).map((_, idx) => ({
    seatNumber: `${prefix}-${maxNum + idx + 1}`,
    type,
    occupied: false,
    occupancyType: null,
  }));

  const inserted = await Seat.insertMany(docs);
  return res.status(201).json({ success: true, data: sortSeats(inserted as ISeat[]) });
};

export const bulkDeleteSeats = async (req: Request, res: Response) => {
  const { ids } = req.body as { ids: string[] };

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: "ids array required" });
  }

  const seats = await Seat.find({ _id: { $in: ids } });
  if (seats.length !== ids.length) {
    return res.status(400).json({ success: false, message: "Some seat IDs do not exist" });
  }

  const occupiedSeats = seats.filter((s) => s.occupied);
  if (occupiedSeats.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete occupied seats",
      data: { occupiedIds: occupiedSeats.map((s) => s._id) },
    });
  }

  const result = await Seat.deleteMany({ _id: { $in: ids } });
  return res.json({ success: true, data: { deletedCount: result.deletedCount || 0 } });
};