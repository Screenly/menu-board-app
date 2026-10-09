import './css/style.css'

import {
  getHardware,
  getSettingWithDefault,
  setupErrorHandling,
  signalReady,
} from '@screenly/edge-apps'
import { Hardware } from '@screenly/edge-apps'
import {
  escapeHtml,
  calculateItemsPerPage,
  getMenuItems,
  getDefaultBackgroundImage,
  getDefaultLogoUrl,
  MenuItem,
} from './utils'

/**
 * Renders a specific page of menu items
 */
function renderPage(
  page: number,
  menuItems: MenuItem[],
  itemsPerPage: number,
  currency: string,
): void {
  const start = page * itemsPerPage
  const end = start + itemsPerPage
  const pageItems = menuItems.slice(start, end)

  const menuGrid = document.getElementById('menuGrid')
  if (!menuGrid) return

  const fragment = document.createDocumentFragment()
  pageItems.forEach((item) => {
    const itemElement = document.createElement('div')
    itemElement.className =
      `menu-item grid grid-cols-[1fr_auto] grid-rows-[auto_1fr_auto] ` +
      `[grid-template-areas:'title_title'_'desc_price'_'labels_labels'] ` +
      `items-center gap-3 relative rounded-xl p-5 min-h-[140px] ` +
      `bg-[rgba(8,8,24,0.95)] backdrop-blur-[10px] border border-white/10 ` +
      `shadow-[0_4px_30px_rgba(0,0,0,0.3)] [transition:all_0.3s_ease] ` +
      `hover:border-[rgba(126,44,210,0.3)] ` +
      `hover:shadow-[0_8px_30px_rgba(0,0,0,0.4),0_0_20px_rgba(126,44,210,0.2)] ` +
      `hover:-translate-y-0.5 print:break-inside-avoid ` +
      `print:[page-break-inside:avoid] max-[1600px]:min-h-[130px] ` +
      `max-[1200px]:p-4 max-[768px]:min-h-0`

    let labelsHtml = ''
    if (item.labels) {
      const labels = item.labels.split(',').map((label) => label.trim())
      labelsHtml = `
        <div class="labels [grid-area:labels] flex flex-wrap gap-[0.4rem] mt-1">
          ${labels
            .map(
              (label) =>
                `<span class="label ${label.toLowerCase()} text-[0.7rem] px-2 py-[0.2rem] rounded-2xl bg-[var(--purple-tint)] text-[var(--accent-color)] uppercase tracking-[0.05em] font-semibold">${escapeHtml(label)}</span>`,
            )
            .join('')}
        </div>
      `
    }

    itemElement.innerHTML = `
      <h2 class="[grid-area:title] text-2xl mb-1 text-[var(--accent-color)] font-[Playfair_Display,serif] font-semibold [text-shadow:0_2px_4px_rgba(0,0,0,0.4)] max-[1200px]:text-[1.3rem]">${escapeHtml(item.name)}</h2>
      <div class="content [grid-area:desc] flex items-center">
        <p class="text-[0.9rem] leading-[1.4] text-white/90 m-0 [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]">${escapeHtml(item.description)}</p>
      </div>
      <div class="price [grid-area:price] text-2xl text-[var(--accent-color)] font-[Playfair_Display,serif] font-semibold flex items-center justify-self-end [text-shadow:0_2px_4px_rgba(0,0,0,0.4)] max-[1200px]:text-[1.3rem]">
        <span class="currency text-[0.8em] mr-[0.1em]">${escapeHtml(currency)}</span>
        ${escapeHtml(item.price)}
      </div>
      ${labelsHtml}
    `
    fragment.appendChild(itemElement)
  })

  // Disable transitions if hardware is Anywhere screen
  const hardware = getHardware()
  if (hardware === Hardware.Anywhere) {
    menuGrid.innerHTML = ''
    menuGrid.appendChild(fragment)
  } else {
    // Fade out, update content, fade in
    menuGrid.classList.add('fade-out')
    setTimeout(() => {
      menuGrid.innerHTML = ''
      menuGrid.appendChild(fragment)
      menuGrid.classList.remove('fade-out')
    }, 500)
  }
}

/**
 * Initializes the menu board application
 */
function initializeMenuBoard(): void {
  try {
    const menuTitle = getSettingWithDefault<string>(
      'menu_title',
      "Today's Menu",
    )
    const accentColor = getSettingWithDefault<string>(
      'accent_color',
      'rgba(255, 255, 255, 0.95)',
    )
    const backgroundImage = getSettingWithDefault<string>(
      'background_image',
      getDefaultBackgroundImage(),
    )
    const logoUrl = getSettingWithDefault<string>(
      'logo_url',
      getDefaultLogoUrl(),
    )
    const currency = getSettingWithDefault<string>('currency', '$')

    // Set custom accent color if provided
    document.documentElement.style.setProperty('--accent-color', accentColor)

    // Set background image with error handling
    const bgImage = document.getElementById('background') as HTMLImageElement
    if (bgImage) {
      bgImage.onerror = () => {
        console.error('Failed to load background image')
        bgImage.style.display = 'none'
      }
      bgImage.src = backgroundImage
      bgImage.style.display = 'block'
    }

    // Handle logo with error handling
    const logoElement = document.getElementById('logo') as HTMLImageElement
    if (logoElement) {
      logoElement.onerror = () => {
        console.error('Failed to load logo')
        logoElement.style.display = 'none'
        const header = document.querySelector('.header') as HTMLElement
        if (header) {
          header.style.marginTop = 'var(--spacing-md)'
        }
      }
      if (logoUrl) {
        logoElement.src = logoUrl
        logoElement.style.display = 'block'
      }
    }

    // Set menu title
    const titleElement = document.getElementById('title')
    if (titleElement) {
      titleElement.textContent = menuTitle
    }

    // Get all menu items
    const menuItems = getMenuItems((key: string) =>
      getSettingWithDefault<string | undefined>(key, undefined),
    )

    // Calculate items per page based on viewport
    const itemsPerPage = calculateItemsPerPage()

    // Initial render
    renderPage(0, menuItems, itemsPerPage, currency)

    // Signal that the app is ready
    signalReady()
  } catch (error) {
    console.error('Failed to initialize menu board:', error)
    const errorState = document.getElementById('errorState')
    const menuGrid = document.getElementById('menuGrid')
    if (errorState) {
      errorState.style.display = 'block'
    }
    if (menuGrid) {
      menuGrid.style.display = 'none'
    }
  }
}

// Initialize when the page loads
window.addEventListener('load', () => {
  setupErrorHandling()
  initializeMenuBoard()
})
