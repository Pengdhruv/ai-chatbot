"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateTokenRequestStatus } from "@/app/admin/actions";
import type { TokenRequest } from "@/lib/db/schema";

interface TokenRequestManagementProps {
  tokenRequests: {
    request: TokenRequest;
    user: { id: string; email: string };
  }[];
}

export function TokenRequestManagement({ tokenRequests }: TokenRequestManagementProps) {
  if (tokenRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No pending token requests</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {tokenRequests.map(({ request, user }) => (
        <RequestCard key={request.id} request={request} userEmail={user.email} />
      ))}
    </div>
  );
}

function RequestCard({ request, userEmail }: { request: TokenRequest; userEmail: string }) {
  const router = useRouter();              // ⬅️ get router

  const handle = async (status: "approved" | "rejected") => {
    try {
      await updateTokenRequestStatus({ requestId: request.id, status });
      toast.success(`Request ${status}.`);
      router.refresh();                   // ⬅️ re‑fetch server props
    } catch {
      toast.error("Something went wrong.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Token Request from {userEmail}</span>
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
              <p className="text-sm text-muted-foreground">Requested</p>
              <p>{request.requestedAmount.toLocaleString()} tokens</p>
            </div>
          </div>

          <div className="flex space-x-4 mt-4">
            <Button onClick={() => handle("approved")} className="flex-1">
              Approve
            </Button>
            <Button onClick={() => handle("rejected")} variant="outline" className="flex-1">
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
