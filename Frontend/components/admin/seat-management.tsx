"use client"

import { useEffect, useMemo, useState } from "react"
import { adminApi, Seat, SeatType, OccupancyType } from "@/lib/admin-api"

type FilterAvailability = "ALL" | "AVAILABLE_FULL" | "AVAILABLE_MORNING" | "AVAILABLE_EVENING"
type FilterType = "ALL" | SeatType

export function SeatManagement() {
  const [seats, setSeats] = useState<Seat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filterType, setFilterType] = useState<FilterType>("ALL")
  const [filterAvail, setFilterAvail] = useState<FilterAvailability>("ALL")

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [addType, setAddType] = useState<SeatType>("REGULAR")
  const [addCount, setAddCount] = useState<number>(1)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await adminApi.getSeats()
        setSeats(res.data)
        setError(null)
      } catch (e: any) {
        setError(e?.message || "Failed to load seats")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const total = seats.length
    const occupied = seats.filter(s => s.occupied).length
    const available = total - occupied
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0
    return { total, occupied, available, occupancyRate }
  }, [seats])

  const filteredSeats = useMemo(() => {
    let list = [...seats]
    if (filterType !== "ALL") list = list.filter(s => s.type === filterType)

    if (filterAvail === "AVAILABLE_FULL") {
      list = list.filter(s => s.occupied === false)
    } else if (filterAvail === "AVAILABLE_MORNING") {
      list = list.filter(s => !s.occupied || (s.occupied && s.occupancyType === "EVENING"))
    } else if (filterAvail === "AVAILABLE_EVENING") {
      list = list.filter(s => !s.occupied || (s.occupied && s.occupancyType === "MORNING"))
    }

    // Sort by type then numeric seat number
    const order: Record<SeatType, number> = { REGULAR: 0, SPECIAL: 1 }
    return list.sort((a, b) => {
      if (a.type !== b.type) return order[a.type] - order[b.type]
      const num = (x: Seat) => Number(x.seatNumber.split("-")[1] || 0)
      return num(a) - num(b)
    })
  }, [seats, filterType, filterAvail])

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const selectAllVisible = (checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      for (const s of filteredSeats) {
        if (!s.occupied) {
          if (checked) next.add(s._id)
          else next.delete(s._id)
        }
      }
      return next
    })
  }

  const handleAddSeats = async () => {
    if (!addCount || addCount <= 0) return
    try {
      const res = await adminApi.addSeatsBulk(addType, addCount)
      // Merge new seats
      setSeats(prev => {
        const merged = [...prev, ...res.data]
        // De-dup by _id just in case
        const seen = new Set<string>()
        return merged.filter(s => (seen.has(s._id) ? false : (seen.add(s._id), true)))
      })
      setAddCount(1)
    } catch (e: any) {
      setError(e?.message || "Failed to add seats")
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    try {
      await adminApi.deleteSeats(ids)
      setSeats(prev => prev.filter(s => !selectedIds.has(s._id)))
      setSelectedIds(new Set())
    } catch (e: any) {
      setError(e?.message || "Failed to delete seats")
    }
  }

  const handleToggleOccupied = async (seat: Seat, next: boolean) => {
    try {
      // If toggling to occupied and no occupancyType set, default to FULL_DAY
      const body: Partial<Pick<Seat, "occupied" | "occupancyType">> = next
        ? { occupied: true, occupancyType: seat.occupancyType ?? "FULL_DAY" }
        : { occupied: false, occupancyType: null }

      const res = await adminApi.updateSeat(seat._id, body)
      setSeats(prev => prev.map(s => (s._id === seat._id ? res.data : s)))
      // If seat becomes occupied, ensure it's not selected for deletion
      if (res.data.occupied) {
        setSelectedIds(prev => {
          const nextSel = new Set(prev)
          nextSel.delete(seat._id)
          return nextSel
        })
      }
    } catch (e: any) {
      setError(e?.message || "Failed to update seat")
    }
  }

  const handleChangeOccupancyType = async (seat: Seat, val: OccupancyType | "") => {
    try {
      // Selecting a type implies occupied; empty "" clears => available
      const body =
        val === "" ? { occupancyType: null } : { occupancyType: val as OccupancyType }
      const res = await adminApi.updateSeat(seat._id, body)
      setSeats(prev => prev.map(s => (s._id === seat._id ? res.data : s)))
      if (res.data.occupied) {
        setSelectedIds(prev => {
          const nextSel = new Set(prev)
          nextSel.delete(seat._id)
          return nextSel
        })
      }
    } catch (e: any) {
      setError(e?.message || "Failed to change occupancy type")
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Total Seats</div>
          <div className="mt-2 text-2xl font-semibold">{stats.total}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Occupied Seats</div>
          <div className="mt-2 text-2xl font-semibold">{stats.occupied}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Available Seats</div>
          <div className="mt-2 text-2xl font-semibold">{stats.available}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Occupancy Rate</div>
          <div className="mt-2 text-2xl font-semibold">{stats.occupancyRate}%</div>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          {/* Add seats */}
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col">
              <label className="text-sm text-muted-foreground">Type</label>
              <select
                className="border rounded px-2 py-1"
                value={addType}
                onChange={(e) => setAddType(e.target.value as SeatType)}
              >
                <option value="REGULAR">Regular</option>
                <option value="SPECIAL">Special</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-muted-foreground">Count</label>
              <input
                type="number"
                min={1}
                className="border rounded px-2 py-1 w-24"
                value={addCount}
                onChange={(e) => setAddCount(parseInt(e.target.value || "0", 10))}
              />
            </div>
            <button
              onClick={handleAddSeats}
              className="inline-flex items-center rounded bg-primary px-3 py-2 text-primary-foreground text-sm hover:opacity-90"
            >
              Add Seats
            </button>
          </div>

          {/* Delete selected */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              className="inline-flex items-center rounded bg-destructive px-3 py-2 text-destructive-foreground text-sm disabled:opacity-50"
            >
              Delete Selected ({selectedIds.size})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Seat Type</label>
            <select
              className="border rounded px-2 py-1"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
            >
              <option value="ALL">All</option>
              <option value="REGULAR">Regular</option>
              <option value="SPECIAL">Special</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Availability</label>
            <select
              className="border rounded px-2 py-1"
              value={filterAvail}
              onChange={(e) => setFilterAvail(e.target.value as FilterAvailability)}
            >
              <option value="ALL">All</option>
              <option value="AVAILABLE_FULL">Available Full Day</option>
              <option value="AVAILABLE_MORNING">Available Morning Shift</option>
              <option value="AVAILABLE_EVENING">Available Evening Shift</option>
            </select>
          </div>

          {/* Select/Deselect visible */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => selectAllVisible(true)}
              className="text-sm underline"
            >
              Select visible (available only)
            </button>
            <button
              onClick={() => selectAllVisible(false)}
              className="text-sm underline"
            >
              Clear selection
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded border border-destructive/40 bg-destructive/10 text-destructive px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Seats grid */}
      <div className="rounded-lg border">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading seats…</div>
        ) : filteredSeats.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No seats to display.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4">
            {filteredSeats.map((seat) => {
              const isSelected = selectedIds.has(seat._id)
              const available = !seat.occupied
              return (
                <div
                  key={seat._id}
                  className={`rounded border p-2 text-sm transition hover:shadow-sm ${seat.occupied ? "bg-muted" : "bg-background"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{seat.seatNumber}</div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        seat.type === "REGULAR" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {seat.type === "REGULAR" ? "Regular" : "Special"}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className={`text-xs ${available ? "text-green-600" : "text-red-600"}`}>
                      {available ? "Available" : "Occupied"}
                    </span>

                    <label className="inline-flex items-center gap-1 text-xs cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!available}
                        onChange={(e) => toggleSelect(seat._id, e.target.checked)}
                      />
                      Select
                    </label>
                  </div>

                  <div className="mt-2">
                    <label className="block text-[11px] text-muted-foreground mb-1">
                      Occupancy Type
                    </label>
                    <select
                      className="w-full border rounded px-2 py-1 text-xs"
                      value={seat.occupied ? (seat.occupancyType || "FULL_DAY") : ""}
                      onChange={(e) =>
                        handleChangeOccupancyType(seat, (e.target.value || "") as OccupancyType | "")
                      }
                    >
                      <option value="">{available ? "— Available —" : "Set type…"}</option>
                      <option value="FULL_DAY">Full Day</option>
                      <option value="MORNING">Morning Shift</option>
                      <option value="EVENING">Evening Shift</option>
                    </select>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Status</span>
                    <button
                      onClick={() => handleToggleOccupied(seat, !seat.occupied)}
                      className={`text-xs px-2 py-1 rounded ${
                        seat.occupied
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {seat.occupied ? "Mark Available" : "Mark Occupied"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
