import type { Element, Suit } from '../data/cards'
import type { Relation, Tone } from '../lib/dignity'
import type { Verdict } from '../lib/oracle'
import type { Messages } from './en'
import type { Bucket, CardText, DeckText, Locale, ProseKit } from './types'

/**
 * Polish. Card names and keywords only ever appear where the nominative is correct (after "to", a colon or a
 * dash, or as an apposition to "karta"), and no verb agrees with a card name, so plural names like
 * "Kochankowie" stay grammatical.
 */

/** Polish plural form: 1 → one, 2–4 (but not 12–14) → few, everything else → many. */
const plural = (n: number, one: string, few: string, many: string) => {
  const n10 = n % 10, n100 = n % 100
  if (n === 1) return one
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return few
  return many
}
const days = (n: number) => `${n} ${plural(n, 'dzień', 'dni', 'dni')}`

const ui: Messages = {
  meta: {
    title: 'Tarot Twin – darmowy tarot dzienny, tarot tak czy nie i tarot dla par',
    description: 'Tarot Twin to darmowa karta tarota na każdy dzień i darmowa wyrocznia tarota tak czy nie. Połącz się z przyjacielem lub partnerem i odkryjcie wspólny rozkład bliźniaczy.',
  },
  common: {
    back: 'Wróć',
    copy: 'Kopiuj',
    copied: 'Skopiowano',
    couldNotCopy: 'Nie udało się skopiować',
    save: 'Zapisz',
    install: 'Zainstaluj',
    gotIt: 'Rozumiem',
    you: 'Ty',
    friend: 'Przyjaciel',
    stranger: 'Nieznajomy',
  },
  nav: {
    aria: 'Główna nawigacja',
    daily: 'Dziś',
    oracle: 'Wyrocznia',
    bonds: 'Więzi',
    cards: 'Karty',
    shop: 'Sklep',
    settings: 'Opcje',
  },
  topbar: {
    homeAria: 'Tarot Twin, strona główna',
    installTitle: 'Zainstaluj Tarot Twin',
  },
  install: {
    ios: 'Stuknij przycisk Udostępnij na pasku Safari, a potem „Do ekranu początkowego”.',
    android: 'Otwórz menu Firefoksa (⋮) i stuknij „Dodaj aplikację do ekranu głównego” lub „Zainstaluj”.',
    mac: 'Na pasku menu Safari wybierz Plik › Dodaj do Docka.',
  },
  onboarding: {
    tagline: 'Jedna karta dziennie. Rozkład bliźniaczy we dwoje.',
    namePlaceholder: 'Twoje imię',
    begin: 'Zaczynamy',
  },
  card: {
    inspectAria: (name: string) => `${name}. Stuknij, by zobaczyć szczegóły`,
    faceDownAria: (label?: string) => (label ? `Zakryta karta (${label}). Stuknij, by odkryć` : 'Zakryta karta. Stuknij, by odkryć'),
    rarity: { COMMON: 'Zwykła', HOLO: 'Holo', GOLD: 'Złota', GALAXY: 'Galaktyczna' },
    rarityAria: 'Rzadkość',
  },
  home: {
    title: 'Karta dnia',
    tapToReveal: 'Stuknij kartę, by ją odkryć',
    newCardIn: 'Nowa karta za',
  },
  twinReadings: {
    title: 'Rozkłady bliźniacze',
    emptyBefore: 'Zaproś przyjaciela w zakładce ',
    emptyAfter: ', by czytać karty razem.',
    nextIn: 'Następny rozkład za',
    ready: 'Gotowe do odczytu',
  },
  twin: {
    title: 'Rozkład bliźniaczy',
    intro: 'Rozkład bliźniaczy łączy twoją kartę dnia z kartą przyjaciela i dodaje między nimi kartę-most.',
    tabInvite: 'Zaproś',
    tabScan: 'Skanuj',
    qrHint: 'Niech przyjaciel zeskanuje ten kod albo otworzy link.',
    shareLink: 'Udostępnij',
    copyLink: 'Kopiuj link',
    pastePlaceholder: 'Albo wklej link',
    pasteAria: 'Wklej link',
    go: 'Dalej',
    notAnInvite: 'To nie wygląda na zaproszenie do Tarot Twin.',
    shareText: (name: string) => `${name} zaprasza cię do wspólnych rozkładów bliźniaczych`,
  },
  scanner: {
    needsHttps: 'Aparat wymaga bezpiecznego połączenia (https) i obsługiwanej przeglądarki.',
    denied: 'Odmówiono dostępu do aparatu. Zezwól na nie w ustawieniach przeglądarki.',
    noCamera: 'Na tym urządzeniu nie znaleziono aparatu.',
    failed: 'Nie udało się uruchomić aparatu.',
  },
  reading: {
    invalidTitle: 'Nieprawidłowy link',
    invalidTwin: 'Ten link do rozkładu bliźniaczego jest nieprawidłowy.',
    invalidInvite: 'Ten link z zaproszeniem jest nieprawidłowy.',
    selfTitle: 'To ty',
    selfTwin: 'To twój własny kod. Otwórz zaproszenie od przyjaciela.',
    selfInvite: 'To twoje własne zaproszenie. Wyślij je przyjacielowi.',
    notBondTitle: 'To jeszcze nie więź',
    notBondBody: 'Udostępnij zaproszenie z zakładki Więzi albo otwórz link od przyjaciela.',
    joining: 'Łączenie…',
    bridge: 'Most',
    pairTitle: (me: string, friend: string) => `${me} i ${friend}`,
    /** "Stuknij, by odkryć: ty / Ada / most" (a label after the colon, so a bare name works) */
    tapToReveal: (who: string) => `Stuknij, by odkryć: ${who}`,
    revealYou: 'ty',
    revealBridge: 'most',
    nextIn: 'Następny rozkład za',
  },
  dignity: {
    relation: { same: 'Wzmocnione', allied: 'Sprzymierzone', opposed: 'Przeciwne', neutral: 'Neutralne' } satisfies Record<Relation, string>,
    tone: { harmonious: 'Harmonijny', challenging: 'Wymagający', balanced: 'Wyważony' } satisfies Record<Tone, string>,
    withBridge: (name: string) => `${name} · Most`,
  },
  collection: {
    title: 'Kolekcja',
    allUnlocked: 'wszystkie odblokowane',
    count: (n: number, total: number) => `Odblokowano ${n} z ${total} kart`,
    filterAria: 'Filtruj karty',
    unlocked: 'Odblokowane',
    all: 'Wszystkie',
    major: 'Wielkie',
    suits: { wands: 'Buławy', cups: 'Puchary', swords: 'Miecze', pentacles: 'Denary' } satisfies Record<Suit, string>,
    emptyLocked: 'Nic tu jeszcze nie ma. Wylosuj kartę dnia albo rozkład bliźniaczy, by odblokować karty, lub pokaż te zablokowane.',
    noMatch: 'Brak pasujących kart.',
    owned: (n: number) => `${n} ${plural(n, 'egzemplarz', 'egzemplarze', 'egzemplarzy')}`,
  },
  bonds: {
    title: 'Więzi',
    invite: 'Zaproś',
    empty: 'Nie masz jeszcze więzi. Zaproś przyjaciela, by ją zawiązać.',
    last: (date: string) => `Ostatnio ${date}`,
    noReadings: 'Jeszcze bez rozkładów',
    streak: (n: number) => `Seria: ${days(n)}`,
    streakAtRisk: (n: number) => `Seria: ${days(n)}. Zajrzyj dziś, by jej nie przerwać`,
    waiting: 'czeka na synchronizację',
    readToday: 'dziś odczytane',
    notYetToday: 'dziś jeszcze nie',
  },
  bond: {
    notFound: 'Nie znaleziono',
    noReadings: 'Jeszcze bez rozkładów.',
    delete: 'Usuń przyjaciela',
    confirmDelete: (name: string) => `Usunąć z listy: ${name}? Znikną też wszystkie wasze rozkłady bliźniacze.`,
  },
  oracle: {
    title: 'Wyrocznia',
    intro: 'Pomyśl o pytaniu, na które odpowiedź brzmi „tak” lub „nie”, i wpisz je. Odpowiedzą trzy karty.',
    placeholder: 'Czy warto…?',
    questionAria: 'Twoje pytanie',
    ask: 'Zapytaj karty',
    positions: ['Przeszłość', 'Teraźniejszość', 'Przyszłość'] as readonly string[],
    revealPositions: ['przeszłość', 'teraźniejszość', 'przyszłość'] as readonly string[],
    tapToReveal: (pos: string) => `Stuknij, by odkryć: ${pos}`,
    reversed: 'odwrócona',
    reversedShort: '(odwr.)',
    verdict: { yes: 'Raczej tak', no: 'Raczej nie', maybe: 'Może' } satisfies Record<Verdict, string>,
    shareImage: 'Udostępnij obraz',
    share: 'Udostępnij',
    askAgainIn: 'Zapytaj ponownie za',
    journal: 'Dziennik',
    imageHeader: 'TAROT TWIN · WYROCZNIA',
    shareTitle: 'Wyrocznia Tarot Twin',
  },
  shop: {
    title: 'Sklep',
    featured: { title: 'Talia kart tarota', blurb: 'Prawdziwa talia do rozkładów poza aplikacją.' },
    atmosphere: 'Nastrój',
    items: [
      { title: 'Kryształy', blurb: 'Mały zestaw, który spocznie obok twoich kart.' },
      { title: 'Świece', blurb: 'Łagodne światło do wróżenia.' },
      { title: 'Kadzidło', blurb: 'Oczyść powietrze, zanim zapytasz.' },
      { title: 'Taca na ołtarz', blurb: 'Miejsce na twoją talię i przybory.' },
    ] as ReadonlyArray<{ title: string; blurb: string }>,
    viewOnAmazon: 'Zobacz na Amazonie',
    view: 'Zobacz',
    onAmazonAria: (title: string) => `${title} na Amazonie`,
    comingSoon: 'Wkrótce',
    associate: 'Jako Partner Amazon zarabiam na kwalifikujących się zakupach.',
  },
  settings: {
    title: 'Ustawienia',
    language: 'Język',
    yourName: 'Twoje imię',
    yourId: 'Twój identyfikator',
    offline: 'Tryb offline',
    offlineReady: 'Wszystkie karty są zapisane na tym urządzeniu.',
    offlineSaving: (pct: number) => `Zapisywanie kart… ${pct}%`,
    offlineError: 'Nie udało się zapisać niektórych kart.',
    offlineIdle: 'Zapisz wszystkie karty, by aplikacja działała bez internetu.',
    installBody: 'Dodaj Tarot Twin do ekranu głównego, by otwierać go jak aplikację, także offline.',
    sync: 'Synchronizacja',
    syncBody: (total: number, connected: number) =>
      `Imiona i daty rozkładów bliźniaczych synchronizują się z przyjaciółmi przez ${total} ${plural(total, 'publiczny przekaźnik', 'publiczne przekaźniki', 'publicznych przekaźników')}, z szyfrowaniem end-to-end. Połączone: ${connected}.`,
    debugInfo: 'Informacje diagnostyczne',
    danger: 'Strefa zagrożenia',
    dangerBody: 'Usunięcie wszystkich danych kasuje twoich przyjaciół i historię oraz tworzy nowy identyfikator. Przyjaciele zobaczą cię jako nową osobę, a twoje karty dnia się zmienią. Tego nie można cofnąć.',
    deleteAll: 'Usuń dane / nowy identyfikator',
    confirmDeleteAll: 'Usunąć wszystkie dane i zresetować identyfikator? Tego nie można cofnąć.',
  },
  banners: {
    newVersion: 'Nowa wersja Tarot Twin jest gotowa',
    reload: 'Odśwież',
    savingOffline: (pct: number) => `Zapisywanie kart do trybu offline… ${pct}%`,
    offlineFailed: 'Nie udało się zapisać wszystkich kart offline',
    retry: 'Ponów',
    offlineReady: 'Gotowe do pracy offline',
  },
}

