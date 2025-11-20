import { SeatManagement } from "@/components/admin/seat-management"

export default function SeatsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 font-serif">Seat Management</h1>
        <p className="text-muted-foreground">Manage library seating capacity and availability.</p>
      </div>
      <SeatManagement />
    </div>
  )
}
