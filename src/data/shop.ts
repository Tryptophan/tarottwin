import { t } from '../i18n'

export interface Product {
  title: string
  blurb: string
  /** Amazon affiliate link; items without one show as "coming soon" */
  url?: string
}

export const FEATURED: Product = {
  ...t.shop.featured,
  url: 'https://link.amazon/B0aYsvOfb',
}

/** Items without a `url` show as coming soon. */
export const ATMOSPHERE: readonly Product[] = [
  { ...t.shop.items[0], url: 'https://link.amazon/B0gXQZQUy' }, // crystals
  { ...t.shop.items[1], url: 'https://link.amazon/B0gELhSdO' }, // candles
  { ...t.shop.items[2], url: 'https://link.amazon/B04RGbdHm' }, // incense
  { ...t.shop.items[3], url: 'https://link.amazon/B01LK6q2x' }, // altar tray
]
