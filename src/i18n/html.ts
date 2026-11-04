import { LANGS, LOCALES, type Lang } from '.'

export { LANGS }
import { SEO } from './seo'

/**
 * Static HTML per language, for crawlers and link previews that never run JavaScript. The build writes the
 * English page to `/` and the others to `/<lang>/` (see `localizedPages` in vite.config.ts); each one gets its
 * own title, description, Open Graph and Twitter tags, share image, JSON-LD, noscript text, canonical URL and
 * hreflang links to every other language.
 */
export const SITE = 'https://tarottwin.com/'
/** Path of a language's page under the site root: '' for English, `pt/` for Portuguese. */
export const langPath = (l: Lang) => (l === 'en' ? '' : `${l}/`)
export const langUrl = (l: Lang) => SITE + langPath(l)
export const ogImageUrl = (l: Lang) => `${SITE}og/${l}.png`

const attr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const text = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** A JSON string literal that is safe inside a <script>. */
const json = (s: string) => JSON.stringify(s).replace(/</g, '\\u003c')

/** `$` in inserted text would read as a replacement pattern. */
const lit = (s: string) => s.replace(/\$/g, '$$$$')

/** Replaces exactly one match, so a change to index.html that breaks a tag fails the build instead of shipping. */
function swap(html: string, re: RegExp, to: string, what: string): string {
  const n = html.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))?.length ?? 0
  if (n !== 1) throw new Error(`localize-html: expected one ${what} in index.html, found ${n}`)
  return html.replace(re, to)
}

/** Same, inserting `to` literally. */
function put(html: string, re: RegExp, to: string, what: string): string {
  return swap(html, re, lit(to), what)
}

export function localizeHtml(html: string, lang: Lang): string {
  const seo = SEO[lang]
  const { title, description } = LOCALES[lang].ui.meta
  const url = langUrl(lang)
  const image = ogImageUrl(lang)
  let h = html
  const meta = (kind: 'name' | 'property', key: string, value: string) => {
    h = swap(h, new RegExp(`(<meta ${kind}="${key}" content=")[^"]*(")`), `$1${lit(attr(value))}$2`, key)
  }

  h = swap(h, /<html lang="[^"]*">/, `<html lang="${LOCALES[lang].tag}">`, '<html lang>')
  // English keeps index.html's own (longer) title and description
  if (lang !== 'en') {
    h = put(h, /<title>[^<]*<\/title>/, `<title>${text(title)}</title>`, '<title>')
    meta('name', 'description', description)
  }
  meta('name', 'keywords', seo.keywords)
  meta('property', 'og:title', seo.ogTitle)
  meta('property', 'og:description', seo.ogDescription)
  meta('property', 'og:url', url)
  meta('property', 'og:image', image)
  meta('property', 'og:image:alt', seo.ogImageAlt)
  meta('name', 'twitter:title', seo.ogTitle)
  meta('name', 'twitter:description', seo.ogDescription)
  meta('name', 'twitter:image', image)

  const alternates = [
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${LOCALES[l].tag}" href="${langUrl(l)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${SITE}" />`,
  ]
  h = put(h, /<link rel="canonical" href="[^"]*" \/>/, [`<link rel="canonical" href="${url}" />`, ...alternates].join('\n    '), 'canonical link')
  const locales = [
    `<meta property="og:locale" content="${seo.ogLocale}" />`,
    ...LANGS.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${SEO[l].ogLocale}" />`),
  ]
  h = swap(h, /(<meta property="og:site_name" content="[^"]*" \/>)/, ['$1', ...locales].join('\n    '), 'og:site_name')

  // JSON-LD
  h = put(h, /"url": "[^"]*",/, `"url": ${json(url)},\n        "inLanguage": ${json(LOCALES[lang].tag)},`, 'JSON-LD url')
  h = put(h, /"description": "[^"]*",/, `"description": ${json(seo.appDescription)},`, 'JSON-LD description')
  h = put(h, /"image": "[^"]*",/, `"image": ${json(image)},`, 'JSON-LD image')

  h = put(h, /<noscript>[\s\S]*?<\/noscript>/, [
    '<noscript>',
    `      <h1>${text(seo.noscriptTitle)}</h1>`,
    `      <p>${text(seo.noscriptBody)}</p>`,
    `      <p>${text(seo.noscriptEnable)}</p>`,
    '    </noscript>',
  ].join('\n'), '<noscript>')

  // a page one folder down reaches the shared assets, icons and manifest one level up
  if (lang !== 'en') h = h.replace(/(href|src)="\.\//g, '$1="../')
  return h
}

/** sitemap.xml: every language's page, each listing the others as alternates. */
export function sitemap(): string {
  const links = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${LOCALES[l].tag}" href="${langUrl(l)}" />`).join('\n')
  const urls = LANGS.map((l) => `  <url>\n    <loc>${langUrl(l)}</loc>\n${links}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}" />\n    <changefreq>daily</changefreq>\n    <priority>${l === 'en' ? '1.0' : '0.9'}</priority>\n  </url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`
}
