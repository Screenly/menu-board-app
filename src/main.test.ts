import { describe, it, expect } from 'bun:test'
import {
  formatLabels,
  getDefaultBackgroundImage,
  getDefaultLogoUrl,
  getDensity,
  getMenuItems,
  resolveMenuStyle,
} from './utils'

// eslint-disable-next-line max-lines-per-function
describe('Menu Board Tests', () => {
  describe('getDensity', () => {
    it('should keep a short landscape menu roomy', () => {
      expect(getDensity(1, false)).toBe('roomy')
      expect(getDensity(4, false)).toBe('roomy')
    })

    it('should tighten a landscape menu as it grows', () => {
      expect(getDensity(5, false)).toBe('regular')
      expect(getDensity(8, false)).toBe('regular')
      expect(getDensity(9, false)).toBe('compact')
      expect(getDensity(12, false)).toBe('compact')
    })

    it('should hold more items before tightening in portrait', () => {
      expect(getDensity(6, true)).toBe('roomy')
      expect(getDensity(7, true)).toBe('regular')
      expect(getDensity(8, true)).toBe('regular')
      expect(getDensity(9, true)).toBe('compact')
      expect(getDensity(12, true)).toBe('compact')
    })

    it('should never leave an item without a density', () => {
      for (let count = 0; count <= 12; count++) {
        expect(getDensity(count, false)).toBeString()
        expect(getDensity(count, true)).toBeString()
      }
    })
  })

  describe('resolveMenuStyle', () => {
    it('should accept every supported style', () => {
      expect(resolveMenuStyle('traditional')).toBe('traditional')
      expect(resolveMenuStyle('modern')).toBe('modern')
      expect(resolveMenuStyle('minimal')).toBe('minimal')
    })

    it('should tolerate casing and stray whitespace', () => {
      expect(resolveMenuStyle('  Modern ')).toBe('modern')
      expect(resolveMenuStyle('MINIMAL')).toBe('minimal')
    })

    it('should fall back to traditional for anything else', () => {
      expect(resolveMenuStyle(undefined)).toBe('traditional')
      expect(resolveMenuStyle('')).toBe('traditional')
      expect(resolveMenuStyle('fancy')).toBe('traditional')
    })
  })

  describe('formatLabels', () => {
    it('should join labels with a separator', () => {
      expect(formatLabels('vegetarian,gluten-free')).toBe(
        'vegetarian · gluten-free',
      )
    })

    it('should trim whitespace around labels', () => {
      expect(formatLabels('  spicy ,  vegan  ')).toBe('spicy · vegan')
    })

    it('should drop empty entries', () => {
      expect(formatLabels('vegetarian,,')).toBe('vegetarian')
    })

    it('should return an empty string when there are no labels', () => {
      expect(formatLabels('')).toBe('')
    })
  })

  describe('getMenuItems', () => {
    it('should return empty array when no items are configured', () => {
      const mockGetSetting = () => undefined
      const result = getMenuItems(mockGetSetting)
      expect(result).toEqual([])
    })

    it('should retrieve menu items from settings', () => {
      const mockGetSetting = (key: string) => {
        const items: Record<string, string> = {
          item_01_name: 'Pizza Margherita',
          item_01_description: 'Fresh tomato and basil',
          item_01_price: '12.99',
          item_01_labels: 'Vegetarian',
          item_02_name: 'Caesar Salad',
          item_02_description: 'Crispy romaine with parmesan',
          item_02_price: '8.99',
          item_02_labels: 'Gluten-free',
        }
        return items[key]
      }

      const result = getMenuItems(mockGetSetting)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Pizza Margherita')
      expect(result[0].description).toBe('Fresh tomato and basil')
      expect(result[0].price).toBe('12.99')
      expect(result[0].labels).toBe('Vegetarian')
    })

    it('should trim whitespace from menu item properties', () => {
      const mockGetSetting = (key: string) => {
        const items: Record<string, string> = {
          item_01_name: '  Pasta  ',
          item_01_description: '  Homemade pasta  ',
          item_01_price: '  15.99  ',
          item_01_labels: '  Gluten-free, Vegetarian  ',
        }
        return items[key]
      }

      const result = getMenuItems(mockGetSetting)
      expect(result[0].name).toBe('Pasta')
      expect(result[0].description).toBe('Homemade pasta')
      expect(result[0].price).toBe('15.99')
      expect(result[0].labels).toBe('Gluten-free, Vegetarian')
    })

    it('should ignore items past the twelfth', () => {
      const mockGetSetting = (key: string) =>
        key.endsWith('_name') ? `Dish ${key.slice(5, 7)}` : undefined

      const result = getMenuItems(mockGetSetting)
      expect(result).toHaveLength(12)
      expect(result.at(-1)?.name).toBe('Dish 12')
    })

    it('should skip items with empty or whitespace-only names', () => {
      const mockGetSetting = (key: string) => {
        const items: Record<string, string> = {
          item_01_name: 'Pizza',
          item_02_name: '',
          item_02_description: 'Should be skipped',
          item_03_name: 'Salad',
        }
        return items[key]
      }

      const result = getMenuItems(mockGetSetting)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Pizza')
      expect(result[1].name).toBe('Salad')
    })
  })

  describe('getDefaultBackgroundImage', () => {
    it('should return the inlined asset', () => {
      const result = getDefaultBackgroundImage()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('getDefaultLogoUrl', () => {
    it('should return the inlined asset', () => {
      const result = getDefaultLogoUrl()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })
})
