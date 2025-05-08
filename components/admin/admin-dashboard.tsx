"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserManagement } from "@/components/admin/user-management"
import { TokenRequestManagement } from "@/components/admin/token-request-management"
import type { User, TokenRequest } from "@/lib/db/schema"

interface AdminDashboardProps {
  users: User[]
  tokenRequests: {
    request: TokenRequest
    user: {
      id: string
      email: string
    }
  }[]
}

export function AdminDashboard({ users, tokenRequests }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("users")

  return (
    <Tabs defaultValue="users" onValueChange={setActiveTab} value={activeTab}>
      <TabsList className="mb-8">
        <TabsTrigger value="users">User Management</TabsTrigger>
        <TabsTrigger value="requests">
          Token Requests{" "}
          {tokenRequests.length > 0 && (
            <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">{tokenRequests.length}</span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <UserManagement users={users} />
      </TabsContent>

      <TabsContent value="requests">
        <TokenRequestManagement tokenRequests={tokenRequests} />
      </TabsContent>
    </Tabs>
  )
}
