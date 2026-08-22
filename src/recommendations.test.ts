import { describe, expect, it } from 'vitest'
import { getSuggestions } from './recommendations'

describe('getSuggestions', () => {
  it('does not recommend an active list item', () => {
    const result = getSuggestions([], [{ id: '1', name: 'Whole milk', normalizedName: 'whole milk', quantity: 1, unit: 'item', category: 'dairy', completed: false, createdAt: '', updatedAt: '' }], new Date(2026, 0, 1))
    expect(result.some((item) => item.id === 'milk')).toBe(false)
  })
})
