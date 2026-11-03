#!/usr/bin/env node
// Pre-generates the foil shader maps (public/foil/**) for every card with foilsmith
// (a sibling Rust project). Only the foil map of each card is used; the cards are made with --no-depth
// (no model needed).
//
//   FOILSMITH_BIN=/path/to/foilsmith [FOILSMITH_REPO=../foilsmith] node scripts/gen-foil.mjs [--force] [--only id,id]
//
// Needs: the foilsmith CLI (cargo build --release -p foilsmith-cli), ImageMagick (`convert`,
// `identify`), rsvg-convert, and a Python with Pillow >= 9.1 (FOILSMITH_PY, default python3): cropping and
// WebP encoding of the maps is done by scripts/foil-webp.py because the FX map needs exact lossless
// WebP and ImageMagick 6 cannot do that (it zeroes the RGB under alpha 0, which the back's FX map needs).
// foil-prep.py also needs numpy.
//
// Pipeline (public/cards/<id>.webp -> public/foil/<id>/{art,foil}.webp):
//   1. scripts/foil-prep.py cuts each original at the outer edge of its black illustration frame line; on
//      majors, aces and court cards it also drops the title band at the bottom (cut at the dark separator
//      line above it: the app draws the card name itself); then it brings all crops to one common aspect
//      (the median of the cropped majors: manifest.artAspect; minors without a band are trimmed top and
//      bottom, wider ones lose a few columns plus a slight resize) and writes art.webp (480 px wide, lossy q85)
//   2. the art is also centred on black on foilsmith's fixed 630x880 card (the CLI cannot make other sizes);
//      card JSON: the `full-art` preset without its name bar and print id (art window = whole card)
//   3. foilsmith --no-depth --no-normal writes <id>_fx.png (R foil, B art window; no depth, no pop-out)
//   4. its R channel, cropped back to the art column, scaled to the art's size, is shipped as an opaque
//      grayscale lossless WebP: foil.webp. No fx, normal or frame images are shipped per card: the app
//      draws the card face (border, name bar, text) itself at runtime.
//   5. the card back (scripts/foil-back.svg, 510x880) is padded to 630x880 with its background colour, run
//      through the CLI --no-depth and cropped to the centred 510x880 column -> foil/back/{art,fx,normal}.webp
//      (full-card aspect = manifest.aspect = 510/880, from 600 / median height of the originals)
//   6. foil/manifest.json: { aspect, artAspect, back, cards: { id: { art, foil } } }
// Intermediate files live in WORK (default: os.tmpdir()/tarottwin-foil) and are reused unless --force.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BIN = process.env.FOILSMITH_BIN;
if (!BIN) throw new Error('set FOILSMITH_BIN to the foilsmith executable');
const PY = process.env.FOILSMITH_PY || 'python3';
const WORK = process.env.WORK || path.join(os.tmpdir(), 'tarottwin-foil');
const CARD_W = 630, CARD_H = 880; // foilsmith's fixed card size
const OUT_H = 715; // shipped height
const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? args[onlyIdx + 1].split(',') : null;

const run = (cmd, a, opts = {}) => execFileSync(cmd, a, { stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 1 << 26, ...opts })?.toString() ?? "";
const out = (...p) => path.join(root, 'public', 'foil', ...p);
const mkdir = (d) => fs.mkdirSync(d, { recursive: true });

const ids = fs.readdirSync(path.join(root, 'public/cards')).filter((f) => f.endsWith('.webp')).map((f) => f.slice(0, -5)).sort()
  .filter((id) => !only || only.includes(id));
const heights = fs.readdirSync(path.join(root, 'public/cards')).filter((f) => f.endsWith('.webp'))
  .map((f) => +run('identify', ['-format', '%h', path.join(root, 'public/cards', f)])).sort((a, b) => a - b);
