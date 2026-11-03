import { CARD_BY_ID } from '../data/cards'
import { loadFaceLayers } from '../gl/cardFace'
import { loadManifest } from './foil'
import { POSITIONS, VERDICT_LABEL, oracleSeed, type OracleEntry } from './oracle'
import { printFor } from './print'

const W = 1080, H = 1350, CW = 300, GAP = 45

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word
    if (line && ctx.measureText(next).width > max) { lines.push(line); line = word } else line = next
  }
  if (line) lines.push(line)
  return lines.slice(0, 4)
}

const timestamp = (ms: number) => `${new Date(ms).toISOString().slice(0, 16).replace('T', ' ')} UTC`

/** Draws a journal entry as a shareable 1080x1350 image, entirely on the client. */
export async function oracleImage(userId: string, e: OracleEntry): Promise<Blob> {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#170a24')
  bg.addColorStop(1, '#3d1c59')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  ctx.textAlign = 'center'
  const font = (px: number, style = '') => `${style} ${px}px Jost, system-ui, sans-serif`.trim()

  ctx.fillStyle = '#b19dc2'
  ctx.font = font(34)
  ctx.letterSpacing = '8px'
  ctx.fillText('TAROT TWIN · ORACLE', W / 2, 100)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = '#eadef4'
  ctx.font = font(48, 'italic')
  const lines = wrap(ctx, `“${e.question}”`, W - 160)
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 190 + i * 62))

  let manifest = null
  try { manifest = await loadManifest() } catch { /* flat placeholders below */ }
  const x0 = (W - (3 * CW + 2 * GAP)) / 2
  const top = 480
  for (const [i, pc] of e.cards.entries()) {
    const card = CARD_BY_ID.get(pc.id)
    if (!card) continue
    const x = x0 + i * (CW + GAP)
    let ch = Math.round(CW / 0.5795)
    ctx.save()
    ctx.translate(x + CW / 2, top + ch / 2)
    if (pc.reversed) ctx.rotate(Math.PI)
    try {
      if (!manifest) throw new Error('no manifest')
      const { layout, art, frame } = await loadFaceLayers(manifest, card, printFor(oracleSeed(userId, e.question, e.at), card))
      ch = Math.round((CW * layout.h) / layout.w)
      ctx.drawImage(art, -CW / 2, -ch / 2, CW, ch)
      ctx.drawImage(frame, -CW / 2, -ch / 2, CW, ch)
    } catch {
      ctx.fillStyle = '#220f35'
      ctx.strokeStyle = '#c6d65f'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.roundRect(-CW / 2, -ch / 2, CW, ch, 18)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#e3ecaa'
      ctx.font = font(30)
      ctx.fillText(card.name, 0, 0, CW - 30)
    }
    ctx.restore()
    ctx.fillStyle = '#b19dc2'
    ctx.font = font(30)
    ctx.fillText(`${POSITIONS[i]}${pc.reversed ? ' · reversed' : ''}`, x + CW / 2, top + ch + 55)
  }

  ctx.fillStyle = '#c6d65f'
  ctx.font = font(104, '500')
  ctx.shadowColor = 'rgba(198, 214, 95, 0.6)'
  ctx.shadowBlur = 30
  ctx.fillText(VERDICT_LABEL[e.verdict], W / 2, 1240)
  ctx.shadowBlur = 0
  ctx.fillStyle = '#7d5c9a'
  ctx.font = font(28)
  ctx.fillText(timestamp(e.askedAt ?? e.at), W / 2, 1305)

  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png'))
}

/** True where the browser can share image files (the share sheet is the only way out: no direct download). */
export function canShareImages(): boolean {
  try { return !!navigator.canShare?.({ files: [new File([], 'a.png', { type: 'image/png' })] }) } catch { return false }
}

/** Opens the share sheet with the image. Closing the sheet is not an error. */
export async function shareOracle(userId: string, e: OracleEntry): Promise<void> {
  const blob = await oracleImage(userId, e)
  const file = new File([blob], 'tarot-twin-oracle.png', { type: 'image/png' })
  try { await navigator.share({ files: [file], title: 'Tarot Twin Oracle' }) } catch (err) {
    if ((err as Error).name !== 'AbortError') throw err
  }
}
