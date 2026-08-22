import { describe, expect, it } from 'vitest'
import { parseCommand } from './parser'

describe('parseCommand', () => {
  it('parses quantities and units for additions', () => expect(parseCommand('Add 2 bottles of water')).toEqual({ type: 'add', itemName: 'water', quantity: 2, unit: 'bottle' }))
  it('parses removals and updates', () => {
    expect(parseCommand('Remove milk from my list')).toMatchObject({ type: 'remove', itemName: 'milk' })
    expect(parseCommand('Change apples to 6')).toMatchObject({ type: 'update', itemName: 'apples', quantity: 6 })
  })
  it('parses search price limits', () => expect(parseCommand('Find toothpaste under $5')).toMatchObject({ type: 'search', query: 'toothpaste', maxPrice: 5 }))
  it('accepts natural and bare add commands', () => {
    expect(parseCommand('I need some cake')).toMatchObject({ type: 'add', itemName: 'cake', quantity: 1 })
    expect(parseCommand('cake')).toMatchObject({ type: 'add', itemName: 'cake', quantity: 1 })
  })
  it('accepts rupee search limits', () => expect(parseCommand('Find toothpaste under ₹300')).toMatchObject({ type: 'search', query: 'toothpaste', maxPrice: 300 }))
  it('parses explicit quantity updates', () => expect(parseCommand('Change milk quantity to 3')).toMatchObject({ type: 'update', itemName: 'milk', quantity: 3 }))
  it('normalizes Hindi and Spanish add phrases', () => {
    expect(parseCommand('दूध खरीदना है')).toMatchObject({ type: 'add', itemName: 'दूध' })
    expect(parseCommand('necesito leche')).toMatchObject({ type: 'add', itemName: 'leche' })
  })
})
