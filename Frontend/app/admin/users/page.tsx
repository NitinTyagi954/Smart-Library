import { UserManagement } from "@/components/admin/user-management"

export default function UsersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2 font-serif">User Management</h1>
        <p className="text-muted-foreground">Manage student accounts and subscription details.</p>
      </div>
      <UserManagement />
    </div>
  )
}
