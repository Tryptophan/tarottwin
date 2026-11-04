import type { Element, Suit } from '../data/cards'
import type { Relation, Tone } from '../lib/dignity'
import type { Verdict } from '../lib/oracle'
import type { Bucket, CardText, DeckText, Locale, ProseKit } from './types'

/**
 * English: the source locale. Every other locale must provide the same `ui` shape (see `Messages`),
 * the same deck layout and its own prose kit.
 */

const ui = {
  meta: {
    title: 'Tarot Twin – Free Daily Tarot, Yes/No Oracle & Couples Tarot for Two',
    description: 'Tarot Twin gives you a free daily tarot card reading and a free yes/no tarot oracle, then pairs you with a friend or partner for a shared twin tarot reading.',
  },
  common: {
    back: 'Back',
    copy: 'Copy',
    copied: 'Copied',
    couldNotCopy: 'Could not copy',
    save: 'Save',
    install: 'Install',
    gotIt: 'Got it',
    you: 'You',
    friend: 'Friend',
    stranger: 'Stranger',
  },
  nav: {
    aria: 'Main',
    daily: 'Daily',
    oracle: 'Oracle',
    bonds: 'Bonds',
    cards: 'Cards',
    shop: 'Shop',
    settings: 'Settings',
  },
  topbar: {
    homeAria: 'Tarot Twin, home',
    installTitle: 'Install Tarot Twin',
  },
  install: {
    ios: 'Tap the Share button in Safari’s toolbar, then “Add to Home Screen”.',
    android: 'Open Firefox’s menu (⋮), then tap “Add app to Home screen” or “Install”.',
    mac: 'In Safari’s menu bar, choose File › Add to Dock.',
  },
  onboarding: {
    tagline: 'One card a day. A twin reading for two.',
    namePlaceholder: 'Your name',
    begin: 'Begin',
  },
  card: {
    inspectAria: (name: string) => `${name}. Tap for details`,
    faceDownAria: (label?: string) => (label ? `Face-down card for ${label}. Tap to reveal` : 'Face-down card. Tap to reveal'),
    rarity: { COMMON: 'Common', HOLO: 'Holo', GOLD: 'Gold', GALAXY: 'Galaxy' },
    rarityAria: 'Rarity',
  },
  home: {
    title: 'Today’s card',
    tapToReveal: 'Tap the card to reveal',
    newCardIn: 'New card in',
  },
  twinReadings: {
    title: 'Twin readings',
    /** Rendered as: before + <link to Bonds> + after */
    emptyBefore: 'Invite a friend from ',
    emptyAfter: ' to read together.',
    nextIn: 'Next reading in',
    ready: 'Ready to read',
  },
  twin: {
    title: 'Twin',
    intro: 'A twin reading pairs your daily card with a friend’s and adds a bridge card.',
    tabInvite: 'Invite',
    tabScan: 'Scan',
    qrHint: 'Have your friend scan this or open the link.',
    shareLink: 'Share link',
    copyLink: 'Copy link',
    pastePlaceholder: 'Or paste a link',
    pasteAria: 'Paste link',
    go: 'Go',
    notAnInvite: 'That does not look like a Tarot Twin invite.',
    shareText: (name: string) => `${name} invited you to be Twins`,
  },
  scanner: {
    needsHttps: 'Camera needs a secure (https) connection and a supported browser.',
    denied: 'Camera permission was denied. Allow camera access in your browser settings.',
    noCamera: 'No camera was found on this device.',
    failed: 'Could not start the camera.',
  },
  reading: {
    invalidTitle: 'Invalid link',
    invalidTwin: 'This Twin link is not valid.',
    invalidInvite: 'This invite link is not valid.',
    selfTitle: 'That’s you',
    selfTwin: 'This is your own code. Open a friend’s invite instead.',
    selfInvite: 'This is your own invite. Send it to a friend instead.',
    notBondTitle: 'Not a bond yet',
    notBondBody: 'Share your invite from Bonds, or open a friend’s invite link.',
    joining: 'Joining…',
    bridge: 'Bridge',
    pairTitle: (me: string, friend: string) => `${me} & ${friend}`,
    /** "Tap to reveal: you / Ada / the bridge" */
    tapToReveal: (who: string) => `Tap to reveal: ${who}`,
    revealYou: 'you',
    revealBridge: 'the bridge',
    nextIn: 'Next reading in',
  },
  dignity: {
    relation: { same: 'Strengthened', allied: 'Allied', opposed: 'Opposed', neutral: 'Neutral' } satisfies Record<Relation, string>,
    tone: { harmonious: 'Harmonious', challenging: 'Challenging', balanced: 'Balanced' } satisfies Record<Tone, string>,
    /** "Ada · Bridge" */
    withBridge: (name: string) => `${name} · Bridge`,
  },
  collection: {
    title: 'Collection',
    allUnlocked: 'all unlocked',
    count: (n: number, total: number) => `${n} of ${total} cards unlocked`,
    filterAria: 'Filter cards',
    unlocked: 'Unlocked',
    all: 'All',
    major: 'Major',
    suits: { wands: 'Wands', cups: 'Cups', swords: 'Swords', pentacles: 'Pentacles' } satisfies Record<Suit, string>,
    emptyLocked: 'Nothing here yet. Pull your daily card or a Twin reading to unlock cards, or show the locked ones.',
    noMatch: 'No cards match.',
    owned: (n: number) => `${n} owned`,
  },
  bonds: {
    title: 'Bonds',
    invite: 'Invite',
    empty: 'No bonds yet. Invite a friend to start one.',
    last: (date: string) => `Last ${date}`,
    noReadings: 'No readings yet',
    streak: (n: number) => `${n}-day streak`,
    streakAtRisk: (n: number) => `${n}-day streak: read today to keep it`,
    waiting: 'waiting to sync',
    readToday: 'read today',
    notYetToday: 'not yet today',
  },
  bond: {
    notFound: 'Not found',
    noReadings: 'No readings yet.',
    delete: 'Delete friend',
    confirmDelete: (name: string) => `Delete ${name} and all twin readings?`,
  },
  oracle: {
    title: 'Oracle',
    intro: 'Hold a yes or no question in mind, and type it. Three cards will answer.',
    placeholder: 'Should I…?',
    questionAria: 'Your question',
    ask: 'Ask the cards',
    positions: ['Past', 'Present', 'Future'] as readonly string[],
    /** Same positions, as they read after "Tap to reveal: " */
    revealPositions: ['past', 'present', 'future'] as readonly string[],
    tapToReveal: (pos: string) => `Tap to reveal: ${pos}`,
    reversed: 'reversed',
    reversedShort: '(r)',
    verdict: { yes: 'Likely yes', no: 'Likely no', maybe: 'Maybe' } satisfies Record<Verdict, string>,
    shareImage: 'Share as image',
    share: 'Share',
    askAgainIn: 'Ask again in',
    journal: 'Journal',
    imageHeader: 'TAROT TWIN · ORACLE',
    shareTitle: 'Tarot Twin Oracle',
  },
  shop: {
    title: 'Shop',
    featured: { title: 'Tarot card deck', blurb: 'A physical deck for readings beyond the app.' },
    atmosphere: 'Atmosphere',
    items: [
      { title: 'Crystals', blurb: 'A small set to rest beside your cards.' },
      { title: 'Candles', blurb: 'A soft light for a reading.' },
      { title: 'Incense', blurb: 'Clear the air before you ask.' },
      { title: 'Altar tray', blurb: 'A place for your deck and your tools.' },
    ] as ReadonlyArray<{ title: string; blurb: string }>,
    viewOnAmazon: 'View on Amazon',
    view: 'View',
    onAmazonAria: (title: string) => `${title} on Amazon`,
    comingSoon: 'Coming soon',
    associate: 'As an Amazon Associate I earn from qualifying purchases.',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    yourName: 'Your name',
    yourId: 'Your ID',
    offline: 'Offline',
    offlineReady: 'All cards are saved on this device.',
    offlineSaving: (pct: number) => `Saving cards… ${pct}%`,
    offlineError: 'Some cards could not be saved.',
    offlineIdle: 'Save every card so the app works without a connection.',
    installBody: 'Add Tarot Twin to your home screen to open it like an app, even offline.',
    sync: 'Sync',
    syncBody: (total: number, connected: number) =>
      `Names and Twin reading dates sync with friends through ${total} public relays, end-to-end encrypted. ${connected} connected.`,
    debugInfo: 'Debug info',
    danger: 'Danger zone',
    dangerBody: 'Deleting all data removes your friends and history and creates a new ID. Friends will see you as a new person, and your daily cards will change. This cannot be undone.',
    deleteAll: 'Delete all data / reset ID',
    confirmDeleteAll: 'Delete all data and reset your ID? This cannot be undone.',
  },
  banners: {
    newVersion: 'A new version of Tarot Twin is ready',
    reload: 'Reload',
    savingOffline: (pct: number) => `Saving cards for offline… ${pct}%`,
    offlineFailed: 'Couldn’t save every card for offline',
    retry: 'Retry',
    offlineReady: 'Ready to use offline',
  },
}

