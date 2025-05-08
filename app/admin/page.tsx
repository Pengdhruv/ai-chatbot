import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { getAllUsers, getAllTokenRequests } from "@/lib/db/queries"

export default async function AdminPage() {
  const users = await getAllUsers()
  const tokenRequests = await getAllTokenRequests()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <AdminDashboard users={users} tokenRequests={tokenRequests} />
    </div>
  )
}
