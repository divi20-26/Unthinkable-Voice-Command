import type { ParsedCommand, Unit } from './types'

const numberWords: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, एक: 1, दो: 2, तीन: 3, चार: 4, पांच: 5 }
const units: Unit[] = ['bottle', 'can', 'box', 'bag', 'pack', 'kg', 'lb', 'liter', 'gallon', 'item']
const clean = (value: string) => value.toLowerCase().replace(/[.,!?]/g, ' ').replace(/\s+/g, ' ').trim()
const quantity = (text: string) => { const match = text.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|एक|दो|तीन|चार|पांच)\b/); return match ? Number(match[1]) || numberWords[match[1]] : 1 }
const unit = (text: string): Unit => { const found = units.find((value) => new RegExp(`\\b${value}s?\\b`).test(text)); return found ?? 'item' }
const subject = (text: string) => text.replace(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\b/g, '').replace(/\b(bottles?|cans?|boxes?|bags?|packs?|kgs?|lbs?|liters?|gallons?|items?)\b/g, '').replace(/\b(of|for|from|my|the|to|please|under|below|list|dollars?|dollar|some|a|an|and|put|get|on|need|want|buy|add|quiero|necesito|comprar|agrega|añade)\b/g, '').replace(/खरीदना है|खरीदना|खरीद|चाहिए|है/g, '').replace(/[₹$]\s*\d+(?:\.\d+)?/g, '').replace(/[₹$]/g, '').replace(/\s+/g, ' ').trim()

export function parseCommand(input: string): ParsedCommand {
  const text = clean(input)
  if (!text) return { type: 'unknown', transcript: input }
  if (/^(remove|delete|take off|elimina|eliminar|हटाओ|हटा)\b/.test(text)) return { type: 'remove', itemName: subject(text.replace(/^(remove|delete|take off|elimina|eliminar|हटाओ|हटा)\s*/, '')) }
  if (/^(change|update|set|cambia|actualiza)\b/.test(text)) { const itemName = subject(text.replace(/^(change|update|set|cambia|actualiza)\s*/, '')).replace(/\bquantity\b/g, '').replace(/\s*\bto\b.*$/, '').trim(); return { type: 'update', itemName, quantity: quantity(text) } }
  if (/^(find|search|look for|busca|buscar)\b/.test(text)) { const max = text.match(/(?:under|below|less than|menos de)\s*[₹$]?\s*(\d+(?:\.\d+)?)/); const brandMatch = text.match(/\b(?:brand)\s+([a-z &]+?)(?:\s+(?:cereal|milk|bread|coffee|apples)|\s+under|\s+below|$)/); return { type: 'search', query: subject(text.replace(/^(find|search|look for|busca|buscar)\s*/, '')), maxPrice: max ? Number(max[1]) : undefined, brand: brandMatch?.[1]?.trim() } }
  if (/^(add|buy|need|want to buy|pick up|agrega|comprar|necesito|जोड़ो|चाहिए|खरीदो)\b/.test(text) || /\bi need\b/.test(text)) return { type: 'add', itemName: subject(text.replace(/^(add|buy|need|want to buy|pick up|agrega|comprar|necesito|जोड़ो|चाहिए|खरीदो)\s*/, '').replace(/^i need\s*/, '')), quantity: quantity(text), unit: unit(text) }
  return { type: 'add', itemName: subject(text), quantity: quantity(text), unit: unit(text) }
}
