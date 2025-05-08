"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { chatModels } from "@/lib/ai/models"
import { updateUserAdminStatus, upsertTokenBudget } from "@/app/admin/actions"
import type { User } from "@/lib/db/schema"

interface UserManagementProps {
  users: User[]
}

export function UserManagement({ users }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div>
      <div className="mb-6">
        <Input
          placeholder="Search users by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  )
}

function UserCard({ user }: { user: User }) {
  const [is_admin, setIsAdmin] = useState(user.is_admin)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAdminToggle = async () => {
    const newStatus = !is_admin
    setIsAdmin(newStatus)
    await updateUserAdminStatus({ userId: user.id, is_admin: newStatus })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="truncate">{user.email}</span>
          <div className="flex items-center space-x-2">
            <Switch checked={is_admin} onCheckedChange={handleAdminToggle} id={`admin-switch-${user.id}`} />
            <Label htmlFor={`admin-switch-${user.id}`}>Admin</Label>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              Manage Token Budgets
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Token Budgets for {user.email}</DialogTitle>
            </DialogHeader>
            <TokenBudgetForm userId={user.id} onComplete={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

function TokenBudgetForm({ userId, onComplete }: { userId: string; onComplete: () => void }) {
  const [selectedModel, setSelectedModel] = useState(chatModels[0].id)
  const [tokenAmount, setTokenAmount] = useState("10000")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await upsertTokenBudget({
        userId,
        modelId: selectedModel,
        totalBudget: Number.parseInt(tokenAmount),
      })
      onComplete()
    } catch (error) {
      console.error("Failed to update token budget:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="model">Model</Label>
        <select
          id="model"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          {chatModels.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tokens">Token Budget</Label>
        <Input id="tokens" type="number" value={tokenAmount} onChange={(e) => setTokenAmount(e.target.value)} min="0" />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Updating..." : "Update Budget"}
      </Button>
    </form>
  )
}
