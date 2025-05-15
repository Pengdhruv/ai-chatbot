import { getTokenBudgetByUserIdAndModelId } from "@/lib/db/queries"

export async function checkTokenBudget({
  userId,
  modelId,
  estimatedTokens,
}: {
  userId: string
  modelId: string
  estimatedTokens: number
}) {
  const budget = await getTokenBudgetByUserIdAndModelId({
    userId,
    modelId,
  })

  if (!budget) {
    throw new Error("No token budget found for this model. Please request tokens to get started.")
  }

  const remainingTokens = budget.totalBudget - budget.usedBudget

  if (remainingTokens < estimatedTokens) {
    throw new Error("Insufficient token budget. Please request more tokens.")
  }

  return true
}