const medianH = heights[Math.floor((heights.length - 1) / 2)];
const CROP_W = Math.round((CARD_H * 600) / medianH); // the back's column: 510
const ASPECT = CROP_W / CARD_H;
const OUT_W = Math.round(OUT_H * ASPECT);
const ART_W = 480; // shipped art / foil width
const dirs = { src: path.join(WORK, 'src'), cards: path.join(WORK, 'cards'), maps: path.join(WORK, 'maps'), back: path.join(WORK, 'back') };
Object.values(dirs).forEach(mkdir);
const py = (script, a) => run(PY, ['-I', path.join(root, 'scripts', script), ...a]);
// stale outputs of earlier layouts
for (const d of ['_frame', '_flat']) fs.rmSync(out(d), { recursive: true, force: true });

// 1: art
const prep = JSON.parse(py('foil-prep.py', [path.join(root, 'public/cards'), dirs.src, out(), String(ART_W), ...ids.filter(() => !!only)]).trim());
const ART_ASPECT = prep.artAspect, ART_CROP_W = prep.cropW, ART_H = prep.outH;

// 2: card files
const preset = JSON.parse(fs.readFileSync(path.join(process.env.FOILSMITH_REPO || path.join(root, '../foilsmith'), 'crates/frames/presets/full-art.json'), 'utf8'));
preset.base.print_id = '';
preset.components = preset.components.filter((c) => c.type === 'art');
for (const id of ids) fs.writeFileSync(path.join(dirs.cards, `${id}.json`), JSON.stringify({ art: `../src/${id}.png`, frame: preset }, null, 1));

// 3: foilsmith (the foil map only; no depth, so no model)
const todo = ids; // always: the CLI is fast without depth, and the art may have changed
if (todo.length) run(BIN, [...todo.map((id) => path.join(dirs.cards, `${id}.json`)), '-o', dirs.maps, '--no-depth', '--no-normal'], { stdio: 'inherit' });

// 5: the back (flat: no depth), drawn at the cropped width and padded to the CLI's card size
run('rsvg-convert', [path.join(root, 'scripts/foil-back.svg'), '-w', String(CROP_W), '-h', String(CARD_H), '-o', path.join(dirs.back, 'back_src.png')]);
run('convert', [path.join(dirs.back, 'back_src.png'), '-background', '#0d0517', '-gravity', 'center', '-extent', `${CARD_W}x${CARD_H}`, path.join(dirs.back, 'back.png')]);
run(BIN, [path.join(dirs.back, 'back.png'), '-o', dirs.back, '--no-depth'], { stdio: 'inherit' });
const enc = (src, dst, cropW, w, h, kind, filter = 'lanczos', channel = null) =>
  py('foil-webp.py', [src, dst, '--crop', String(cropW), '--width', String(w), '--height', String(h),
    ...(kind === 'lossless' ? ['--lossless'] : ['--quality', '85']), '--filter', filter, ...(channel ? ['--channel', channel] : [])]);
mkdir(out('back'));
const b = (s) => path.join(dirs.back, `back_${s}.png`);
enc(b('art'), out('back/art.webp'), CROP_W, OUT_W, OUT_H, 'lossy');
enc(b('fx'), out('back/fx.webp'), CROP_W, OUT_W, OUT_H, 'lossless', 'bilinear');
enc(b('normal'), out('back/normal.webp'), CROP_W, OUT_W, OUT_H, 'lossless');

// 4 + 6: foil maps and the manifest (rewritten as cards complete, so a partial run is usable)
const manifest = { aspect: ASPECT, artAspect: ART_ASPECT, back: { art: 'foil/back/art.webp', fx: 'foil/back/fx.webp', normal: 'foil/back/normal.webp' }, cards: {} };
const write = () => { if (!only) fs.writeFileSync(out('manifest.json'), JSON.stringify(manifest, null, 1) + '\n'); };
ids.forEach((id, i) => {
  enc(path.join(dirs.maps, `${id}_fx.png`), out(id, 'foil.webp'), ART_CROP_W, ART_W, ART_H, 'lossless', 'lanczos', 'R');
  for (const f of ['fx.webp', 'normal.webp']) fs.rmSync(out(id, f), { force: true });
  manifest.cards[id] = { art: `foil/${id}/art.webp`, foil: `foil/${id}/foil.webp` };
  if (i % 5 === 4 || i === ids.length - 1) write();
});
write();
console.log(`${ids.length} cards, art ${ART_W}x${ART_H} (aspect ${ART_ASPECT}), card aspect ${ASPECT}`);
