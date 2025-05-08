import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { getAllUsers, getAllTokenRequests, getTokenUsageData, getUserTokenUsage } from "@/lib/db/queries"
import { redirect } from "next/navigation"
import { auth } from "@/app/(auth)/auth"

export default async function AdminPage() {
  // const session = await auth()

  // if (!session?.user) {
  //   redirect("/login")
  // }

  // const user = session.user as any
  // if (!user.is_admin) {
  //   redirect("/")
  // }
  const users = await getAllUsers()
  const tokenRequests = await getAllTokenRequests()
  const tokenUsageData = await getTokenUsageData()
  const userTokenUsage = await getUserTokenUsage()

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <AdminDashboard 
      users={users} 
      tokenRequests={tokenRequests}
      tokenUsageData={tokenUsageData}
      userTokenUsage={userTokenUsage}
       />
    </div>
  )
}
