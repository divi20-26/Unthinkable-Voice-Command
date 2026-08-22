import type { Category, Product } from './types'

export const categoryLabels: Record<Category, string> = { dairy: 'Dairy', fruits: 'Fruits', vegetables: 'Vegetables', grains: 'Grains & Staples', spices: 'Spices & Seasonings', cooking: 'Cooking Essentials', 'bakery-snacks': 'Bakery & Snacks', 'meat-protein': 'Meat, Protein & Other', other: 'Other' }
export const categoryIcons: Record<Category, string> = { dairy: '🥛', fruits: '🍎', vegetables: '🥕', grains: '🌾', spices: '🧂', cooking: '🫒', 'bakery-snacks': '🍰', 'meat-protein': '🍗', other: '＋' }

export const products: Product[] = [
  { id: 'apples', name: 'Organic apples', brand: 'Green Valley', category: 'fruits', price: 4.49, unitLabel: 'bag', aliases: ['apple', 'apples'], seasonalMonths: [8, 9, 10, 11], onSale: true, substituteIds: ['bananas'] },
  { id: 'bananas', name: 'Bananas', brand: 'Fresh Field', category: 'fruits', price: 1.89, unitLabel: 'lb', aliases: ['banana'], seasonalMonths: [5, 6, 7, 8], onSale: false, substituteIds: ['apples'] },
  { id: 'avocados', name: 'Hass avocados', brand: 'Green Valley', category: 'fruits', price: 3.99, unitLabel: 'pack', aliases: ['avocado'], seasonalMonths: [3, 4, 5, 6], onSale: false, substituteIds: [] },
  { id: 'oranges', name: 'Oranges', brand: 'Fresh Field', category: 'fruits', price: 3.49, unitLabel: 'bag', aliases: ['orange'], seasonalMonths: [1, 2, 3], onSale: false, substituteIds: [] },
  { id: 'mangoes', name: 'Mangoes', brand: 'Sunrise Farm', category: 'fruits', price: 4.99, unitLabel: 'pack', aliases: ['mango'], seasonalMonths: [4, 5, 6], onSale: true, substituteIds: [] },
  { id: 'grapes', name: 'Grapes', brand: 'Green Valley', category: 'fruits', price: 3.99, unitLabel: 'bag', aliases: ['grape'], seasonalMonths: [8, 9], onSale: false, substituteIds: [] },
  { id: 'potatoes', name: 'Potatoes', brand: 'Fresh Field', category: 'vegetables', price: 2.49, unitLabel: 'bag', aliases: ['potato'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'tomatoes', name: 'Tomatoes', brand: 'Green Valley', category: 'vegetables', price: 2.99, unitLabel: 'lb', aliases: ['tomato'], seasonalMonths: [6, 7, 8], onSale: false, substituteIds: [] },
  { id: 'onions', name: 'Onions', brand: 'Fresh Field', category: 'vegetables', price: 1.99, unitLabel: 'bag', aliases: ['onion'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'carrots', name: 'Carrots', brand: 'Fresh Field', category: 'vegetables', price: 2.29, unitLabel: 'bag', aliases: ['carrot'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'spinach', name: 'Spinach', brand: 'Green Valley', category: 'vegetables', price: 2.99, unitLabel: 'bag', aliases: [], seasonalMonths: [3, 4, 5], onSale: false, substituteIds: [] },
  { id: 'milk', name: 'Whole milk', brand: 'Meadow Fresh', category: 'dairy', price: 3.99, unitLabel: 'gallon', aliases: ['milk', 'दूध', 'leche'], seasonalMonths: [], onSale: false, substituteIds: ['almond-milk'] },
  { id: 'butter', name: 'Butter', brand: 'Meadow Fresh', category: 'dairy', price: 4.49, unitLabel: 'pack', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'cheese', name: 'Cheese', brand: 'Meadow Fresh', category: 'dairy', price: 5.99, unitLabel: 'pack', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'yogurt', name: 'Yogurt', brand: 'Meadow Fresh', category: 'dairy', price: 3.49, unitLabel: 'pack', aliases: [], seasonalMonths: [], onSale: true, substituteIds: [] },
  { id: 'almond-milk', name: 'Almond milk', brand: 'Meadow Fresh', category: 'dairy', price: 4.49, unitLabel: 'carton', aliases: ['non dairy milk'], seasonalMonths: [], onSale: true, substituteIds: ['milk'] },
  { id: 'eggs', name: 'Free-range eggs', brand: 'Sunrise Farm', category: 'dairy', price: 5.49, unitLabel: 'dozen', aliases: ['egg'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'rice', name: 'Rice', brand: 'Casa Mia', category: 'grains', price: 3.99, unitLabel: 'bag', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'flour', name: 'Wheat flour', brand: 'Casa Mia', category: 'grains', price: 2.99, unitLabel: 'bag', aliases: ['wheat flour'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'oats', name: 'Oats', brand: 'Morning Sun', category: 'grains', price: 4.49, unitLabel: 'box', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'pasta', name: 'Penne pasta', brand: 'Casa Mia', category: 'grains', price: 1.79, unitLabel: 'box', aliases: ['pasta'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'bread', name: 'Whole wheat bread', brand: 'Daily Bake', category: 'grains', price: 2.99, unitLabel: 'loaf', aliases: ['bread'], seasonalMonths: [], onSale: true, substituteIds: [] },
  { id: 'salt', name: 'Salt', brand: 'Casa Mia', category: 'spices', price: 1.49, unitLabel: 'box', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'sugar', name: 'Sugar', brand: 'Casa Mia', category: 'spices', price: 2.49, unitLabel: 'bag', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'pepper', name: 'Black pepper', brand: 'Casa Mia', category: 'spices', price: 2.99, unitLabel: 'jar', aliases: ['black pepper'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'turmeric', name: 'Turmeric', brand: 'Casa Mia', category: 'spices', price: 2.49, unitLabel: 'jar', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'cumin', name: 'Cumin', brand: 'Casa Mia', category: 'spices', price: 2.49, unitLabel: 'jar', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'oil', name: 'Cooking oil', brand: 'Good Harvest', category: 'cooking', price: 6.99, unitLabel: 'bottle', aliases: ['cooking oil'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'olive-oil', name: 'Olive oil', brand: 'Good Harvest', category: 'cooking', price: 9.99, unitLabel: 'bottle', aliases: [], seasonalMonths: [], onSale: true, substituteIds: [] },
  { id: 'vinegar', name: 'Vinegar', brand: 'Casa Mia', category: 'cooking', price: 2.99, unitLabel: 'bottle', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'soy-sauce', name: 'Soy sauce', brand: 'Casa Mia', category: 'cooking', price: 3.49, unitLabel: 'bottle', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'ketchup', name: 'Tomato ketchup', brand: 'Casa Mia', category: 'cooking', price: 3.49, unitLabel: 'bottle', aliases: ['ketchup'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'cake', name: 'Chocolate cake', brand: 'Daily Bake', category: 'bakery-snacks', price: 12.99, unitLabel: 'cake', aliases: ['cake'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'biscuits', name: 'Biscuits', brand: 'Good Crunch', category: 'bakery-snacks', price: 2.49, unitLabel: 'box', aliases: ['biscuit'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'cookies', name: 'Cookies', brand: 'Good Crunch', category: 'bakery-snacks', price: 3.49, unitLabel: 'box', aliases: ['cookie'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'chips', name: 'Sea salt chips', brand: 'Good Crunch', category: 'bakery-snacks', price: 3.49, unitLabel: 'bag', aliases: ['chips'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'chocolate', name: 'Chocolate', brand: 'Good Crunch', category: 'bakery-snacks', price: 2.99, unitLabel: 'bar', aliases: [], seasonalMonths: [], onSale: true, substituteIds: [] },
  { id: 'chicken', name: 'Chicken breast', brand: 'Good Harvest', category: 'meat-protein', price: 8.99, unitLabel: 'lb', aliases: ['chicken'], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'fish', name: 'Fish', brand: 'Good Harvest', category: 'meat-protein', price: 10.99, unitLabel: 'lb', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'tofu', name: 'Tofu', brand: 'Good Harvest', category: 'meat-protein', price: 3.99, unitLabel: 'pack', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'lentils', name: 'Lentils', brand: 'Casa Mia', category: 'meat-protein', price: 2.99, unitLabel: 'bag', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
  { id: 'chickpeas', name: 'Chickpeas', brand: 'Casa Mia', category: 'meat-protein', price: 1.99, unitLabel: 'can', aliases: [], seasonalMonths: [], onSale: false, substituteIds: [] },
]

export const findProduct = (name: string) => products.find((product) => product.name.toLowerCase() === name.toLowerCase() || product.aliases.includes(name.toLowerCase()))
const keywordCategories: Array<[Category, string[]]> = [
  ['dairy', ['milk', 'butter', 'cheese', 'yogurt', 'egg', 'दूध']],
  ['fruits', ['apple', 'banana', 'orange', 'mango', 'grape', 'fruit']],
  ['vegetables', ['potato', 'tomato', 'onion', 'carrot', 'spinach', 'vegetable']],
  ['grains', ['rice', 'flour', 'oat', 'pasta', 'bread', 'wheat']],
  ['spices', ['salt', 'sugar', 'pepper', 'turmeric', 'cumin']],
  ['cooking', ['oil', 'vinegar', 'soy sauce', 'ketchup']],
  ['bakery-snacks', ['cake', 'biscuit', 'cookie', 'chip', 'chocolate']],
  ['meat-protein', ['chicken', 'fish', 'tofu', 'lentil', 'chickpea']],
]
export const classifyName = (name: string): Category => keywordCategories.find(([, words]) => words.some((word) => name.toLowerCase().includes(word)))?.[0] ?? 'other'
