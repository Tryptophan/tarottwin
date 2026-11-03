export interface Product {
  title: string
  blurb: string
  /** Amazon affiliate link; items without one show as "coming soon" */
  url?: string
}

export const FEATURED: Product = {
  title: 'Tarot card deck',
  blurb: 'A physical deck for readings beyond the app.',
  url: 'https://link.amazon/B0aYsvOfb',
}

/** Items without a `url` show as coming soon. */
export const ATMOSPHERE: readonly Product[] = [
  { title: 'Crystals', blurb: 'A small set to rest beside your cards.', url: 'https://link.amazon/B0gELhSdO' },
  { title: 'Candles', blurb: 'A soft light for a reading.', url: 'https://link.amazon/B0gXQZQUy' },
  { title: 'Incense', blurb: 'Clear the air before you ask.', url: 'https://link.amazon/B04RGbdHm' },
  { title: 'Altar tray', blurb: 'A place for your deck and your tools.', url: 'https://link.amazon/B01LK6q2x' },
]
