// Crave ERP — shared domain types & seed catalog

export type ModuleId =
  | "dashboard"
  | "pos"
  | "pizza-builder"
  | "kds"
  | "production"
  | "delivery"
  | "tables"
  | "drive-thru"
  | "inventory"
  | "menu"
  | "online"
  | "crm"
  | "marketing"
  | "analytics"
  | "franchise"
  | "hr"
  | "finance"
  | "ai"
  | "users"
  | "owner"

export interface MenuProduct {
  id: string
  name: string
  category: string
  price: number
  cost: number
  image?: string
  description?: string
  available: boolean
  calories?: number
  prepTime: number
  station: string
  popular?: boolean
}

export interface CartLine {
  productId: string
  name: string
  price: number
  quantity: number
  station: string
  customizations?: string
}

export interface Branch {
  id: string
  name: string
  brand: string
  type: string
  city: string
  manager?: string
  status: string
  isOpen: boolean
  royaltyPct?: number
  franchisee?: string
}

// ────────────────────────────────────────────────────────────
// Seed catalog — menu products (used by /api/seed and fallback)
// ────────────────────────────────────────────────────────────
export const SEED_BRANCHES: Branch[] = [
  { id: "BR-GUL", name: "Gulberg III Flagship", brand: "NY212 Pizza", type: "restaurant", city: "Lahore", manager: "Ahsan Khan", status: "active", isOpen: true, royaltyPct: 6, franchisee: "Corporate" },
  { id: "BR-DHA", name: "DHA Phase 6", brand: "NY212 Pizza", type: "restaurant", city: "Lahore", manager: "Sara Malik", status: "active", isOpen: true, royaltyPct: 6, franchisee: "Franchisee - Ali Traders" },
  { id: "BR-JOH", name: "Johar Town", brand: "Cheezious", type: "food_court", city: "Lahore", manager: "Bilal Raza", status: "active", isOpen: true, royaltyPct: 5, franchisee: "Franchisee - Mehr Group" },
  { id: "BR-CK1", name: "Cloud Kitchen Bahria", brand: "NY212 Pizza", type: "cloud_kitchen", city: "Rawalpindi", manager: "Hina Tariq", status: "active", isOpen: true, royaltyPct: 4 },
  { id: "BR-KHI", name: "Tariq Road", brand: "Clucky's Fried Chicken", type: "drive_thru", city: "Karachi", manager: "Faisal Ahmed", status: "active", isOpen: true, royaltyPct: 7, franchisee: "Franchisee - Sindh Foods" },
  { id: "BR-ISB", name: "F-7 Markaz", brand: "NY212 Pizza", type: "restaurant", city: "Islamabad", manager: "Nida Yusuf", status: "maintenance", isOpen: false, royaltyPct: 6 },
]

export const SEED_PRODUCTS: MenuProduct[] = [
  // Pizzas
  { id: "P-PEP", name: "Pepperoni Supreme", category: "pizza", price: 1290, cost: 480, description: "Double pepperoni, mozzarella, signature tomato sauce", calories: 1180, prepTime: 14, station: "pizza", popular: true, available: true },
  { id: "P-MAR", name: "Margherita Classica", category: "pizza", price: 990, cost: 340, description: "San Marzano tomato, fresh basil, fior di latte", calories: 920, prepTime: 12, station: "pizza", popular: true, available: true },
  { id: "P-BBQ", name: "BBQ Chicken Tikka", category: "pizza", price: 1390, cost: 510, description: "Tikka chicken, onions, capsicum, BBQ swirl", calories: 1240, prepTime: 14, station: "pizza", popular: true, available: true },
  { id: "P-VEG", name: "Garden Veggie", category: "pizza", price: 1090, cost: 360, description: "Mushroom, capsicum, onion, olive, sweet corn", calories: 980, prepTime: 12, station: "pizza", available: true },
  { id: "P-4CH", name: "Quattro Formaggi", category: "pizza", price: 1390, cost: 540, description: "Mozzarella, cheddar, parmesan, blue cheese", calories: 1290, prepTime: 12, station: "pizza", available: true },
  { id: "P-HAW", name: "Hawaiian", category: "pizza", price: 1190, cost: 420, description: "Ham, pineapple, mozzarella, tomato base", calories: 1060, prepTime: 12, station: "pizza", available: true },
  // Burgers
  { id: "B-DBL", name: "Double Smash Beef", category: "burger", price: 850, cost: 290, description: "Two beef patties, cheddar, pickles, house sauce", calories: 920, prepTime: 9, station: "burger", popular: true, available: true },
  { id: "B-CHK", name: "Crispy Chicken Burger", category: "burger", price: 690, cost: 230, description: "Buttermilk chicken, lettuce, mayo, brioche bun", calories: 760, prepTime: 9, station: "burger", popular: true, available: true },
  { id: "B-ZIN", name: "Zinger Deluxe", category: "burger", price: 750, cost: 250, description: "Spicy zinger fillet, coleslaw, chili mayo", calories: 810, prepTime: 9, station: "burger", available: true },
  // Chicken
  { id: "C-BKT", name: "8pc Bucket", category: "chicken", price: 1590, cost: 620, description: "8 pieces secret recipe fried chicken", calories: 1980, prepTime: 16, station: "fry", popular: true, available: true },
  { id: "C-WNG", name: "Hot Wings 6pc", category: "chicken", price: 590, cost: 210, description: "Six spicy glazed wings", calories: 640, prepTime: 11, station: "fry", available: true },
  { id: "C-NUG", name: "Chicken Nuggets 9pc", category: "chicken", price: 490, cost: 170, description: "Crispy nuggets with dip", calories: 480, prepTime: 8, station: "fry", available: true },
  // Sides
  { id: "S-FR", name: "Loaded Fries", category: "sides", price: 390, cost: 110, description: "Cheese sauce, jalapeños, herbs", calories: 520, prepTime: 6, station: "fry", popular: true, available: true },
  { id: "S-NAC", name: "Nachos Supreme", category: "sides", price: 490, cost: 150, description: "Salsa, cheese, jalapeños, sour cream", calories: 610, prepTime: 7, station: "grill", available: true },
  { id: "S-GAR", name: "Garlic Bread", category: "sides", price: 350, cost: 90, description: "Cheesy garlic breadsticks", calories: 430, prepTime: 7, station: "pizza", available: true },
  { id: "S-COL", name: "Coleslaw", category: "sides", price: 250, cost: 70, description: "Creamy house coleslaw", calories: 210, prepTime: 4, station: "grill", available: true },
  // Drinks
  { id: "D-COL", name: "Cola 500ml", category: "drinks", price: 150, cost: 45, description: "Chilled soft drink", calories: 210, prepTime: 1, station: "drinks", available: true },
  { id: "D-CHC", name: "Chocolate Shake", category: "drinks", price: 390, cost: 120, description: "Thick chocolate milkshake", calories: 540, prepTime: 3, station: "drinks", available: true },
  { id: "D-MNT", name: "Mint Lemonade", category: "drinks", price: 290, cost: 80, description: "Fresh mint, lemon, soda", calories: 160, prepTime: 3, station: "drinks", available: true },
  // Desserts
  { id: "D-BRO", name: "Choco Lava Cake", category: "desserts", price: 350, cost: 110, description: "Warm molten chocolate cake", calories: 460, prepTime: 6, station: "dessert", popular: true, available: true },
  { id: "D-CHZ", name: "New York Cheesecake", category: "desserts", price: 450, cost: 140, description: "Classic baked cheesecake slice", calories: 410, prepTime: 4, station: "dessert", available: true },
  { id: "D-ICE", name: "Vanilla Ice Cream", category: "desserts", price: 250, cost: 70, description: "Two scoops with chocolate sauce", calories: 290, prepTime: 2, station: "dessert", available: true },
  // Combos
  { id: "CB-FAM", name: "Family Feast", category: "combos", price: 2990, cost: 980, description: "2 large pizzas, 8pc bucket, 1.5L drink, garlic bread", calories: 5200, prepTime: 22, station: "pizza", popular: true, available: true },
  { id: "CB-DEAL", name: "Deal for 2", category: "combos", price: 1490, cost: 510, description: "1 medium pizza, 2 burgers, 2 drinks", calories: 2400, prepTime: 15, station: "pizza", available: true },
]

