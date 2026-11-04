import { en } from './en'
import { es } from './es'
import { ja } from './ja'
import { ko } from './ko'
import { pl } from './pl'
import { pt } from './pt'
import type { Locale } from './types'

/**
 * The app's language, fixed for the page's lifetime: the page's own folder (`/pt/`) or a `?lang=xx` in the URL
 * (either is remembered), else the one chosen in Settings, else the browser's. Changing it loads that language's
 * page, so card faces and prose are rebuilt.
 */
export const LOCALES = { en, es, pt, ja, ko, pl } as const satisfies Record<string, Locale>
export type Lang = keyof typeof LOCALES
export const LANGS = Object.keys(LOCALES) as Lang[]

const KEY = 'tarottwin:lang'

const isLang = (s: string | null | undefined): s is Lang => !!s && s in LOCALES

/** The first supported language in a browser's preference list: `pt-BR` → `pt`, `es-419` → `es`. */
export function matchLang(prefs: readonly string[]): Lang | null {
  for (const p of prefs) {
    const base = p.toLowerCase().split(/[-_]/)[0]
    if (isLang(base)) return base
  }
  return null
}

/** The language a page's folder names: `/pt/` → `pt`. English lives at the root, so it has none. */
export function pathLang(pathname: string): Lang | null {
  const m = /\/([a-z]{2})\/(?:index\.html)?$/.exec(pathname)
  return m && m[1] !== 'en' && isLang(m[1]) ? m[1] : null
}

export function detectLang(pathname: string, search: string, stored: string | null, prefs: readonly string[]): Lang {
  const fromPath = pathLang(pathname)
  if (fromPath) return fromPath
  const q = new URLSearchParams(search).get('lang')?.toLowerCase()
  if (isLang(q)) return q
  if (isLang(stored)) return stored
  return matchLang(prefs) ?? 'en'
}

function initial(): Lang {
  if (typeof window === 'undefined') return 'en'
  let stored: string | null = null
  try { stored = localStorage.getItem(KEY) } catch { /* private mode */ }
  const prefs = typeof navigator !== 'undefined' ? (navigator.languages?.length ? navigator.languages : [navigator.language ?? 'en']) : []
  const lang = detectLang(location.pathname, location.search, stored, prefs)
  // a language page or a shared ?lang= link sticks, so the app opens in that language next time too
  if (pathLang(location.pathname) || new URLSearchParams(location.search).get('lang')) {
    try { localStorage.setItem(KEY, lang) } catch { /* ignore */ }
  }
  return lang
}

export const LANG: Lang = initial()
export const L: Locale = LOCALES[LANG]
/** UI strings in the current language. */
export const t = L.ui

/** The site root: the current folder, minus a language folder. */
export const siteRoot = (pathname: string) => pathname.replace(/[^/]*$/, '').replace(/\/([a-z]{2})\/$/, (m, l: string) => (isLang(l) ? '/' : m))

/** Switches language by loading its page (`/pt/`, or `/` for English), keeping the current screen. */
export function setLang(lang: Lang) {
  try { localStorage.setItem(KEY, lang) } catch { /* ignore */ }
  const url = new URL(location.href)
  url.searchParams.delete('lang')
  url.pathname = siteRoot(url.pathname) + (lang === 'en' ? '' : `${lang}/`)
  if (url.href === location.href) location.reload()
  else location.assign(url.href)
}

/** `<html lang>`, title and description in the current language. */
export function applyDocumentLocale() {
  document.documentElement.lang = L.tag
  document.title = t.meta.title
  document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
}
