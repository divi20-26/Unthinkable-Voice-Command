export type Category = 'dairy' | 'fruits' | 'vegetables' | 'grains' | 'spices' | 'cooking' | 'bakery-snacks' | 'meat-protein' | 'other'
export type Unit = 'item' | 'bottle' | 'can' | 'box' | 'bag' | 'pack' | 'kg' | 'lb' | 'liter' | 'gallon'
export type Language = 'en-US' | 'hi-IN' | 'es-ES'

export interface ShoppingItem { id: string; name: string; normalizedName: string; quantity: number; unit: Unit; category: Category; completed: boolean; createdAt: string; updatedAt: string }
export interface Product { id: string; name: string; brand: string; category: Category; price: number; unitLabel: string; aliases: string[]; seasonalMonths: number[]; onSale: boolean; substituteIds: string[] }
export interface PurchaseRecord { productName: string; category: Category; quantity: number; purchasedAt: string }
export interface Suggestion extends Product { reason: string }

export type ParsedCommand =
  | { type: 'add'; itemName: string; quantity: number; unit: Unit }
  | { type: 'remove'; itemName: string }
  | { type: 'update'; itemName: string; quantity?: number; unit?: Unit }
  | { type: 'search'; query: string; brand?: string; maxPrice?: number }
  | { type: 'unknown'; transcript: string }
