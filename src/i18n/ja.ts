import type { Element, Suit } from '../data/cards'
import type { Relation, Tone } from '../lib/dignity'
import type { Verdict } from '../lib/oracle'
import type { Messages } from './en'
import type { Bucket, CardText, DeckText, Locale, ProseKit } from './types'

/** Japanese. Mirrors en.ts: the same `ui` shape, deck layout and pick order in the prose kit. */

const ui: Messages = {
  meta: {
    title: 'Tarot Twin｜無料タロット占い・今日の運勢・イエスノー・ふたりの相性占い',
    description:
      'Tarot Twin（タロットツイン）は、無料で今日の運勢がわかるタロット占いアプリ。イエスノー タロットで質問に答え、友達や恋人とふたりで占うツインリーディングで相性占いも楽しめます。',
  },
  common: {
    back: '戻る',
    copy: 'コピー',
    copied: 'コピーしました',
    couldNotCopy: 'コピーできませんでした',
    save: '保存',
    install: 'インストール',
    gotIt: 'OK',
    you: 'あなた',
    friend: '友達',
    stranger: '知らない人',
  },
  nav: {
    aria: 'メインメニュー',
    daily: '今日',
    oracle: 'オラクル',
    bonds: 'つながり',
    cards: 'カード',
    shop: 'ショップ',
    settings: '設定',
  },
  topbar: {
    homeAria: 'Tarot Twin ホーム',
    installTitle: 'Tarot Twin をインストール',
  },
  install: {
    ios: 'Safariのツールバーにある共有ボタンをタップし、「ホーム画面に追加」を選んでください。',
    android: 'Firefoxのメニュー（⋮）を開き、「アプリをホーム画面に追加」または「インストール」をタップしてください。',
    mac: 'Safariのメニューバーから「ファイル」›「Dockに追加」を選んでください。',
  },
  onboarding: {
    tagline: '毎日1枚のカード。ふたりで占うツインリーディング。',
    namePlaceholder: 'あなたの名前',
    begin: 'はじめる',
  },
  card: {
    inspectAria: (name: string) => `${name}。タップして詳細を見る`,
    faceDownAria: (label?: string) =>
      label ? `${label}の伏せられたカード。タップして開く` : '伏せられたカード。タップして開く',
    rarity: { COMMON: 'コモン', HOLO: 'ホロ', GOLD: 'ゴールド', GALAXY: 'ギャラクシー' },
    rarityAria: 'レア度',
  },
  home: {
    title: '今日のカード',
    tapToReveal: 'カードをタップして開きましょう',
    newCardIn: '次のカードまで',
  },
  twinReadings: {
    title: 'ツインリーディング',
    emptyBefore: '',
    emptyAfter: 'から友達を招待して、一緒に占いましょう。',
    nextIn: '次のリーディングまで',
    ready: '占えます',
  },
  twin: {
    title: 'ツイン',
    intro: 'ツインリーディングでは、あなたと友達の今日のカードを組み合わせ、ふたりをつなぐブリッジのカードを加えます。',
    tabInvite: '招待',
    tabScan: 'スキャン',
    qrHint: '友達にこのコードをスキャンしてもらうか、リンクを開いてもらいましょう。',
    shareLink: 'リンクを共有',
    copyLink: 'リンクをコピー',
    pastePlaceholder: 'またはリンクを貼り付け',
    pasteAria: 'リンクを貼り付け',
    go: '開く',
    notAnInvite: 'Tarot Twin の招待リンクではないようです。',
    shareText: (name: string) => `${name}さんからツインへの招待が届きました`,
  },
  scanner: {
    needsHttps: 'カメラを使うには、安全な（https）接続と対応ブラウザが必要です。',
    denied: 'カメラへのアクセスが拒否されました。ブラウザの設定でカメラを許可してください。',
    noCamera: 'この端末にはカメラが見つかりませんでした。',
    failed: 'カメラを起動できませんでした。',
  },
  reading: {
    invalidTitle: '無効なリンク',
    invalidTwin: 'このツインのリンクは無効です。',
    invalidInvite: 'この招待リンクは無効です。',
    selfTitle: 'あなた自身です',
    selfTwin: 'これはあなた自身のコードです。友達の招待リンクを開いてください。',
    selfInvite: 'これはあなた自身の招待リンクです。友達に送ってください。',
    notBondTitle: 'まだつながっていません',
    notBondBody: '「つながり」から招待リンクを共有するか、友達の招待リンクを開いてください。',
    joining: '参加しています…',
    bridge: 'ブリッジ',
    pairTitle: (me: string, friend: string) => `${me} & ${friend}`,
    /** 「タップしてあなた／Ada／ブリッジのカードを開く」 */
    tapToReveal: (who: string) => `タップして${who}のカードを開く`,
    revealYou: 'あなた',
    revealBridge: 'ブリッジ',
    nextIn: '次のリーディングまで',
  },
  dignity: {
    relation: { same: '強め合う', allied: '味方同士', opposed: '対立', neutral: '中立' } satisfies Record<Relation, string>,
    tone: { harmonious: '調和', challenging: '試練', balanced: '均衡' } satisfies Record<Tone, string>,
    withBridge: (name: string) => `${name} · ブリッジ`,
  },
  collection: {
    title: 'コレクション',
    allUnlocked: 'すべて解放済み',
    count: (n: number, total: number) => `${total}枚中${n}枚を解放`,
    filterAria: 'カードを絞り込む',
    unlocked: '解放済み',
    all: 'すべて',
    major: '大アルカナ',
    suits: { wands: 'ワンド', cups: 'カップ', swords: 'ソード', pentacles: 'ペンタクル' } satisfies Record<Suit, string>,
    emptyLocked: 'まだカードがありません。今日のカードやツインリーディングでカードを解放するか、未解放のカードを表示してみましょう。',
    noMatch: '該当するカードはありません。',
    owned: (n: number) => `${n}枚所持`,
  },
  bonds: {
    title: 'つながり',
    invite: '招待',
    empty: 'まだつながりがありません。友達を招待してはじめましょう。',
    last: (date: string) => `前回：${date}`,
    noReadings: 'まだリーディングはありません',
    streak: (n: number) => `${n}日連続`,
    streakAtRisk: (n: number) => `${n}日連続：今日占って記録をつなげましょう`,
    waiting: '同期待ち',
    readToday: '今日は占い済み',
    notYetToday: '今日はまだ',
  },
  bond: {
    notFound: '見つかりません',
    noReadings: 'まだリーディングはありません。',
    delete: '友達を削除',
    confirmDelete: (name: string) => `${name}さんと、すべてのツインリーディングを削除しますか？`,
  },
  oracle: {
    title: 'オラクル',
    intro: 'イエスかノーで答えられる質問を心に思い浮かべて、入力してください。3枚のカードが答えます。',
    placeholder: '〜するべき？',
    questionAria: 'あなたの質問',
    ask: 'カードに尋ねる',
    positions: ['過去', '現在', '未来'] as readonly string[],
    revealPositions: ['過去', '現在', '未来'] as readonly string[],
    tapToReveal: (pos: string) => `タップして${pos}のカードを開く`,
    reversed: '逆位置',
    reversedShort: '(逆)',
    verdict: { yes: 'イエス寄り', no: 'ノー寄り', maybe: '五分五分' } satisfies Record<Verdict, string>,
    shareImage: '画像で共有',
    share: '共有',
    askAgainIn: '次に占えるまで',
    journal: '記録',
    imageHeader: 'TAROT TWIN · オラクル',
    shareTitle: 'Tarot Twin オラクル',
  },
  shop: {
    title: 'ショップ',
    featured: { title: 'タロットカード', blurb: 'アプリの外でも占える、手に取れるデッキ。' },
    atmosphere: '雰囲気づくり',
    items: [
      { title: 'クリスタル', blurb: 'カードのそばに置きたい、小さなセット。' },
      { title: 'キャンドル', blurb: '占いの時間を照らす、やわらかな灯り。' },
      { title: 'お香', blurb: '問いかける前に、空気を清めて。' },
      { title: '祭壇トレイ', blurb: 'デッキと道具の置き場所に。' },
    ] as ReadonlyArray<{ title: string; blurb: string }>,
    viewOnAmazon: 'Amazonで見る',
    view: '見る',
    onAmazonAria: (title: string) => `Amazonの${title}`,
    comingSoon: '近日公開',
    associate: 'Amazonのアソシエイトとして、当サイトは適格販売により収入を得ています。',
  },
  settings: {
    title: '設定',
    language: '言語',
    yourName: 'あなたの名前',
    yourId: 'あなたのID',
    offline: 'オフライン',
    offlineReady: 'すべてのカードがこの端末に保存されています。',
    offlineSaving: (pct: number) => `カードを保存中… ${pct}%`,
    offlineError: '一部のカードを保存できませんでした。',
    offlineIdle: 'すべてのカードを保存して、通信がなくても使えるようにします。',
    installBody: 'Tarot Twin をホーム画面に追加すると、アプリのように開けて、オフラインでも使えます。',
    sync: '同期',
    syncBody: (total: number, connected: number) =>
      `名前とツインリーディングの日付は、${total}個の公開リレーを通じて友達と同期され、エンドツーエンドで暗号化されます。現在${connected}個に接続中です。`,
    debugInfo: 'デバッグ情報',
    danger: '危険な操作',
    dangerBody:
      'すべてのデータを削除すると、友達と履歴が消え、新しいIDが作られます。友達からは別の人として表示され、毎日のカードも変わります。この操作は取り消せません。',
    deleteAll: 'すべてのデータを削除／IDをリセット',
    confirmDeleteAll: 'すべてのデータを削除してIDをリセットしますか？この操作は取り消せません。',
  },
  banners: {
    newVersion: 'Tarot Twin の新しいバージョンが利用できます',
    reload: '再読み込み',
    savingOffline: (pct: number) => `オフライン用にカードを保存中… ${pct}%`,
    offlineFailed: 'オフライン用にすべてのカードを保存できませんでした',
    retry: '再試行',
    offlineReady: 'オフラインで使えます',
  },
}

