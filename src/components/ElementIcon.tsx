import type { Element } from '../data/cards'

/** The alchemical element triangles, drawn as SVG (the Unicode glyphs are missing from most phone fonts). */
export function ElementIcon({ element, size = 14 }: { element: Element; size?: number }) {
  const up = element === 'fire' || element === 'air'
  const bar = element === 'air' || element === 'earth'
  return (
    <svg className="el-icon" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d={up ? 'M12 3.5L21 19.5H3z' : 'M12 20.5L21 4.5H3z'} />
      {bar && <path d="M6.5 14h11" transform={up ? '' : 'translate(0 -4)'} />}
    </svg>
  )
}
