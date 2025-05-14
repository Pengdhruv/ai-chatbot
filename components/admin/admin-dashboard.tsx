"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/user-management";
import { TokenRequestManagement } from "@/components/admin/token-request-management";
import { TokenAnalytics } from "@/components/admin/token-analytics";
import { UserAnalytics } from "@/components/admin/user-analytics";
import type {
  User,
  TokenRequest,
  TokenUsageData,
  UserTokenUsage,
} from "@/lib/db/schema";
import clsx from "clsx";

type TabKey = "users" | "requests" | "token-analytics" | "user-analytics";

interface AdminDashboardProps {
  users: User[];
  tokenRequests: {
    request: TokenRequest;
    user: {
      id: string;
      email: string;
    };
  }[];
  tokenUsageData: TokenUsageData;
  userTokenUsage: UserTokenUsage[];
}

export function AdminDashboard({
  users,
  tokenRequests,
  tokenUsageData,
  userTokenUsage,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("users");

  const tabTriggerClass =
    "relative px-4 py-2 text-sm font-medium data-[state=active]:bg-muted rounded-md transition-colors";

  return (
    <section className="p-4 md:p-6 lg:p-8 max-w-screen-xl mx-auto">
      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="flex flex-wrap gap-2 justify-start sticky top-0 z-10 bg-background py-2 border-b"
          aria-label="Admin Dashboard Tabs"
        >
          <TabsTrigger value="users" className={tabTriggerClass}>
            User Management
          </TabsTrigger>

          <TabsTrigger value="requests" className={tabTriggerClass}>
            Token Requests
            {tokenRequests.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center text-xs font-semibold rounded-full bg-destructive text-white w-5 h-5">
                {tokenRequests.length}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger value="token-analytics" className={tabTriggerClass}>
            Token Analytics
          </TabsTrigger>

          <TabsTrigger value="user-analytics" className={tabTriggerClass}>
            User Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <UserManagement users={users} />
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <TokenRequestManagement tokenRequests={tokenRequests} />
        </TabsContent>

        {/* <TabsContent value="token-analytics" className="mt-6">
          <TokenAnalytics tokenUsageData={tokenUsageData} />
        </TabsContent>

        <TabsContent value="user-analytics" className="mt-6">
          <UserAnalytics userTokenUsage={userTokenUsage} />
        </TabsContent> */}
      </Tabs>
    </section>
  );
}