// ---- the deck: [name, upright, keywords]

type Entry = readonly [upright: string, keywords: readonly string[]]

const MAJORS: ReadonlyArray<readonly [string, string, readonly string[]]> = [
  ['愚者', '新しい始まり、無邪気さ、信じて跳ぶ勇気。', ['新しい始まり', '無邪気さ', '信じて跳ぶ勇気']],
  ['魔術師', '意志の力、才能、思いを形にする行動力。', ['意志の力', '才能', '思いを形にする行動力']],
  ['女教皇', '直感、神秘、内なる知恵。', ['直感', '神秘', '内なる知恵']],
  ['女帝', '慈しみ、豊かさ、創造的な成長。', ['慈しみ', '豊かさ', '創造的な成長']],
  ['皇帝', '秩序、権威、揺るぎない統率力。', ['秩序', '権威', '揺るぎない統率力']],
  ['教皇', '伝統、共通の価値観、導き。', ['伝統', '共通の価値観', '導き']],
  ['恋人', '結びつき、調和、意味のある選択。', ['結びつき', '調和', '意味のある選択']],
  ['戦車', '推進力、決意、集中がもたらす勝利。', ['推進力', '決意', '集中がもたらす勝利']],
  ['力', '勇気、忍耐、やさしい内なる強さ。', ['勇気', '忍耐', 'やさしい内なる強さ']],
  ['隠者', '孤独、内省、内に灯る導きの光。', ['孤独', '内省', '内に灯る導きの光']],
  ['運命の輪', '運命の巡り、幸運、人生の転機。', ['運命の巡り', '幸運', '人生の転機']],
  ['正義', '公正さ、真実、自らの行いへの責任。', ['公正さ', '真実', '自らの行いへの責任']],
  ['吊された男', '手放すこと、新たな視点、立ち止まる時間。', ['手放すこと', '新たな視点', '立ち止まる時間']],
  ['死神', '終わり、変容、次への道を拓く浄化。', ['終わり', '変容', '次への道を拓く浄化']],
  ['節制', 'バランス、節度、相反するものの融合。', ['バランス', '節度', '相反するものの融合']],
  ['悪魔', '執着、誘惑、心の影に潜む癖。', ['執着', '誘惑', '心の影に潜む癖']],
  ['塔', '突然の変化、激動、啓示。', ['突然の変化', '激動', '啓示']],
  ['星', '希望、再生、静かなひらめき。', ['希望', '再生', '静かなひらめき']],
  ['月', '幻想、夢、心の奥の潜在意識。', ['幻想', '夢', '心の奥の潜在意識']],
  ['太陽', '喜び、生命力、明晰さ、成功。', ['喜び', '生命力', '明晰さ', '成功']],
  ['審判', '目覚め、清算、使命の呼び声に応えること。', ['目覚め', '清算', '使命の呼び声']],
  ['世界', '完成、調和のとれた全体、巡りの成就。', ['完成', '調和のとれた全体', '巡りの成就']],
]