export const PIZZA_SIZES = [
  { id: "small", label: 'Small (8")', base: 690, slices: 6 },
  { id: "medium", label: 'Medium (12")', base: 990, slices: 8 },
  { id: "large", label: 'Large (14")', base: 1290, slices: 10 },
  { id: "xlarge", label: 'X-Large (16")', base: 1590, slices: 12 },
] as const

export const PIZZA_CRUSTS = [
  { id: "thin", label: "Thin & Crispy", delta: 0 },
  { id: "classic", label: "Classic Hand Tossed", delta: 0 },
  { id: "pan", label: "Pan Pizza", delta: 120 },
  { id: "stuffed", label: "Cheese Stuffed Crust", delta: 290 },
  { id: "sicilian", label: "Sicilian Deep Dish", delta: 240 },
] as const

export const CHEESE_LEVELS = [
  { id: "light", label: "Light Cheese", delta: 0 },
  { id: "regular", label: "Regular Cheese", delta: 0 },
  { id: "extra", label: "Extra Cheese", delta: 180 },
  { id: "double", label: "Double Cheese", delta: 340 },
] as const

export const SAUCES = [
  { id: "tomato", label: "Signature Tomato", delta: 0 },
  { id: "bbq", label: "Smoky BBQ", delta: 40 },
  { id: "white", label: "Creamy White Garlic", delta: 60 },
  { id: "pesto", label: "Basil Pesto", delta: 90 },
  { id: "spicy", label: "Spicy Arrabbiata", delta: 50 },
] as const

export const TOPPINGS = [
  { id: "pepperoni", label: "Pepperoni", price: 150 },
  { id: "chicken", label: "Grilled Chicken", price: 160 },
  { id: "beef", label: "Minced Beef", price: 180 },
  { id: "mushroom", label: "Mushroom", price: 90 },
  { id: "capsicum", label: "Capsicum", price: 70 },
  { id: "onion", label: "Red Onion", price: 60 },
  { id: "olive", label: "Black Olives", price: 100 },
  { id: "jalapeno", label: "Jalapeños", price: 80 },
  { id: "pineapple", label: "Pineapple", price: 90 },
  { id: "corn", label: "Sweet Corn", price: 70 },
  { id: "tomato", label: "Cherry Tomato", price: 80 },
  { id: "bacon", label: "Beef Bacon", price: 200 },
  { id: "feta", label: "Feta Cheese", price: 160 },
  { id: "spinach", label: "Spinach", price: 80 },
] as const

export const STATIONS = [
  { id: "pizza", label: "Pizza", color: "var(--chart-1)" },
  { id: "burger", label: "Burger & Grill", color: "var(--chart-4)" },
  { id: "fry", label: "Fry Station", color: "var(--chart-2)" },
  { id: "drinks", label: "Drinks", color: "var(--chart-3)" },
  { id: "dessert", label: "Dessert", color: "var(--chart-5)" },
] as const

export const formatPKR = (n: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(n)