export type Messages = typeof ui

// ---- the deck

const MAJORS: ReadonlyArray<readonly [string, string]> = [
  ['The Fool', 'New beginnings, innocence, a leap of faith.'],
  ['The Magician', 'Willpower, skill, turning intent into action.'],
  ['The High Priestess', 'Intuition, mystery, inner knowing.'],
  ['The Empress', 'Nurture, abundance, creative growth.'],
  ['The Emperor', 'Structure, authority, steady leadership.'],
  ['The Hierophant', 'Tradition, shared values, guidance.'],
  ['The Lovers', 'Union, alignment, meaningful choice.'],
  ['The Chariot', 'Drive, determination, victory through focus.'],
  ['Strength', 'Courage, patience, gentle inner power.'],
  ['The Hermit', 'Solitude, reflection, a guiding light within.'],
  ['Wheel of Fortune', 'Cycles, luck, a turning point.'],
  ['Justice', 'Fairness, truth, accountability.'],
  ['The Hanged Man', 'Surrender, new perspective, a pause.'],
  ['Death', 'Endings, transformation, clearing the way.'],
  ['Temperance', 'Balance, moderation, blending opposites.'],
  ['The Devil', 'Attachment, temptation, shadow patterns.'],
  ['The Tower', 'Sudden change, upheaval, revelation.'],
  ['The Star', 'Hope, renewal, quiet inspiration.'],
  ['The Moon', 'Illusion, dreams, the subconscious.'],
  ['The Sun', 'Joy, vitality, clarity and success.'],
  ['Judgement', 'Awakening, reckoning, answering a calling.'],
  ['The World', 'Completion, wholeness, a cycle fulfilled.'],
]

