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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4">
          <div className="text-sm font-medium text-muted-foreground">Total Seats</div>
          <div className="mt-2 text-3xl font-bold text-foreground">{stats.total}</div>
          <div className="mt-1 text-xs text-muted-foreground">Library capacity</div>
        </div>
        <div className="rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-transparent p-4">
          <div className="text-sm font-medium text-muted-foreground">Occupied Seats</div>
          <div className="mt-2 text-3xl font-bold text-orange-600">{stats.occupied}</div>
          <div className="mt-1 text-xs text-orange-600">{stats.occupancyRate}% occupancy</div>
        </div>
        <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-transparent p-4">
          <div className="text-sm font-medium text-muted-foreground">Available Seats</div>
          <div className="mt-2 text-3xl font-bold text-green-600">{stats.available}</div>
          <div className="mt-1 text-xs text-green-600">Ready for booking</div>
        </div>
        <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-transparent p-4">
          <div className="text-sm font-medium text-muted-foreground">Occupancy Rate</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">{stats.occupancyRate}%</div>
          <div className="mt-1 text-xs text-blue-600">
            <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.occupancyRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="rounded-lg border p-5 bg-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Add Seats */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Add Seats</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Seat Type</label>
                <select
                  className="w-full border rounded-md px-3 py-2 bg-background text-sm"
                  value={addType}
                  onChange={(e) => setAddType(e.target.value as SeatType)}
                >
                  <option value="REGULAR">🪑 Regular</option>
                  <option value="SPECIAL">⭐ Special</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Count</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  className="w-full border rounded-md px-3 py-2 bg-background text-sm"
                  value={addCount}
                  onChange={(e) => setAddCount(Math.min(100, Math.max(1, parseInt(e.target.value || "1", 10))))}
                />
              </div>
              <button
                onClick={handleAddSeats}
                className="w-full inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
              >
                Add Seats
              </button>
            </div>
          </div>

          {/* Filters */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Filter Seats</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Seat Type</label>
                <select
                  className="w-full border rounded-md px-3 py-2 bg-background text-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                >
                  <option value="ALL">All Types</option>
                  <option value="REGULAR">Regular Only</option>
                  <option value="SPECIAL">Special Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Availability</label>
                <select
                  className="w-full border rounded-md px-3 py-2 bg-background text-sm"
                  value={filterAvail}
                  onChange={(e) => setFilterAvail(e.target.value as FilterAvailability)}
                >
                  <option value="ALL">All Status</option>
                  <option value="AVAILABLE_FULL">Available Full Day</option>
                  <option value="AVAILABLE_MORNING">Morning Shift</option>
                  <option value="AVAILABLE_EVENING">Evening Shift</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => selectAllVisible(true)}
                  className="flex-1 text-xs font-medium px-2 py-2 rounded border border-primary text-primary hover:bg-primary/10 transition"
                >
                  Select All
                </button>
                <button
                  onClick={() => selectAllVisible(false)}
                  className="flex-1 text-xs font-medium px-2 py-2 rounded border border-muted text-muted-foreground hover:bg-muted transition"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Delete Selected */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Bulk Actions</h3>
            <div className="space-y-3 h-full flex flex-col">
              <div className="flex-1">
                <div className="text-2xl font-bold text-destructive">{selectedIds.size}</div>
                <div className="text-xs text-muted-foreground">seats selected</div>
              </div>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0}
                className="w-full inline-flex items-center justify-center rounded-md bg-destructive px-3 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="font-medium">Error</div>
          <div>{error}</div>
        </div>
      )}

      {/* Seats Grid */}
      <div className="rounded-lg border overflow-hidden bg-card">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin">⏳</div>
            <div className="text-sm text-muted-foreground mt-2">Loading seats…</div>
          </div>
        ) : filteredSeats.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-2xl mb-2">📭</div>
            <div className="text-sm text-muted-foreground">No seats to display with current filters</div>
          </div>
        ) : (
          <div className="p-4 lg:p-6">
            <div className="text-sm font-medium text-muted-foreground mb-4">
              Showing {filteredSeats.length} seat(s)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredSeats.map((seat) => {
                const isSelected = selectedIds.has(seat._id)
                const available = !seat.occupied
                return (
                  <div
                    key={seat._id}
                    className={`relative rounded-lg border-2 transition-all ${
                      available
                        ? "border-green-200 bg-green-50 hover:shadow-md"
                        : "border-orange-200 bg-orange-50 hover:shadow-md"
                    } ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
                  >
                    {/* Checkbox */}
                    {available && (
                      <div className="absolute top-2 right-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelect(seat._id, e.target.checked)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </div>
                    )}

                    <div className="p-3">
                      {/* Seat Number */}
                      <div className="font-bold text-lg text-foreground mb-1">
                        {seat.seatNumber}
                      </div>

                      {/* Seat Type Badge */}
                      <div className="mb-2">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-1 rounded-full ${
                            seat.type === "REGULAR"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {seat.type === "REGULAR" ? "🪑 Regular" : "⭐ Special"}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-1 mb-3">
                        <span
                          className={`text-xs font-medium ${
                            available ? "text-green-700" : "text-orange-700"
                          }`}
                        >
                          {available ? "✓ Available" : "✗ Occupied"}
                        </span>
                      </div>

                      {/* Occupancy Type */}
                      <div className="mb-3">
                        <select
                          className="w-full border rounded px-2 py-1 text-xs bg-white"
                          value={seat.occupied ? (seat.occupancyType || "FULL_DAY") : ""}
                          onChange={(e) =>
                            handleChangeOccupancyType(seat, (e.target.value || "") as OccupancyType | "")
                          }
                        >
                          <option value="">{available ? "— Available —" : "— Select —"}</option>
                          <option value="FULL_DAY">Full Day</option>
                          <option value="MORNING">Morning</option>
                          <option value="EVENING">Evening</option>
                        </select>
                      </div>

                      {/* Mark Button */}
                      <button
                        onClick={() => handleToggleOccupied(seat, !seat.occupied)}
                        className={`w-full text-xs font-medium px-2 py-1.5 rounded transition ${
                          seat.occupied
                            ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        }`}
                      >
                        {seat.occupied ? "Available" : "Occupied"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