/** Index 0 = Ace … 9 = Ten, 10 = Page, 11 = Knight, 12 = Queen, 13 = King */
const MINOR_MEANINGS: Record<Suit, readonly Entry[]> = {
  wands: [
    ['ひらめきの火花、大胆な新しいエネルギー。', ['ひらめきの火花', '大胆な新しいエネルギー']],
    ['計画、選択、地平の先への眼差し。', ['計画', '選択', '地平の先への眼差し']],
    ['拡大、先見の明、船の帰りを待つ時。', ['拡大', '先見の明', '船の帰りを待つ時']],
    ['祝福、帰郷、安定した喜び。', ['祝福', '帰郷', '安定した喜び']],
    ['張り合い、競争、あちこちで起こる衝突。', ['張り合い', '競争', '小さな衝突']],
    ['勝利、称賛、人前での成功。', ['勝利', '称賛', '人前での成功']],
    ['決意を持って、自分の立場を守ること。', ['決意', '立場を守る強さ']],
    ['素早い動き、知らせ、急速な進展。', ['素早い動き', '知らせ', '急速な進展']],
    ['回復力、粘り強さ、最後のひと押し。', ['回復力', '粘り強さ', '最後のひと押し']],
    ['重荷、責任の抱え込み、背負いすぎ。', ['重荷', '責任の抱え込み', '背負いすぎ']],
    ['新鮮な発想を持つ、熱心な探求者。', ['探求心', '新鮮な発想']],
    ['情熱、冒険心、衝動的な追求。', ['情熱', '冒険心', '衝動的な追求']],
    ['温かさ、自信、人を惹きつける統率力。', ['温かさ', '自信', '人を惹きつける統率力']],
    ['先見性、大胆な指導力、カリスマ性。', ['先見性', '大胆な指導力', 'カリスマ性']],
  ],
  cups: [
    ['新しい感情、愛、開かれた心。', ['新しい感情', '愛', '開かれた心']],
    ['惹かれ合う心、パートナーシップ、つながり。', ['惹かれ合う心', 'パートナーシップ', 'つながり']],
    ['友情、祝福、分かち合う喜び。', ['友情', '祝福', '分かち合う喜び']],
    ['無気力、熟考、誘いの見直し。', ['無気力', '熟考', '誘いの見直し']],
    ['喪失、後悔、過ぎたものへの悲しみ。', ['喪失', '後悔', '過ぎたものへの悲しみ']],
    ['懐かしさ、子どもの頃の思い出、優しさ。', ['懐かしさ', '子どもの頃の思い出', '優しさ']],
    ['空想、願望、たくさんの選択肢。', ['空想', '願望', 'たくさんの選択肢']],
    ['より深いものを求めて、立ち去ること。', ['旅立ち', 'より深いものへの探求']],
    ['満足、叶う願い、心の充足。', ['満足', '叶う願い', '心の充足']],
    ['調和、家族、続いていく幸せ。', ['調和', '家族', '続いていく幸せ']],
    ['創造や恋の知らせを運ぶ、優しい使者。', ['優しい使者', '創造の知らせ', '恋の便り']],
    ['ロマンス、魅力、心に従う生き方。', ['ロマンス', '魅力', '心に従う生き方']],
    ['思いやり、直感、感情の知恵。', ['思いやり', '直感', '感情の知恵']],
    ['感情のバランス、外交力、穏やかな寛大さ。', ['感情のバランス', '外交力', '穏やかな寛大さ']],
  ],
  swords: [
    ['明晰さ、突破口、明かされる真実。', ['明晰さ', '突破口', '明かされる真実']],
    ['膠着、難しい選択、目を背けた真実。', ['膠着', '難しい選択', '目を背けた真実']],
    ['失恋、悲しみ、痛みを伴う正直さ。', ['失恋', '悲しみ', '痛みを伴う正直さ']],
    ['休息、回復、静かな熟考。', ['休息', '回復', '静かな熟考']],
    ['争い、むなしい勝利、緊張。', ['争い', 'むなしい勝利', '緊張']],
    ['前進、移行、穏やかな水面への旅。', ['前進', '移行', '穏やかな水面への旅']],
    ['戦略、秘密、ひとりでの行動。', ['戦略', '秘密', 'ひとりでの行動']],
    ['制約、自己不信、閉じ込められた感覚。', ['制約', '自己不信', '閉じ込められた感覚']],
    ['不安、心配、眠れない夜。', ['不安', '心配', '眠れない夜']],
    ['痛みを伴う終わり、どん底、解放。', ['痛みを伴う終わり', 'どん底', '解放']],
    ['好奇心、注意深さ、学ぶ意欲。', ['好奇心', '注意深さ', '学ぶ意欲']],
    ['素早さ、率直さ、考えに突き動かされる力。', ['素早さ', '率直さ', '考えに突き動かされる力']],
    ['洞察力、自立心、曇りのない眼差し。', ['洞察力', '自立心', '曇りのない眼差し']],
    ['知性、権威、公正な判断。', ['知性', '権威', '公正な判断']],
  ],
  pentacles: [
    ['新たな好機、繁栄、地に足のついた始まり。', ['新たな好機', '繁栄', '地に足のついた始まり']],
    ['優先順位のやりくり、変化への適応。', ['やりくり', '変化への適応']],
    ['チームワーク、職人技、共に築くもの。', ['チームワーク', '職人技', '共に築くもの']],
    ['安定、貯蓄、しっかりと抱え込むこと。', ['安定', '貯蓄', '抱え込む心']],
    ['苦難、欠乏、寒空に取り残される思い。', ['苦難', '欠乏', '取り残される思い']],
    ['寛大さ、与え受け取ること、支え合い。', ['寛大さ', '与え受け取る循環', '支え合い']],
    ['忍耐、長期的な投資、収穫を待つ時。', ['忍耐', '長期的な投資', '収穫を待つ時']],
    ['勤勉、熟達、ひたむきな修練。', ['勤勉', '熟達', 'ひたむきな修練']],
    ['自立、豊かさ、努力で得たくつろぎ。', ['自立', '豊かさ', '努力で得たくつろぎ']],
    ['遺産、家族の富、続いていく安心。', ['遺産', '家族の富', '続いていく安心']],
    ['勉強熱心さ、実践力、新しい技への意欲。', ['勉強熱心さ', '実践力', '新しい技への意欲']],
    ['信頼、几帳面さ、着実な努力。', ['信頼', '几帳面さ', '着実な努力']],
    ['育む力、実践力、知恵ある豊かさ。', ['育む力', '実践力', '知恵ある豊かさ']],
    ['繁栄、頼もしさ、気前のよい支え。', ['繁栄', '頼もしさ', '気前のよい支え']],
  ],
}

