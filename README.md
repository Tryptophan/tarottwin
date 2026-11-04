# Tarot Twin

A cozy, mystical tarot web app. One card a day, and a shared three-card reading for two people. No backend: everything lives in `localStorage`.

## Features
- **Daily card** seeded by your random user ID + the UTC date (same card all day, new one at 00:00 UTC, with a countdown).
- **Twin**: show your QR, scan a friend's. Both of you see the same three cards: your daily card, theirs, and a symmetric "bridge" card seeded by both IDs (sorted) + the date. Both people need to scan each other.
- **Elemental dignities**: Wands=Fire, Cups=Water, Swords=Air, Pentacles=Earth. Fire–Air and Water–Earth are allies; Fire–Water and Air–Earth oppose; same element strengthens. Majors use their traditional astrological element.
- **Bond history** per friend, saved on-device.
- Installable PWA, works offline, respects reduced-motion.

## Develop
```sh
npm install
npm run dev        # camera scanning needs HTTPS or localhost
npx vitest run
npm run build
```
Deploys to GitHub Pages via `.github/workflows/deploy.yml` (set Settings → Pages → Source to "GitHub Actions").

## Languages
English, Spanish, Brazilian Portuguese, Japanese, Korean and Polish. All text (UI, card names and meanings, reading prose) lives in `src/i18n/`: `en.ts` is the source, and every other locale must match its shape (TypeScript and `src/i18n/i18n.test.ts` check this). Each locale writes its own reading templates, drawing as many times as English so friends reading in different languages get the same cards and the same reading.

Each language has its own static page: `/` (English), `/es/`, `/pt/`, `/ja/`, `/ko/`, `/pl/`. The build writes them from `index.html` with that language's title, description, Open Graph/Twitter tags, share image, JSON-LD, noscript text, canonical URL and `hreflang` links, plus `sitemap.xml` (see `src/i18n/html.ts` and the copy in `src/i18n/seo.ts`). Link previews and crawlers see the right language without running JavaScript. In the app, the language is the page's folder, else `?lang=xx`, else the one picked in Settings, else the browser's.

### Share images
`public/og/<lang>.png` (1200x630) are rendered by the app's own card renderer, one card per rarity, with the headline from `src/i18n/seo.ts`:

```sh
node scripts/gen-og.mjs            # every language
node scripts/gen-og.mjs --only pt  # one or a few: --only es,pt
```

It needs Chrome or Chromium (`CHROME_BIN=…` if it isn't in a usual place). The page is `scripts/og/og.html` (`src/og/`), served by a temporary Vite dev server. Re-run it when the headline or the card art changes.

## Collection
A card is lit in the Collection once you have pulled it, as your daily card or in a Twin reading. The rest are shadowed out, but can still be opened. For development, set the build flag `VITE_UNLOCK_ALL=true` to show every card as unlocked: `npm run dev:unlocked`, or `VITE_UNLOCK_ALL=true npm run build`.

## Card art
Optional images live at `public/cards/<card-id>.webp` (e.g. `major-00-the-fool`, `wands-01`). Any missing image falls back to a generated SVG sigil.

## Art credits

Card art is the 1909 Rider-Waite-Smith deck illustrated by Pamela Colman Smith (published by William Rider & Son), in the public domain. Scans come from [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck). Per-card file names, source URLs and licenses are in [`public/cards/ATTRIBUTION.md`](public/cards/ATTRIBUTION.md). To (re)generate the images, run `node scripts/fetch-art.mjs` (requires ImageMagick with WebP support; `--force` re-downloads, `--quality=N` adjusts compression).

Fonts: Jost via `@fontsource` (SIL OFL).

## License
Code is licensed under the [GNU AGPL v3](LICENSE). The card art is public domain and is not covered by the AGPL.

## Foil maps

The foil shader reads pre-generated images from `public/foil/` (listed in `public/foil/manifest.json`), made with [foilsmith](../foilsmith). The card face (border, name bar, text) is drawn by the app at runtime, so the only per-card images are the **art** and its **foil map**; the card back has its own full-card art, FX map and normal map.

```sh
cd ../foilsmith && cargo build --release -p foilsmith-cli     # once; the CLI is target/release/foilsmith
FOILSMITH_BIN=../foilsmith/target/release/foilsmith \
FOILSMITH_PY=python3 \                                         # Pillow >= 9.1 and numpy
node scripts/gen-foil.mjs [--force] [--only id,id]
```

It also needs ImageMagick (`convert`, `identify`) and `rsvg-convert`. The cards are generated with `--no-depth`, so no depth model is downloaded. A full run takes about ten minutes (mostly the lossless WebP encodes). Intermediate files go to `$WORK` (default `$TMPDIR/tarottwin-foil`).

Per card, `scripts/foil-prep.py` cuts the original at the outer edge of its black illustration frame (first dark line scanning in from each side), drops the printed title band of majors, aces and court cards (cut at the separator line above it; the app draws the name), brings all crops to one common aspect (the median of the cropped majors, `manifest.artAspect`; minors without a band are trimmed top and bottom, wider cards lose a few px of width and take a slight resize) and writes `public/foil/<id>/art.webp` (480 px wide, lossy). foilsmith's card is a fixed 630x880, so the art is centred on that canvas for the CLI; its foil map (the FX map's R channel) is cropped back to the art and written as an opaque grayscale lossless `foil.webp` of the same size. `manifest.aspect` is the card back's aspect (back drawn from `scripts/foil-back.svg`, written to `public/foil/back/` as art, fx and normal; the FX map must be decoded without premultiplying alpha and is encoded with Pillow's `exact=True` by `scripts/foil-webp.py`, since ImageMagick 6 zeroes the RGB under alpha 0).
