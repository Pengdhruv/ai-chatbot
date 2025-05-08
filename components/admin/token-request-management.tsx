"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { updateTokenRequestStatus, bulkUpdateTokenRequestStatus } from "@/app/admin/actions"
import type { TokenRequest } from "@/lib/db/schema"

interface TokenRequestManagementProps {
  tokenRequests: {
    request: TokenRequest
    user: {
      id: string
      email: string
    }
  }[]
}

export function TokenRequestManagement({ tokenRequests }: TokenRequestManagementProps) {
  const [selectedRequests, setSelectedRequests] = useState<Record<string, boolean>>({})

  const selectedRequestIds = Object.entries(selectedRequests)
    .filter(([_, isSelected]) => isSelected)
    .map(([requestId]) => requestId)

  const hasSelectedRequests = selectedRequestIds.length > 0

  const handleBulkApprove = async () => {
    await bulkUpdateTokenRequestStatus({
      requestIds: selectedRequestIds,
      status: "approved",
    })
    // Reset selections after bulk action
    setSelectedRequests({})
  }

  const handleBulkReject = async () => {
    await bulkUpdateTokenRequestStatus({
      requestIds: selectedRequestIds,
      status: "rejected",
    })
    // Reset selections after bulk action
    setSelectedRequests({})
  }

  if (tokenRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No pending token requests</p>
      </div>
    )
  }

  return (
    <div>
      {hasSelectedRequests && (
        <div className="mb-6 p-4 bg-muted rounded-lg flex items-center justify-between">
          <div>
            <p className="font-medium">{selectedRequestIds.length} requests selected</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleBulkApprove}>Approve Selected</Button>
            <Button variant="outline" onClick={handleBulkReject}>
              Reject Selected
            </Button>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center space-x-2">
        <Checkbox
          id="select-all-requests"
          checked={tokenRequests.length > 0 && tokenRequests.every((item) => selectedRequests[item.request.id])}
          onCheckedChange={(checked) => {
            if (checked) {
              const newSelected = { ...selectedRequests }
              tokenRequests.forEach((item) => {
                newSelected[item.request.id] = true
              })
              setSelectedRequests(newSelected)
            } else {
              setSelectedRequests({})
            }
          }}
        />
        <Label htmlFor="select-all-requests">Select All</Label>
      </div>

      <div className="grid gap-6">
        {tokenRequests.map(({ request, user }) => (
          <RequestCard
            key={request.id}
            request={request}
            userEmail={user.email}
            isSelected={!!selectedRequests[request.id]}
            onSelectChange={(selected) => {
              setSelectedRequests((prev) => ({
                ...prev,
                [request.id]: selected,
              }))
            }}
          />
        ))}
      </div>
    </div>
  )
}

function RequestCard({
  request,
  userEmail,
  isSelected,
  onSelectChange,
}: {
  request: TokenRequest
  userEmail: string
  isSelected: boolean
  onSelectChange: (selected: boolean) => void
}) {
  const handleApprove = async () => {
    await updateTokenRequestStatus({
      requestId: request.id,
      status: "approved",
    })
  }

  const handleReject = async () => {
    await updateTokenRequestStatus({
      requestId: request.id,
      status: "rejected",
    })
  }

  return (
    <Card className={isSelected ? "border-primary" : undefined}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectChange(!!checked)}
              id={`select-request-${request.id}`}
            />
            <span>Token Request from {userEmail}</span>
          </div>
          <span className="text-sm font-normal text-muted-foreground">
            {new Date(request.createdAt).toLocaleString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Model</p>
              <p>{request.modelId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Requested Amount</p>
              <p>{request.requestedAmount.toLocaleString()} tokens</p>
            </div>
          </div>

          <div className="flex space-x-4 mt-4">
            <Button onClick={handleApprove} className="flex-1">
              Approve
            </Button>
            <Button onClick={handleReject} variant="outline" className="flex-1">
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