const RANKS = ['エース', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'ペイジ', 'ナイト', 'クイーン', 'キング']
const SUIT_NAME: Record<Suit, string> = { wands: 'ワンド', cups: 'カップ', swords: 'ソード', pentacles: 'ペンタクル' }

export const deck: DeckText = {
  majors: MAJORS.map(([n, u, k]): CardText => [n, u, k]),
  minors: Object.fromEntries(
    (Object.keys(MINOR_MEANINGS) as Suit[]).map((s) => [
      s,
      MINOR_MEANINGS[s].map(([u, k], i): CardText => [`${SUIT_NAME[s]}の${RANKS[i]}`, u, k]),
    ]),
  ) as unknown as Record<Suit, readonly CardText[]>,
}

// ---- prose

const q = (name: string) => `「${name}」`

const ELEMENT_NAME: Record<Element, string> = { fire: '火', water: '水', air: '風', earth: '地' }

const LEAD_TWIN = ['新しい縁が始まる今、', 'ふたりのリズムが生まれつつある今、', 'ふたりのリズムが育ってきた今、', 'ふたりの間に深いリズムが刻まれた今、']
const LEAD_DAILY = ['今日は、', 'リズムが生まれつつある今、', 'リズムが育ってきた今、', 'すっかり馴染んだリズムの中で、']