// ---- the deck

/** [name, upright, keywords?]: without keywords, they are the meaning's own phrases. */
type Entry = readonly [string, string, (readonly string[])?]

const MAJORS: readonly Entry[] = [
  ['Głupiec', 'Nowe początki, niewinność, skok w nieznane.'],
  ['Mag', 'Siła woli, umiejętności, zamiar przemieniony w czyn.'],
  ['Kapłanka', 'Intuicja, tajemnica, wewnętrzna wiedza.'],
  ['Cesarzowa', 'Troska, obfitość, twórczy rozkwit.'],
  ['Cesarz', 'Porządek, autorytet, spokojne przywództwo.'],
  ['Kapłan', 'Tradycja, wspólne wartości, duchowe przewodnictwo.'],
  ['Kochankowie', 'Jedność, harmonia, ważny wybór.'],
  ['Rydwan', 'Zapał, determinacja, zwycięstwo dzięki skupieniu.'],
  ['Moc', 'Odwaga, cierpliwość, łagodna siła wewnętrzna.'],
  ['Pustelnik', 'Samotność, refleksja, wewnętrzne światło.'],
  ['Koło Fortuny', 'Cykle, szczęście, punkt zwrotny.'],
  ['Sprawiedliwość', 'Uczciwość, prawda, odpowiedzialność.'],
  ['Wisielec', 'Poddanie się, nowa perspektywa, chwila zawieszenia.'],
  ['Śmierć', 'Koniec, przemiana, oczyszczenie drogi.'],
  ['Umiarkowanie', 'Równowaga, umiar, łączenie przeciwieństw.'],
  ['Diabeł', 'Przywiązanie, pokusa, cień dawnych wzorców.'],
  ['Wieża', 'Nagła zmiana, wstrząs, objawienie.'],
  ['Gwiazda', 'Nadzieja, odnowa, cicha inspiracja.'],
  ['Księżyc', 'Iluzja, sny, podświadomość.'],
  ['Słońce', 'Radość, witalność, jasność i sukces.'],
  ['Sąd Ostateczny', 'Przebudzenie, rozliczenie, odpowiedź na wezwanie.'],
  ['Świat', 'Spełnienie, pełnia, domknięty cykl.'],
]

