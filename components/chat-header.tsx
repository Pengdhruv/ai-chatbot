"use client"

import { useEffect, useState } from "react"
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { ModelSelector } from "@/components/model-selector"
import { VisibilitySelector } from "@/components/visibility-selector"
import { TokenBudgetDisplay } from "@/components/token-budget-display"
import { getTokenBudgetForModel } from "@/app/(chat)/actions"

export function ChatHeader({
  id,
  title,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  onChatModelChange,
  onVisibilityChange,
}: {
  id: string
  title?: string
  selectedChatModel: string
  selectedVisibilityType: string
  isReadonly: boolean
  onChatModelChange?: (model: string) => void
  onVisibilityChange?: (visibility: string) => void
}) {
  const { state, openMobile } = useSidebar()
  const [tokenBudget, setTokenBudget] = useState<{ totalBudget: number; usedBudget: number } | null>(null)

  useEffect(() => {
    const fetchTokenBudget = async () => {
      try {
        const budget = await getTokenBudgetForModel(selectedChatModel)
        setTokenBudget(budget)
      } catch (error) {
        console.error("Failed to fetch token budget:", error)
      }
    }

    fetchTokenBudget()
  }, [selectedChatModel])

  const shouldShowSidebarTrigger = state === "collapsed" || !openMobile

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-b bg-background sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        {/* ✅ Show only if collapsed or closed on mobile */}
        {shouldShowSidebarTrigger && (
          <SidebarTrigger className="block md:content" />
        )}

        <div className="flex flex-wrap items-center gap-3">
          <ModelSelector selectedModelId={selectedChatModel} onChange={onChatModelChange} />
          {!isReadonly && (
            <VisibilitySelector
              selectedVisibilityType={selectedVisibilityType}
              onChange={onVisibilityChange}
            />
          )}
        </div>
      </div>

      {tokenBudget && (
        <TokenBudgetDisplay
          modelId={selectedChatModel}
          availableTokens={tokenBudget.totalBudget}
          usedTokens={tokenBudget.usedBudget}
        />
      )}
    </header>
  )
}