const MINOR_MEANINGS: Record<Suit, readonly string[]> = {
  wands: [
    'A spark of inspiration and bold new energy.',
    'Planning, choices, and looking beyond the horizon.',
    'Expansion, foresight, and waiting for your ships to come in.',
    'Celebration, homecoming, and stable joy.',
    'Rivalry, competition, and scattered conflict.',
    'Victory, recognition, and public success.',
    'Defending your position with resolve.',
    'Swift movement, messages, and fast progress.',
    'Resilience, persistence, and one last push.',
    'Burden, overcommitment, and carrying too much.',
    'An eager explorer with fresh creative ideas.',
    'Passionate, adventurous, and impulsive pursuit.',
    'Warm, confident, and magnetic leadership.',
    'Visionary, bold leadership and charisma.',
  ],
  cups: [
    'New feelings, love, and emotional openness.',
    'Mutual attraction, partnership, and connection.',
    'Friendship, celebration, and shared joy.',
    'Apathy, contemplation, and reevaluating offers.',
    'Loss, regret, and grieving what was.',
    'Nostalgia, childhood memories, and kindness.',
    'Fantasy, wishful thinking, and many options.',
    'Walking away to seek something deeper.',
    'Contentment, a wish fulfilled, emotional satisfaction.',
    'Harmony, family, and lasting happiness.',
    'A tender messenger bringing creative or romantic news.',
    'Romantic, charming, and following the heart.',
    'Compassionate, intuitive, and emotionally wise.',
    'Emotional balance, diplomacy, and calm generosity.',
  ],
  swords: [
    'Clarity, a breakthrough, and the truth revealed.',
    'Stalemate, difficult choice, and avoided truth.',
    'Heartbreak, grief, and painful honesty.',
    'Rest, recovery, and quiet contemplation.',
    'Conflict, hollow victory, and tension.',
    'Moving on, transition, and calmer waters.',
    'Strategy, secrecy, and acting alone.',
    'Restriction, self-doubt, and feeling trapped.',
    'Anxiety, worry, and sleepless nights.',
    'Painful ending, rock bottom, and release.',
    'Curious, alert, and eager to learn.',
    'Fast, direct, and driven by ideas.',
    'Perceptive, independent, and clear-eyed.',
    'Intellect, authority, and fair judgment.',
  ],
  pentacles: [
    'A new opportunity, prosperity, and grounded beginnings.',
    'Juggling priorities and adapting to change.',
    'Teamwork, craft, and building something together.',
    'Security, saving, and holding on tightly.',
    'Hardship, lack, and feeling left out in the cold.',
    'Generosity, giving and receiving, and support.',
    'Patience, long-term investment, and waiting for the harvest.',
    'Diligence, mastery, and dedicated practice.',
    'Self-sufficiency, luxury, and well-earned comfort.',
    'Legacy, family wealth, and lasting security.',
    'Studious, practical, and open to new skills.',
    'Reliable, methodical, and steady effort.',
    'Nurturing, practical, and resourceful abundance.',
    'Prosperous, dependable, and generous provider.',
  ],
}

const RANKS = ['Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Page', 'Knight', 'Queen', 'King']
const SUIT_NAME: Record<Suit, string> = { wands: 'Wands', cups: 'Cups', swords: 'Swords', pentacles: 'Pentacles' }