/** [upright, keywords?] for Ace … King. */
type MinorEntry = readonly [string, (readonly string[])?]

const MINORS: Record<Suit, readonly MinorEntry[]> = {
  wands: [
    ['Iskra natchnienia i śmiała, nowa energia.', ['iskra natchnienia', 'nowa energia']],
    ['Planowanie, wybory i spojrzenie za horyzont.'],
    ['Rozwój, przezorność i czekanie, aż statki zawiną do portu.', ['rozwój', 'przezorność', 'cierpliwe wyczekiwanie']],
    ['Świętowanie, powrót do domu i stabilna radość.'],
    ['Rywalizacja, współzawodnictwo i rozproszone konflikty.'],
    ['Zwycięstwo, uznanie i publiczny sukces.'],
    ['Stanowcza obrona własnej pozycji.', ['stanowczość', 'obrona własnej pozycji']],
    ['Szybki ruch, wieści i błyskawiczne postępy.'],
    ['Odporność, wytrwałość i ostatni wysiłek.'],
    ['Brzemię, nadmiar zobowiązań i dźwiganie ponad siły.'],
    ['Zapalony odkrywca pełen świeżych, twórczych pomysłów.', ['odkrywczy zapał', 'świeże pomysły', 'twórcza ciekawość']],
    ['Namiętna, śmiała i porywcza pogoń za celem.', ['namiętność', 'śmiałość', 'porywczość']],
    ['Ciepłe, pewne siebie i magnetyczne przywództwo.', ['ciepło', 'pewność siebie', 'magnetyczny urok']],
    ['Wizjonerskie, odważne przywództwo i charyzma.', ['wizja', 'odważne przywództwo', 'charyzma']],
  ],
  cups: [
    ['Nowe uczucia, miłość i emocjonalna otwartość.'],
    ['Wzajemne przyciąganie, partnerstwo i bliskość.'],
    ['Przyjaźń, świętowanie i wspólna radość.'],
    ['Apatia, zaduma i ponowne ważenie ofert.'],
    ['Strata, żal i opłakiwanie tego, co minęło.', ['strata', 'żal', 'tęsknota za tym, co minęło']],
    ['Nostalgia, wspomnienia z dzieciństwa i życzliwość.'],
    ['Fantazje, pobożne życzenia i mnóstwo możliwości.'],
    ['Odejście w poszukiwaniu czegoś głębszego.', ['odejście', 'poszukiwanie głębi']],
    ['Zadowolenie, spełnione życzenie, emocjonalna satysfakcja.'],
    ['Harmonia, rodzina i trwałe szczęście.'],
    ['Czuły posłaniec z twórczą lub romantyczną nowiną.', ['czułość', 'romantyczna nowina', 'twórcze natchnienie']],
    ['Romantyczny urok i podążanie za głosem serca.', ['romantyzm', 'urok', 'głos serca']],
    ['Współczucie, intuicja i emocjonalna mądrość.'],
    ['Równowaga uczuć, dyplomacja i spokojna hojność.'],
  ],
  swords: [
    ['Jasność, przełom i prawda wychodząca na jaw.', ['jasność', 'przełom', 'odsłonięta prawda']],
    ['Impas, trudny wybór i unikanie prawdy.'],
    ['Złamane serce, smutek i bolesna szczerość.'],
    ['Odpoczynek, regeneracja i cicha kontemplacja.'],
    ['Konflikt, puste zwycięstwo i napięcie.'],
    ['Pójście dalej, zmiana i spokojniejsze wody.'],
    ['Strategia, tajemnica i działanie w pojedynkę.'],
    ['Ograniczenia, zwątpienie i poczucie uwięzienia.'],
    ['Lęk, zmartwienia i bezsenne noce.'],
    ['Bolesny koniec, samo dno i uwolnienie.'],
    ['Ciekawość, czujność i zapał do nauki.'],
    ['Szybkość, bezpośredniość i siła idei.'],
    ['Przenikliwość, niezależność i trzeźwe spojrzenie.'],
    ['Intelekt, autorytet i sprawiedliwy osąd.'],
  ],
  pentacles: [
    ['Nowa szansa, dobrobyt i mocny fundament na start.', ['nowa szansa', 'dobrobyt', 'mocny fundament']],
    ['Żonglowanie priorytetami i dostosowanie do zmian.'],
    ['Praca zespołowa, rzemiosło i wspólne budowanie.'],
    ['Bezpieczeństwo, oszczędność i kurczowe trzymanie się swego.'],
    ['Trudności, niedostatek i poczucie odrzucenia.'],
    ['Hojność, dzielenie się i wzajemne wsparcie.'],
    ['Cierpliwość, długofalowe inwestycje i czekanie na plony.'],
    ['Pracowitość, mistrzostwo i wytrwała praktyka.'],
    ['Samodzielność, luksus i zasłużony komfort.'],
    ['Dziedzictwo, rodzinny majątek i trwałe bezpieczeństwo.'],
    ['Pilność, praktyczność i otwartość na nowe umiejętności.', ['pilność', 'praktyczność', 'otwartość na naukę']],
    ['Niezawodność, metodyczność i wytrwały wysiłek.'],
    ['Troskliwość, praktyczność i zaradna obfitość.', ['troskliwość', 'praktyczność', 'zaradność']],
    ['Dostatek, solidność i hojne zapewnianie bytu.', ['dostatek', 'solidność', 'hojność']],
  ],
}

