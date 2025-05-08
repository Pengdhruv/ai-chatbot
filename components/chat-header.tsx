"use client"

import { useEffect, useState } from "react"
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

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <ModelSelector selectedModelId={selectedChatModel} onChange={onChatModelChange} />
        {!isReadonly && (
          <VisibilitySelector selectedVisibilityType={selectedVisibilityType} onChange={onVisibilityChange} />
        )}
      </div>

      {tokenBudget && (
        <TokenBudgetDisplay
          modelId={selectedChatModel}
          availableTokens={tokenBudget.totalBudget}
          usedTokens={tokenBudget.usedBudget}
        />
      )}
    </div>
  )
}
