import pizzaImage from '../assets/pizza.png'
import screenlyFoodLogo from '../assets/screenly_food.svg'

const MAX_MENU_ITEMS = 12

/**
 * Largest item count each density can hold on one screen. The whole menu is
 * always on screen at once, so a longer menu is set tighter rather than paged.
 */
const LANDSCAPE_LIMITS: [Density, number][] = [
  ['roomy', 4],
  ['regular', 8],
]
const PORTRAIT_LIMITS: [Density, number][] = [
  ['roomy', 6],
  ['regular', 8],
]

export interface MenuItem {
  name: string
  description: string
  price: string
  labels: string
}

export const MENU_STYLES = ['traditional', 'modern', 'minimal'] as const

export type MenuStyle = (typeof MENU_STYLES)[number]

export const DEFAULT_MENU_STYLE: MenuStyle = 'traditional'

/**
 * Maps the menu_style setting onto a supported style, falling back to the
 * default so an unexpected value never leaves a screen unstyled.
 */
export function resolveMenuStyle(value: string | undefined): MenuStyle {
  const candidate = value?.trim().toLowerCase()
  const match = MENU_STYLES.find((style) => style === candidate)

  return match ?? DEFAULT_MENU_STYLE
}

export const DENSITIES = ['roomy', 'regular', 'compact'] as const

export type Density = (typeof DENSITIES)[number]

/**
 * Picks how tightly a menu of this length has to be set to fit the canvas.
 * Portrait is taller, so it holds more before tightening.
 */
export function getDensity(itemCount: number, isPortrait: boolean): Density {
  const limits = isPortrait ? PORTRAIT_LIMITS : LANDSCAPE_LIMITS
  const match = limits.find(([, limit]) => itemCount <= limit)

  return match?.[0] ?? 'compact'
}

/**
 * Formats a comma-separated label setting for display, e.g.
 * "vegetarian, gluten-free" becomes "vegetarian · gluten-free"
 */
export function formatLabels(labels: string): string {
  return labels
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean)
    .join(' · ')
}

/**
 * Get the default background image as a data URI (inlined by Vite)
 */
export function getDefaultBackgroundImage(): string {
  return pizzaImage
}

/**
 * Get the default logo as a data URI (inlined by Vite)
 */
export function getDefaultLogoUrl(): string {
  return screenlyFoodLogo
}

/**
 * Retrieves all menu items from settings
 * Note: This function depends on getSetting from @screenly/edge-apps
 */
export function getMenuItems(
  getSetting: (key: string) => string | undefined,
): MenuItem[] {
  const menuItems: MenuItem[] = []

  for (let i = 1; i <= MAX_MENU_ITEMS; i++) {
    const itemNum = String(i).padStart(2, '0')
    const name = getSetting(`item_${itemNum}_name`)
    if (name?.trim()) {
      menuItems.push({
        name: name.trim(),
        description: getSetting(`item_${itemNum}_description`)?.trim() || '',
        price: getSetting(`item_${itemNum}_price`)?.trim() || '',
        labels: getSetting(`item_${itemNum}_labels`)?.trim() || '',
      })
    }
  }

  return menuItems
}