const REL: Record<Relation, readonly string[]> = {
  same: ['{a}と{a}が響き合い、その力は倍になります', 'ひとつの{a}の流れが、ふたりを貫いています'],
  allied: ['{a}と{b}が、互いを育て合います', '{a}が{b}に息吹を与えます'],
  opposed: ['{a}と{b}が、互いに引っ張り合います', '{a}と{b}がぶつかり、火花を散らします'],
  neutral: ['{a}と{b}が、波風を立てずに出会います', '{a}と{b}は、ほどよい距離を保っています'],
}
const fill = (t: string, a: Element, b: Element) =>
  t.replace(/\{a\}/g, ELEMENT_NAME[a]).replace(/\{b\}/g, ELEMENT_NAME[b])

const TONE: Record<Tone, readonly string[]> = {
  harmonious: ['ふたりに追い風が吹いています', 'ふたり一緒なら、阻むものはほとんどありません', '並んで始めたことは、きっと長く続きます'],
  challenging: ['すれ違いこそが、今日のふたりの先生です', '心地よさよりも、誠実さが大切です', 'そっと歩み、いつもより耳を傾けましょう'],
  balanced: ['今日の流れは、ふたりの心の傾き次第です', 'どちらかが先を行くことはないので、ふたりで選びましょう', '丁寧に向き合うことが、鍵になります'],
}

