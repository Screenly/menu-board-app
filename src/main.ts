import './css/style.css'

import {
  getSettingWithDefault,
  setupErrorHandling,
  signalReady,
} from '@screenly/edge-apps'
// Side-effect import: registers <auto-scaler> as a custom element
import '@screenly/edge-apps/components'
import {
  DEFAULT_MENU_STYLE,
  formatLabels,
  getDefaultBackgroundImage,
  getDefaultLogoUrl,
  getDensity,
  getMenuItems,
  MenuItem,
  resolveMenuStyle,
} from './utils'

function createItem(item: MenuItem, currency: string): HTMLLIElement {
  const element = document.createElement('li')
  element.className = 'item'

  const name = document.createElement('h2')
  name.className = 'item-name'
  name.textContent = item.name
  element.append(name)

  if (item.price) {
    const price = document.createElement('p')
    price.className = 'item-price'
    const currencySymbol = document.createElement('span')
    currencySymbol.className = 'item-currency'
    currencySymbol.textContent = currency
    price.append(currencySymbol, item.price)
    element.append(price)
  }

  if (item.description) {
    const description = document.createElement('p')
    description.className = 'item-description'
    description.textContent = item.description
    element.append(description)
  }

  const labels = formatLabels(item.labels)
  if (labels) {
    const labelList = document.createElement('p')
    labelList.className = 'item-labels'
    labelList.textContent = labels
    element.append(labelList)
  }

  return element
}

/**
 * Renders the whole menu at once. A longer menu is set at a tighter density
 * rather than split across pages, so nothing waits its turn to be seen.
 */
function renderMenu(
  list: HTMLElement,
  menuItems: MenuItem[],
  currency: string,
  isPortrait: boolean,
): void {
  const fragment = document.createDocumentFragment()
  menuItems.forEach((item) => fragment.append(createItem(item, currency)))

  list.className = `menu-list density-${getDensity(menuItems.length, isPortrait)}`
  list.replaceChildren(fragment)
}

function setupBackground(): void {
  const background = document.getElementById('background') as HTMLImageElement
  if (!background) return

  background.onerror = () => {
    console.error('Failed to load background image')
    background.classList.add('is-hidden')
  }
  background.src = getSettingWithDefault<string>(
    'background_image',
    getDefaultBackgroundImage(),
  )
}

function setupLogo(): void {
  const logo = document.getElementById('logo') as HTMLImageElement
  if (!logo) return

  const logoUrl = getSettingWithDefault<string>('logo_url', getDefaultLogoUrl())
  if (!logoUrl) {
    logo.classList.add('is-hidden')
    return
  }

  logo.onerror = () => {
    console.error('Failed to load logo')
    logo.classList.add('is-hidden')
  }
  logo.src = logoUrl
}

function initializeMenuBoard(): void {
  const menuStyle = resolveMenuStyle(
    getSettingWithDefault<string>('menu_style', DEFAULT_MENU_STYLE),
  )
  document.body.classList.add(`style-${menuStyle}`)

  const accentColor = getSettingWithDefault<string>(
    'accent_color',
    'rgb(255 255 255 / 95%)',
  )
  // Custom property, not a style override: the customer's colour has to reach
  // the stylesheet somehow, and this is how the SDK's own theming works
  document.documentElement.style.setProperty('--accent-color', accentColor)

  setupBackground()
  setupLogo()

  const title = document.getElementById('title')
  if (title) {
    title.textContent = getSettingWithDefault<string>(
      'menu_title',
      "Today's Menu",
    )
  }

  const list = document.getElementById('menuList')
  if (!list) return

  const menuItems = getMenuItems((key: string) =>
    getSettingWithDefault<string | undefined>(key, undefined),
  )

  renderMenu(
    list,
    menuItems,
    getSettingWithDefault<string>('currency', '$'),
    window.innerWidth < window.innerHeight,
  )
}

document.addEventListener('DOMContentLoaded', () => {
  setupErrorHandling()

  try {
    initializeMenuBoard()
  } catch (error) {
    console.error('Failed to initialize menu board:', error)
    document.getElementById('menu')?.classList.add('has-error')
  }

  signalReady()
})