const RANKS = ['As', 'Dwójka', 'Trójka', 'Czwórka', 'Piątka', 'Szóstka', 'Siódemka', 'Ósemka', 'Dziewiątka', 'Dziesiątka', 'Paź', 'Rycerz', 'Królowa', 'Król']
/** Genitive plural, as in "As Buław", "Królowa Mieczy". */
const SUIT_GEN: Record<Suit, string> = { wands: 'Buław', cups: 'Pucharów', swords: 'Mieczy', pentacles: 'Denarów' }

/** Keywords from the meaning itself: "Odwaga, cierpliwość i siła." → odwaga / cierpliwość / siła */
const kw = (upright: string) =>
  upright.replace(/\.$/, '').split(/,\s*|\s+i\s+/).map((k) => k.charAt(0).toLowerCase() + k.slice(1))
const text = (name: string, upright: string, keywords?: readonly string[]): CardText => [name, upright, keywords ?? kw(upright)]

export const deck: DeckText = {
  majors: MAJORS.map(([n, u, k]) => text(n, u, k)),
  minors: Object.fromEntries(
    (Object.keys(MINORS) as Suit[]).map((s): [Suit, readonly CardText[]] => [s, MINORS[s].map(([u, k], i) => text(`${RANKS[i]} ${SUIT_GEN[s]}`, u, k))]),
  ) as Record<Suit, readonly CardText[]>,
}