const ELEMENT_DAILY: Record<Element, readonly string[]> = {
  fire: ['心の火が温かいうちに動きましょう', '勇気に先導してもらいましょう'],
  water: ['気持ちに導かれて歩みましょう', '水面の下に感じるものを信じましょう'],
  air: ['思いを素直に言葉にしましょう', '澄んだアイデアを羽ばたかせましょう'],
  earth: ['小さくても長く続くものを築きましょう', 'しっかりとした大地に足をつけましょう'],
}

const LEAD = ['背後には', '目の前には', 'その先には']
const TURN: Record<'up' | 'down', readonly string[]> = {
  up: ['{n}が{k}を授けています', '{n}が{k}を差し出しています', '{n}が{k}を運んでいます'],
  down: ['逆さまの{n}が、{k}を曇らせています', '逆位置の{n}が、{k}を手の届かない所に留めています', 'ひっくり返った{n}が、{k}を内側へ閉じ込めています'],
}
const CLOSE: Record<Verdict, readonly string[]> = {
  yes: ['兆しは「イエス」に傾いています。', 'ベールが開き、答えは「イエス」へと向かいます。', '星々はあなたに微笑んでいます。'],
  no: ['兆しは「ノー」に傾いています。', 'ベールは閉じたまま、答えは「ノー」へと向かいます。', '星々は顔を背けています。'],
  maybe: ['兆しはまだ定まりません。', 'ベールは揺れ、答えはまだ書かれていません。', '星々は息をひそめています。'],
}

export const prose: ProseKit = {
  daily(card, bucket: Bucket, pick) {
    const k1 = pick(card.keywords)
    const k2 = pick(card.keywords.filter((k) => k !== k1).concat(k1))
    const s1 = k1 === k2 ? `${q(card.name)}は${k1}をもたらします。` : `${q(card.name)}は${k1}と${k2}をもたらします。`
    return `${s1}${LEAD_DAILY[bucket]}${pick(ELEMENT_DAILY[card.element])}。`
  },
  twin({ a, b, bridge, rel, tone, bucket }, pick) {
    const ka = pick(a.keywords), kb = pick(b.keywords), kg = pick(bridge.keywords)
    const pair = ka === kb ? `${ka}が重なります` : `${ka}と${kb}が寄り添います`
    const s1 = `${q(a.name)}と${q(b.name)}が出会い、${pair}。${fill(pick(REL[rel]), a.element, b.element)}。`
    const s2 = pick([
      `${q(bridge.name)}がふたりの間に橋を架け、${kg}を差し出します。`,
      `ふたりの間に立つのは${q(bridge.name)}。${kg}の架け橋です。`,
      `${q(bridge.name)}がふたりを結び、${kg}を運びます。`,
    ])
    return `${s1}${s2}${LEAD_TWIN[bucket]}${pick(TONE[tone])}。`
  },
  oracle(cards, verdict, pick) {
    const parts = cards.map((d, i) => {
      const tpl = pick(TURN[d.reversed ? 'down' : 'up'])
      const k = pick(d.card.keywords)
      const t = tpl.replace('{n}', () => q(d.card.name)).replace('{k}', () => k)
      return `${LEAD[i]}${t}。`
    })
    return `${parts.join('')}${pick(CLOSE[verdict])}`
  },
}

export const ja: Locale = { tag: 'ja', native: '日本語', ui, deck, prose }
