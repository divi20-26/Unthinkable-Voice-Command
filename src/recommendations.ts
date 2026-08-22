import { products } from './data'
import type { ShoppingItem, PurchaseRecord, Suggestion } from './types'

export function getSuggestions(history: PurchaseRecord[], list: ShoppingItem[], date = new Date()): Suggestion[] {
  const active = new Set(list.filter((item) => !item.completed).map((item) => item.normalizedName))
  const counts = new Map<string, number>()
  history.forEach((record) => counts.set(record.productName, (counts.get(record.productName) ?? 0) + record.quantity))
  const month = date.getMonth() + 1
  return products.filter((product) => !active.has(product.name.toLowerCase()) && ((counts.get(product.name.toLowerCase()) ?? 0) > 0 || product.onSale || product.seasonalMonths.includes(month))).map((product) => {
    const frequency = counts.get(product.name.toLowerCase()) ?? 0
    const reason = frequency >= 2 ? 'Often on your list' : product.onSale ? 'On sale today' : 'In season now'
    return { ...product, reason, score: frequency * 3 + (product.onSale ? 2 : 0) + (product.seasonalMonths.includes(month) ? 2 : 0) }
  }).sort((a, b) => b.score - a.score).slice(0, 4)
}
