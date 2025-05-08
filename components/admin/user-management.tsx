"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { chatModels } from "@/lib/ai/models"
import {
  updateUserAdminStatus,
  upsertTokenBudget,
  bulkUpdateTokenBudget,
  bulkSetTokenBudgetToZero,
} from "@/app/admin/actions"
import type { User } from "@/lib/db/schema"

interface UserManagementProps {
  users: User[]
}

export function UserManagement({ users }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<Record<string, boolean>>({})
  const [isBulkTokenDialogOpen, setIsBulkTokenDialogOpen] = useState(false)
  const [isBulkRevokeDialogOpen, setIsBulkRevokeDialogOpen] = useState(false)

  const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchTerm.toLowerCase()))

  const selectedUserIds = Object.entries(selectedUsers)
    .filter(([_, isSelected]) => isSelected)
    .map(([userId]) => userId)

  const hasSelectedUsers = selectedUserIds.length > 0

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Input
          placeholder="Search users by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <div className="flex space-x-2">
          <Dialog open={isBulkTokenDialogOpen} onOpenChange={setIsBulkTokenDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!hasSelectedUsers}>Assign Tokens to Selected</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Tokens to {selectedUserIds.length} Users</DialogTitle>
              </DialogHeader>
              <BulkTokenForm userIds={selectedUserIds} onComplete={() => setIsBulkTokenDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isBulkRevokeDialogOpen} onOpenChange={setIsBulkRevokeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" disabled={!hasSelectedUsers}>
                Revoke Tokens from Selected
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Revoke Tokens from {selectedUserIds.length} Users</DialogTitle>
              </DialogHeader>
              <BulkRevokeForm userIds={selectedUserIds} onComplete={() => setIsBulkRevokeDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-4 flex items-center space-x-2">
        <Checkbox
          id="select-all"
          checked={filteredUsers.length > 0 && filteredUsers.every((user) => selectedUsers[user.id])}
          onCheckedChange={(checked) => {
            if (checked) {
              const newSelected = { ...selectedUsers }
              filteredUsers.forEach((user) => {
                newSelected[user.id] = true
              })
              setSelectedUsers(newSelected)
            } else {
              const newSelected = { ...selectedUsers }
              filteredUsers.forEach((user) => {
                newSelected[user.id] = false
              })
              setSelectedUsers(newSelected)
            }
          }}
        />
        <Label htmlFor="select-all">Select All</Label>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            isSelected={!!selectedUsers[user.id]}
            onSelectChange={(selected) => {
              setSelectedUsers((prev) => ({
                ...prev,
                [user.id]: selected,
              }))
            }}
          />
        ))}
      </div>
    </div>
  )
}

function UserCard({
  user,
  isSelected,
  onSelectChange,
}: {
  user: User
  isSelected: boolean
  onSelectChange: (selected: boolean) => void
}) {
  const [is_admin, setIsAdmin] = useState(user.is_admin)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleAdminToggle = async () => {
    const newStatus = !is_admin
    setIsAdmin(newStatus)
    await updateUserAdminStatus({ userId: user.id, is_admin: newStatus })
  }

  return (
    <Card className={isSelected ? "border-primary" : undefined}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectChange(!!checked)}
              id={`select-user-${user.id}`}
            />
            <span className="truncate">{user.email}</span>
          </div>
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

function BulkTokenForm({
  userIds,
  onComplete,
}: {
  userIds: string[]
  onComplete: () => void
}) {
  const [selectedModel, setSelectedModel] = useState(chatModels[0].id)
  const [tokenAmount, setTokenAmount] = useState("10000")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await bulkUpdateTokenBudget({
        userIds,
        modelId: selectedModel,
        totalBudget: Number.parseInt(tokenAmount),
      })
      onComplete()
    } catch (error) {
      console.error("Failed to update token budgets:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="bulk-model">Model</Label>
        <select
          id="bulk-model"
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
        <Label htmlFor="bulk-tokens">Token Budget</Label>
        <Input
          id="bulk-tokens"
          type="number"
          value={tokenAmount}
          onChange={(e) => setTokenAmount(e.target.value)}
          min="0"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Updating..." : `Assign Tokens to ${userIds.length} Users`}
      </Button>
    </form>
  )
}

function BulkRevokeForm({
  userIds,
  onComplete,
}: {
  userIds: string[]
  onComplete: () => void
}) {
  const [selectedModels, setSelectedModels] = useState<Record<string, boolean>>(
    chatModels.reduce((acc, model) => ({ ...acc, [model.id]: false }), {}),
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const modelsToRevoke = Object.entries(selectedModels)
        .filter(([_, isSelected]) => isSelected)
        .map(([modelId]) => modelId)

      if (modelsToRevoke.length === 0) {
        return
      }

      await bulkSetTokenBudgetToZero({
        userIds,
        modelIds: modelsToRevoke,
      })

      onComplete()
    } catch (error) {
      console.error("Failed to revoke token budgets:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label>Select Models to Revoke</Label>
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
          {chatModels.map((model) => (
            <div key={model.id} className="flex items-center space-x-2">
              <Checkbox
                id={`revoke-model-${model.id}`}
                checked={selectedModels[model.id]}
                onCheckedChange={(checked) => {
                  setSelectedModels((prev) => ({
                    ...prev,
                    [model.id]: !!checked,
                  }))
                }}
              />
              <Label htmlFor={`revoke-model-${model.id}`} className="text-sm">
                {model.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSelectedModels(chatModels.reduce((acc, model) => ({ ...acc, [model.id]: true }), {}))
          }}
          className="flex-1"
        >
          Select All
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSelectedModels(chatModels.reduce((acc, model) => ({ ...acc, [model.id]: false }), {}))
          }}
          className="flex-1"
        >
          Clear All
        </Button>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || Object.values(selectedModels).every((v) => !v)}
        variant="destructive"
        className="w-full"
      >
        {isSubmitting ? "Revoking..." : `Revoke Tokens from ${userIds.length} Users`}
      </Button>
    </form>
  )
}
