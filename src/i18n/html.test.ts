import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LANGS } from '.'
import { localizeHtml, sitemap } from './html'

const source = readFileSync('index.html', 'utf8') // vitest runs from the repo root

describe('localized pages', () => {
  it.each(LANGS)('%s page has its own language, canonical, preview and hreflang links', (lang) => {
    const h = localizeHtml(source, lang)
    const base = lang === 'en' ? 'https://tarottwin.com/' : `https://tarottwin.com/${lang}/`
    expect(h).toContain(`<link rel="canonical" href="${base}" />`)
    expect(h).toContain(`<meta property="og:url" content="${base}" />`)
    expect(h).toContain(`<meta property="og:image" content="https://tarottwin.com/og/${lang}.png" />`)
    expect(h).toContain(`<meta name="twitter:image" content="https://tarottwin.com/og/${lang}.png" />`)
    for (const l of LANGS) expect(h).toContain(`href="https://tarottwin.com/${l === 'en' ? '' : `${l}/`}"`)
    expect(h).toContain('hreflang="x-default"')
    expect(h.match(/og:locale"/g)).toHaveLength(1)
    // the JSON-LD still parses
    const ld = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(h)![1])
    expect(ld.url).toBe(base)
    if (lang !== 'en') {
      expect(h).not.toMatch(/(href|src)="\.\//)
      expect(h).not.toContain('Free Daily Tarot')
    }
  })
  it('lists every page in the sitemap', () => {
    const s = sitemap()
    expect(s.match(/<loc>/g)).toHaveLength(LANGS.length)
    expect(s).toContain('<loc>https://tarottwin.com/pt/</loc>')
  })
})