// ---- prose

/** Element names in the cases the templates need. Only these, never a card name, take inflected forms. */
const EL: Record<Element, { nom: string; gen: string; dat: string }> = {
  fire: { nom: 'ogień', gen: 'ognia', dat: 'ogniowi' },
  water: { nom: 'woda', gen: 'wody', dat: 'wodzie' },
  air: { nom: 'powietrze', gen: 'powietrza', dat: 'powietrzu' },
  earth: { nom: 'ziemia', gen: 'ziemi', dat: 'ziemi' },
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const LEAD_TWIN = ['Gdy splatają się pierwsze nici,', 'Gdy wasz rytm nabiera kształtu,', 'Gdy wasz rytm rośnie w siłę,', 'Przy tak głębokim rytmie między wami']
const LEAD_DAILY = ['Dziś', 'Gdy rodzi się twój rytm,', 'Gdy twój rytm rośnie w siłę,', 'Przy tak utrwalonym rytmie']

/** {a}/{b} nominative, {a:gen}, {a:dat}, {b:dat}: the element names in that case. */
const REL: Record<Relation, readonly string[]> = {
  same: ['{a} odpowiada {a:dat}, podwajając swoją siłę', 'jeden nurt {a:gen} płynie w was obojgu'],
  allied: ['{a} i {b} wzajemnie się karmią', '{a} użycza {b:dat} swojego oddechu'],
  opposed: ['{a} i {b} ciągną w przeciwne strony', '{a} i {b} krzeszą między sobą iskry'],
  neutral: ['{a} i {b} spotykają się bez tarcia', '{a} i {b} zachowują uprzejmy dystans'],
}
const fill = (t: string, a: Element, b: Element) =>
  t.replace(/\{([ab])(?::(gen|dat))?\}/g, (_, w: 'a' | 'b', c?: 'gen' | 'dat') => EL[w === 'a' ? a : b][c ?? 'nom'])

const TONE: Record<Tone, readonly string[]> = {
  harmonious: ['dzień sprzyja wam obojgu', 'razem niewiele zdoła was zatrzymać', 'to, co zaczniecie ramię w ramię, przetrwa'],
  challenging: ['tarcie będzie dziś waszym nauczycielem', 'szczerość znaczy dziś więcej niż wygoda', 'stąpajcie ostrożnie i słuchajcie dwa razy uważniej'],
  balanced: ['dzień przechyli się tam, dokąd się skłonicie', 'żadna strona nie przeważa, więc wybierzcie razem', 'o wszystkim zdecyduje uważność'],
}

const ELEMENT_DAILY: Record<Element, readonly string[]> = {
  fire: ['działaj, póki ogień jest gorący', 'niech prowadzi cię odwaga'],
  water: ['pozwól, by uczucia wskazały ci drogę', 'zaufaj temu, co czujesz pod powierzchnią'],
  air: ['mów otwarcie, co myślisz', 'pozwól jasnej myśli rozwinąć skrzydła'],
  earth: ['zbuduj coś małego, ale trwałego', 'stój mocno na ziemi'],
}

/** The card is always "karta {n}", so verbs agree with "karta", never with the name. */
const LEAD = ['Za tobą', 'Tu i teraz', 'Przed tobą']
const TURN: Record<'up' | 'down', readonly string[]> = {
  up: ['leży karta {n}, a z nią {k}', 'karta {n} szepcze: {k}', 'odzywa się karta {n}, a jej znak to {k}'],
  down: ['leży odwrócona karta {n}, a w cieniu kryje się jej znak: {k}', 'odwrócona karta {n} szepcze: {k}, lecz poza zasięgiem', 'karta {n} pada odwrócona, a jej znak, {k}, zwraca się do wewnątrz'],
}
const CLOSE: Record<Verdict, readonly string[]> = {
  yes: ['Znaki skłaniają się ku „tak”.', 'Zasłona się rozchyla, a za nią czeka „tak”.', 'Gwiazdy są po twojej stronie.'],
  no: ['Znaki skłaniają się ku „nie”.', 'Zasłona pozostaje zaciągnięta, a za nią kryje się „nie”.', 'Gwiazdy odwracają od ciebie wzrok.'],
  maybe: ['Znaki nie chcą się ułożyć.', 'Zasłona drży, a odpowiedź pozostaje niezapisana.', 'Gwiazdy wstrzymują oddech.'],
}

export const prose: ProseKit = {
  daily(card, bucket: Bucket, pick) {
    const k1 = pick(card.keywords)
    const k2 = pick(card.keywords.filter((k) => k !== k1).concat(k1))
    const s1 = k1 === k2 ? `Twoja karta to ${card.name}: ${k1}.` : `Twoja karta to ${card.name}: ${k1} i ${k2}.`
    return `${s1} ${LEAD_DAILY[bucket]} ${pick(ELEMENT_DAILY[card.element])}.`
  },
  twin({ a, b, bridge, rel, tone, bucket }, pick) {
    const ka = pick(a.keywords), kb = pick(b.keywords), kg = pick(bridge.keywords)
    const s1 = `${a.name} i ${b.name}: ${ka}, a tuż obok ${kb}. ${cap(fill(pick(REL[rel]), a.element, b.element))}.`
    const s2 = pick([
      `Mostem między wami jest karta ${bridge.name}, a z nią ${kg}.`,
      `Między wami staje karta ${bridge.name}, a jej dar to ${kg}.`,
      `Łączy was karta ${bridge.name}: ${kg}.`,
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

export const pl: Locale = { tag: 'pl', native: 'Polski', ui, deck, prose }