/** English keywords are the meaning's own phrases: "Willpower, skill, turning intent into action." */
const kw = (upright: string) => upright.replace(/\.$/, '').split(/,\s*/).map((k) => k.toLowerCase().replace(/^and\s+/, ''))
const text = (name: string, upright: string): CardText => [name, upright, kw(upright)]
const minors = (s: Suit) => MINOR_MEANINGS[s].map((u, i) => text(`${RANKS[i]} of ${SUIT_NAME[s]}`, u))

export const deck: DeckText = {
  majors: MAJORS.map(([n, u]) => text(n, u)),
  minors: {
    wands: minors('wands'),
    cups: minors('cups'),
    swords: minors('swords'),
    pentacles: minors('pentacles'),
  },
}

// ---- prose

const LEAD_TWIN = ['As new threads begin,', 'With a rhythm taking hold,', 'With your rhythm growing,', 'With so deep a rhythm between you,']
const LEAD_DAILY = ['Today,', 'As a rhythm takes hold,', 'With your rhythm growing,', 'With a rhythm so well worn,']

const REL: Record<Relation, readonly string[]> = {
  same: ['{a} answers {a}, doubling its strength', 'one current of {a} runs through you both'],
  allied: ['{a} and {b} feed one another', '{a} lends {b} its breath'],
  opposed: ['{a} and {b} pull against each other', '{a} and {b} strike sparks off one another'],
  neutral: ['{a} and {b} meet without friction', '{a} and {b} keep a courteous distance'],
}
const fill = (t: string, a: Element, b: Element) => t.replace(/\{a\}/g, a).replace(/\{b\}/g, b)

const TONE: Record<Tone, readonly string[]> = {
  harmonious: ['the day favors you both', 'little will resist you together', 'what you start side by side will hold'],
  challenging: ['friction will be the day\'s teacher', 'honesty will matter more than ease', 'tread gently and listen twice'],
  balanced: ['the day tips whichever way you lean', 'neither pulls ahead, so choose together', 'steady attention will decide it'],
}

const ELEMENT_DAILY: Record<Element, readonly string[]> = {
  fire: ['act while the fire is warm', 'let your courage lead'],
  water: ['let feeling guide your steps', 'trust what you sense beneath the surface'],
  air: ['speak your thoughts plainly', 'let a clear idea take flight'],
  earth: ['build something small and lasting', 'keep your feet on steady ground'],
}

const LEAD = ['Behind you,', 'Before you,', 'Ahead,']
const TURN: Record<'up' | 'down', readonly string[]> = {
  up: ['{n} lends {k}', '{n} offers {k}', '{n} carries {k}'],
  down: ['{n}, turned over, clouds {k}', '{n} reversed holds {k} just out of reach', '{n}, upended, bends {k} inward'],
}
const CLOSE: Record<Verdict, readonly string[]> = {
  yes: ['The omens lean toward yes.', 'The veil parts, and it opens toward yes.', 'The stars lean your way.'],
  no: ['The omens lean toward no.', 'The veil stays drawn, and it closes toward no.', 'The stars turn their faces away.'],
  maybe: ['The omens will not settle.', 'The veil trembles and the answer stays unwritten.', 'The stars hold their breath.'],
}

export const prose: ProseKit = {
  daily(card, bucket: Bucket, pick) {
    const k1 = pick(card.keywords)
    const k2 = pick(card.keywords.filter((k) => k !== k1).concat(k1))
    const s1 = k1 === k2 ? `${card.name} brings ${k1}.` : `${card.name} brings ${k1} and ${k2}.`
    return `${s1} ${LEAD_DAILY[bucket]} ${pick(ELEMENT_DAILY[card.element])}.`
  },
  twin({ a, b, bridge, rel, tone, bucket }, pick) {
    const ka = pick(a.keywords), kb = pick(b.keywords), kg = pick(bridge.keywords)
    const s1 = `${a.name} meets ${b.name}: ${ka} beside ${kb}, where ${fill(pick(REL[rel]), a.element, b.element)}.`
    const s2 = pick([
      `${bridge.name} arches between you, offering ${kg}.`,
      `Between you stands ${bridge.name}, a bridge of ${kg}.`,
      `${bridge.name} joins the two, carrying ${kg}.`,
    ])
    return `${s1} ${s2} ${LEAD_TWIN[bucket]} ${pick(TONE[tone])}.`
  },
  oracle(cards, verdict, pick) {
    const parts = cards.map((d, i) => {
      const t = pick(TURN[d.reversed ? 'down' : 'up']).replace('{n}', d.card.name).replace('{k}', pick(d.card.keywords))
      return `${LEAD[i]} ${t}.`
    })
    return `${parts.join(' ')} ${pick(CLOSE[verdict])}`
  },
}

export const en: Locale = { tag: 'en', native: 'English', ui, deck, prose }
