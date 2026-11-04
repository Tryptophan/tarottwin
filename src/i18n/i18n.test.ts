import { describe, expect, it } from 'vitest'
import { DECK, SUIT_ELEMENT, type Suit } from '../data/cards'
import { relation, overallTone, type Relation, type Tone } from '../lib/dignity'
import { seededRng } from '../lib/rng'
import { wrapLines } from '../gl/cardText'
import { LANGS, LOCALES, detectLang, matchLang, pathLang, siteRoot } from '.'
import type { Bucket, Pick, ProseCard } from './types'

const SUITS: Suit[] = ['wands', 'cups', 'swords', 'pentacles']
const picker = (seed: string): Pick => {
  const rng = seededRng(seed)
  return (xs) => xs[Math.floor(rng() * xs.length)]
}
/** A pick that counts its calls, to check every locale draws as often as English. */
const counting = (seed: string) => {
  const p = picker(seed)
  const c = { n: 0, pick: (<T,>(xs: readonly T[]) => { c.n++; return p(xs) }) as Pick }
  return c
}
// anything left over from a template or an object, or a stray Latin word in the CJK locales
const BROKEN = /\{|\}|undefined|NaN|\[object/

describe.each(LANGS)('locale %s', (lang) => {
  const L = LOCALES[lang]
  const cards: ProseCard[] = [
    ...L.deck.majors.map(([name, , keywords], i) => ({ name, keywords, element: DECK[i].element })),
    ...SUITS.flatMap((s) => L.deck.minors[s].map(([name, , keywords]) => ({ name, keywords, element: SUIT_ELEMENT[s] }))),
  ]

  it('has a full deck with meanings and keywords', () => {
    expect(L.deck.majors).toHaveLength(22)
    for (const s of SUITS) expect(L.deck.minors[s]).toHaveLength(14)
    for (const [name, upright, keywords] of [...L.deck.majors, ...SUITS.flatMap((s) => L.deck.minors[s])]) {
      expect(name.trim()).not.toBe('')
      expect(upright.trim()).not.toBe('')
      expect(keywords.length).toBeGreaterThan(0)
      keywords.forEach((k) => expect(k.trim()).not.toBe(''))
    }
    expect(new Set(cards.map((c) => c.name)).size).toBe(78)
  })

  it('writes well-formed daily prose for every card and bucket, drawing like English', () => {
    for (const [i, c] of cards.entries()) {
      for (const b of [0, 1, 2, 3] as Bucket[]) {
        const mine = counting(`d${i}${b}`), en = counting(`d${i}${b}`)
        const text = L.prose.daily(c, b, mine.pick)
        LOCALES.en.prose.daily(c, b, en.pick)
        expect(text).not.toMatch(BROKEN)
        expect(text.trim()).toBe(text)
        expect(mine.n).toBe(en.n)
      }
    }
  })

  it('writes well-formed twin and oracle prose, drawing like English', () => {
    const rng = seededRng(`combos|${lang}`)
    const any = () => cards[Math.floor(rng() * cards.length)]
    for (let i = 0; i < 400; i++) {
      const a = any(), b = any(), bridge = any()
      const rel: Relation = relation(a.element, b.element)
      const tone: Tone = overallTone(rel, relation(a.element, bridge.element), relation(b.element, bridge.element))
      const bucket = (i % 4) as Bucket
      const mine = counting(`t${i}`), en = counting(`t${i}`)
      const text = L.prose.twin({ a, b, bridge, rel, tone, bucket }, mine.pick)
      LOCALES.en.prose.twin({ a, b, bridge, rel, tone, bucket }, en.pick)
      expect(text).not.toMatch(BROKEN)
      expect(mine.n).toBe(en.n)

      const drawn = [a, b, bridge].map((card, j) => ({ card, reversed: (i >> j) % 2 === 1 }))
      for (const v of ['yes', 'no', 'maybe'] as const) {
        const om = counting(`o${i}${v}`), oe = counting(`o${i}${v}`)
        const o = L.prose.oracle(drawn, v, om.pick)
        LOCALES.en.prose.oracle(drawn, v, oe.pick)
        expect(o).not.toMatch(BROKEN)
        expect(om.n).toBe(oe.n)
      }
    }
  })

  it('has every UI string', () => {
    const walk = (en: unknown, other: unknown, path: string) => {
      if (typeof en === 'function') {
        expect(typeof other, path).toBe('function')
        const out = (other as (...a: unknown[]) => string)('Ada', 2)
        expect(out, path).not.toMatch(BROKEN)
      } else if (typeof en === 'string') {
        expect(typeof other, path).toBe('string')
        // the text around the Bonds link may be empty on one side, where the language puts the link first
        if (!/twinReadings\.empty(Before|After)$/.test(path)) expect((other as string).trim(), path).not.toBe('')
      } else if (en && typeof en === 'object') {
        for (const k of Object.keys(en)) walk((en as Record<string, unknown>)[k], (other as Record<string, unknown>)?.[k], `${path}.${k}`)
      }
    }
    walk(LOCALES.en.ui, L.ui, lang)
  })
})

describe('language choice', () => {
  it('matches browser preferences by base language', () => {
    expect(matchLang(['pt-BR', 'en'])).toBe('pt')
    expect(matchLang(['es-419'])).toBe('es')
    expect(matchLang(['fr-FR', 'ko-KR'])).toBe('ko')
    expect(matchLang(['fr'])).toBeNull()
  })
  it('reads a language page from its folder', () => {
    expect(pathLang('/pt/')).toBe('pt')
    expect(pathLang('/pt/index.html')).toBe('pt')
    expect(pathLang('/tarottwin/ko/')).toBe('ko')
    expect(pathLang('/')).toBeNull()
    expect(pathLang('/en/')).toBeNull()
    expect(pathLang('/fr/')).toBeNull()
  })
  it('finds the site root from any language page', () => {
    expect(siteRoot('/')).toBe('/')
    expect(siteRoot('/pt/')).toBe('/')
    expect(siteRoot('/pt/index.html')).toBe('/')
    expect(siteRoot('/tarottwin/ko/')).toBe('/tarottwin/')
    expect(siteRoot('/repo-ko/')).toBe('/repo-ko/')
  })
  it('prefers the page, then ?lang, then the saved choice, then the browser', () => {
    expect(detectLang('/pt/', '?lang=ja', 'pl', ['es'])).toBe('pt')
    expect(detectLang('/', '?lang=ja', 'pl', ['es'])).toBe('ja')
    expect(detectLang('/', '?lang=xx', 'pl', ['es'])).toBe('pl')
    expect(detectLang('/', '', null, ['es-MX'])).toBe('es')
    expect(detectLang('/', '', 'nope', ['fr'])).toBe('en')
  })
})

describe('wrapping Japanese', () => {
  const m = (s: string) => [...s].length * 10
  it('breaks between characters, keeping punctuation off the line start', () => {
    const lines = wrapLines('新たな始まり、無邪気さ、信じて跳ぶ勇気。', 0, 60, m)
    expect(lines.join('')).toBe('新たな始まり、無邪気さ、信じて跳ぶ勇気。')
    lines.forEach((l) => expect(m(l)).toBeLessThanOrEqual(70))
    lines.slice(1).forEach((l) => expect('、。').not.toContain(l[0]))
  })
  it('keeps numbers whole and still splits Latin at spaces', () => {
    expect(wrapLines('ワンドの10', 0, 1000, m)).toEqual(['ワンドの10'])
    expect(wrapLines('aa bb cc dd', 10, 30, (s) => s.length * 6)).toEqual(['aa bb', 'cc dd'])
  })
})
