#!/usr/bin/env node
// Renders the link-preview image (1200x630) for every language with the app's own card renderer, and saves
// public/og/<lang>.png. Each card in the fan is printed in a different rarity.
//
//   node scripts/gen-og.mjs [--only en,pt]
//
// Needs Chrome or Chromium: CHROME_BIN=/path/to/chrome, else the usual install paths are tried.
// The page is scripts/og/og.html (src/og/), served by a temporary Vite dev server.
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'vite'
import puppeteer from 'puppeteer-core'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const LANGS = ['en', 'es', 'pt', 'ja', 'ko', 'pl']
const i = process.argv.findIndex((a) => a === '--only' || a.startsWith('--only='))
const only = i < 0 ? null : process.argv[i].includes('=') ? process.argv[i].split('=')[1] : process.argv[i + 1]
const langs = only ? only.split(',').filter((l) => LANGS.includes(l)) : LANGS

const chrome = [process.env.CHROME_BIN, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find((p) => p && existsSync(p))
if (!chrome) throw new Error('No Chrome found: set CHROME_BIN')

const out = join(root, 'public/og')
mkdirSync(out, { recursive: true })

const server = await createServer({ root, logLevel: 'error', server: { port: 0 } })
await server.listen()
const base = server.resolvedUrls.local[0]
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  // software WebGL, so the foil shader renders the same on any machine
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars'],
})
try {
  for (const lang of langs) {
    const page = await browser.newPage()
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
    await page.goto(`${base}scripts/og/og.html?lang=${lang}`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => document.fonts.ready)
    // every card's first WebGL frame is drawn once its loading overlay is gone
    await page.waitForFunction(() => document.querySelectorAll('.tcard-gl-canvas').length === 4 && !document.querySelector('.tcard-gl-loading'), { timeout: 60_000 })
    await new Promise((r) => setTimeout(r, 1500)) // let the reveal sparkle settle
    await page.screenshot({ path: join(out, `${lang}.png`) })
    await page.close()
    console.log(`public/og/${lang}.png`)
  }
} finally {
  await browser.close()
  await server.close()
}
