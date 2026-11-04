import type { Element, Suit } from '../data/cards'
import type { Relation, Tone } from '../lib/dignity'
import type { Verdict } from '../lib/oracle'
import type { Messages } from './en'
import type { Bucket, CardText, DeckText, Locale, ProseKit } from './types'

/** Korean (한국어), in 해요체. */

// ---- particles

/** Whether a digit's Korean reading (영 일 이 삼 사 오 육 칠 팔 구) ends in a batchim, and whether that batchim is ㄹ. */
const DIGIT_BATCHIM = [true, true, false, true, false, false, true, true, true, false]
const DIGIT_RIEUL = [false, true, false, false, false, false, false, true, true, false]

/** 'none' | 'batchim' | 'rieul' (ㄹ batchim), or null when it cannot be told. */
function finalSound(word: string): 'none' | 'batchim' | 'rieul' | null {
  const w = word.replace(/[\s.,!?·…'"’”)\]}>~-]+$/u, '')
  const ch = w.slice(-1)
  if (!ch) return null
  const code = ch.charCodeAt(0)
  if (code >= 0xac00 && code <= 0xd7a3) {
    const jong = (code - 0xac00) % 28
    return jong === 0 ? 'none' : jong === 8 ? 'rieul' : 'batchim'
  }
  if (/[0-9]/.test(ch)) {
    const d = Number(ch)
    return DIGIT_RIEUL[d] ? 'rieul' : DIGIT_BATCHIM[d] ? 'batchim' : 'none'
  }
  if (/[a-z]/i.test(ch)) {
    // a rough guess at how a Latin name is read in Korean: Paul → 폴, Tom → 톰, Ann → 앤, but Ada → 에이다, Mark → 마크
    const l = w.toLowerCase()
    if (l.endsWith('l')) return 'rieul'
    if (/(m|n|ng)$/.test(l)) return 'batchim'
    return 'none'
  }
  return null
}

/**
 * The particle form that fits `word`: josa('지민', '이', '가') → '이', josa('Ada', '이', '가') → '가'.
 * For 으로/로, a ㄹ batchim takes 로. When the sound cannot be told, both forms: 이(가), (으)로.
 */
export function josa(word: string, withBatchim: string, without: string): string {
  const s = finalSound(word)
  if (s === null) {
    return withBatchim.endsWith(without) ? `(${withBatchim.slice(0, -without.length)})${without}` : `${withBatchim}(${without})`
  }
  if (s === 'none') return without
  if (s === 'rieul' && without === '로') return without
  return withBatchim
}

const iga = (w: string) => w + josa(w, '이', '가')
const eunneun = (w: string) => w + josa(w, '은', '는')
const eulreul = (w: string) => w + josa(w, '을', '를')
const gwawa = (w: string) => w + josa(w, '과', '와')

// ---- ui

const ui: Messages = {
  meta: {
    title: 'Tarot Twin 타로 트윈 – 무료 오늘의 타로, 예스노 타로, 커플 타로 궁합',
    description: 'Tarot Twin(타로 트윈)에서 무료 오늘의 타로 카드 운세와 예스노 타로를 보고, 친구나 연인과 함께 보는 트윈 타로 리딩으로 두 사람의 궁합을 확인해 보세요.',
  },
  common: {
    back: '뒤로',
    copy: '복사',
    copied: '복사했어요',
    couldNotCopy: '복사하지 못했어요',
    save: '저장',
    install: '설치',
    gotIt: '알겠어요',
    you: '나',
    friend: '친구',
    stranger: '낯선 사람',
  },
  nav: {
    aria: '메인',
    daily: '오늘',
    oracle: '오라클',
    bonds: '인연',
    cards: '카드',
    shop: '샵',
    settings: '설정',
  },
  topbar: {
    homeAria: 'Tarot Twin, 홈',
    installTitle: 'Tarot Twin 설치하기',
  },
  install: {
    ios: 'Safari 도구 막대에서 공유 버튼을 누른 뒤 “홈 화면에 추가”를 선택하세요.',
    android: 'Firefox 메뉴(⋮)를 열고 “홈 화면에 앱 추가” 또는 “설치”를 누르세요.',
    mac: 'Safari 메뉴 막대에서 파일 › Dock에 추가를 선택하세요.',
  },
  onboarding: {
    tagline: '하루 한 장의 카드. 둘이 함께 보는 트윈 리딩.',
    namePlaceholder: '이름',
    begin: '시작하기',
  },
  card: {
    inspectAria: (name: string) => `${name}. 탭해서 자세히 보기`,
    faceDownAria: (label?: string) => (label ? `${label}의 뒤집힌 카드. 탭해서 펼치기` : '뒤집힌 카드. 탭해서 펼치기'),
    rarity: { COMMON: '일반', HOLO: '홀로', GOLD: '골드', GALAXY: '갤럭시' },
    rarityAria: '희귀도',
  },
  home: {
    title: '오늘의 카드',
    tapToReveal: '카드를 탭해서 펼쳐 보세요',
    newCardIn: '새 카드까지',
  },
  twinReadings: {
    title: '트윈 리딩',
    emptyBefore: '',
    emptyAfter: '에서 친구를 초대해 함께 리딩해 보세요.',
    nextIn: '다음 리딩까지',
    ready: '리딩할 수 있어요',
  },
  twin: {
    title: '트윈',
    intro: '트윈 리딩은 나의 오늘의 카드와 친구의 카드를 짝지어 브릿지 카드 한 장을 더해 줘요.',
    tabInvite: '초대',
    tabScan: '스캔',
    qrHint: '친구에게 이 코드를 스캔하거나 링크를 열어 달라고 하세요.',
    shareLink: '링크 공유',
    copyLink: '링크 복사',
    pastePlaceholder: '또는 링크 붙여넣기',
    pasteAria: '링크 붙여넣기',
    go: '열기',
    notAnInvite: 'Tarot Twin 초대 링크가 아닌 것 같아요.',
    shareText: (name: string) => `${iga(name)} 트윈이 되자고 초대했어요`,
  },
  scanner: {
    needsHttps: '카메라를 쓰려면 보안(https) 연결과 지원되는 브라우저가 필요해요.',
    denied: '카메라 권한이 거부됐어요. 브라우저 설정에서 카메라 접근을 허용해 주세요.',
    noCamera: '이 기기에서 카메라를 찾을 수 없어요.',
    failed: '카메라를 시작하지 못했어요.',
  },
  reading: {
    invalidTitle: '잘못된 링크',
    invalidTwin: '올바른 트윈 링크가 아니에요.',
    invalidInvite: '올바른 초대 링크가 아니에요.',
    selfTitle: '나 자신이에요',
    selfTwin: '내 코드예요. 대신 친구의 초대 링크를 열어 보세요.',
    selfInvite: '내 초대 링크예요. 친구에게 보내 주세요.',
    notBondTitle: '아직 인연이 아니에요',
    notBondBody: '인연 탭에서 초대 링크를 공유하거나, 친구의 초대 링크를 열어 보세요.',
    joining: '연결하는 중…',
    bridge: '브릿지',
    pairTitle: (me: string, friend: string) => `${me} & ${friend}`,
    tapToReveal: (who: string) => `탭해서 펼치기: ${who}`,
    revealYou: '나',
    revealBridge: '브릿지 카드',
    nextIn: '다음 리딩까지',
  },
  dignity: {
    relation: { same: '강화', allied: '조화', opposed: '대립', neutral: '중립' } satisfies Record<Relation, string>,
    tone: { harmonious: '순조로움', challenging: '시험의 날', balanced: '균형' } satisfies Record<Tone, string>,
    withBridge: (name: string) => `${name} · 브릿지`,
  },
  collection: {
    title: '컬렉션',
    allUnlocked: '모두 획득',
    count: (n: number, total: number) => `${total}장 중 ${n}장 획득`,
    filterAria: '카드 필터',
    unlocked: '획득',
    all: '전체',
    major: '메이저',
    suits: { wands: '완드', cups: '컵', swords: '소드', pentacles: '펜타클' } satisfies Record<Suit, string>,
    emptyLocked: '아직 아무것도 없어요. 오늘의 카드나 트윈 리딩으로 카드를 모으거나, 잠긴 카드를 보여 달라고 해 보세요.',
    noMatch: '맞는 카드가 없어요.',
    owned: (n: number) => `${n}장 보유`,
  },
  bonds: {
    title: '인연',
    invite: '초대',
    empty: '아직 인연이 없어요. 친구를 초대해 인연을 시작해 보세요.',
    last: (date: string) => `최근 ${date}`,
    noReadings: '아직 리딩이 없어요',
    streak: (n: number) => `${n}일 연속`,
    streakAtRisk: (n: number) => `${n}일 연속: 오늘 리딩해야 이어져요`,
    waiting: '동기화 대기 중',
    readToday: '오늘 리딩 완료',
    notYetToday: '오늘은 아직',
  },
  bond: {
    notFound: '찾을 수 없어요',
    noReadings: '아직 리딩이 없어요.',
    delete: '친구 삭제',
    confirmDelete: (name: string) => `${gwawa(name)} 함께한 트윈 리딩을 모두 삭제할까요?`,
  },
  oracle: {
    title: '오라클',
    intro: '예 또는 아니오로 답할 수 있는 질문을 떠올리고 적어 보세요. 세 장의 카드가 답해 줄 거예요.',
    placeholder: '제가 …해도 될까요?',
    questionAria: '나의 질문',
    ask: '카드에게 묻기',
    positions: ['과거', '현재', '미래'] as readonly string[],
    revealPositions: ['과거', '현재', '미래'] as readonly string[],
    tapToReveal: (pos: string) => `탭해서 펼치기: ${pos}`,
    reversed: '역방향',
    reversedShort: '(역)',
    verdict: { yes: '아마도 예', no: '아마도 아니오', maybe: '글쎄요' } satisfies Record<Verdict, string>,
    shareImage: '이미지로 공유',
    share: '공유',
    askAgainIn: '다시 묻기까지',
    journal: '기록',
    imageHeader: 'TAROT TWIN · 오라클',
    shareTitle: 'Tarot Twin 오라클',
  },
  shop: {
    title: '샵',
    featured: { title: '타로 카드 덱', blurb: '앱 밖에서도 리딩할 수 있는 실물 카드 덱이에요.' },
    atmosphere: '분위기',
    items: [
      { title: '크리스털', blurb: '카드 곁에 두기 좋은 작은 크리스털 세트.' },
      { title: '캔들', blurb: '리딩을 위한 은은한 불빛.' },
      { title: '인센스', blurb: '질문하기 전에 공기를 맑게 해 줘요.' },
      { title: '제단 트레이', blurb: '덱과 도구를 올려 둘 나만의 자리.' },
    ] as ReadonlyArray<{ title: string; blurb: string }>,
    viewOnAmazon: '아마존에서 보기',
    view: '보기',
    onAmazonAria: (title: string) => `아마존의 ${title}`,
    comingSoon: '곧 만나요',
    associate: '아마존 어소시에이트로서 저는 자격 요건을 충족하는 구매로부터 수익을 얻습니다.',
  },
  settings: {
    title: '설정',
    language: '언어',
    yourName: '내 이름',
    yourId: '내 ID',
    offline: '오프라인',
    offlineReady: '모든 카드가 이 기기에 저장돼 있어요.',
    offlineSaving: (pct: number) => `카드 저장 중… ${pct}%`,
    offlineError: '일부 카드를 저장하지 못했어요.',
    offlineIdle: '모든 카드를 저장하면 인터넷 연결 없이도 앱을 쓸 수 있어요.',
    installBody: 'Tarot Twin을 홈 화면에 추가하면 오프라인에서도 앱처럼 열 수 있어요.',
    sync: '동기화',
    syncBody: (total: number, connected: number) =>
      `이름과 트윈 리딩 날짜는 공개 릴레이 ${total}곳을 통해 친구와 동기화되며, 종단 간 암호화돼요. 현재 ${connected}곳에 연결됨.`,
    debugInfo: '디버그 정보',
    danger: '위험 구역',
    dangerBody: '모든 데이터를 삭제하면 친구와 기록이 사라지고 새 ID가 만들어져요. 친구에게는 새로운 사람으로 보이고, 오늘의 카드도 바뀌어요. 되돌릴 수 없어요.',
    deleteAll: '모든 데이터 삭제 / ID 초기화',
    confirmDeleteAll: '모든 데이터를 삭제하고 ID를 초기화할까요? 되돌릴 수 없어요.',
  },
  banners: {
    newVersion: 'Tarot Twin 새 버전이 준비됐어요',
    reload: '새로고침',
    savingOffline: (pct: number) => `오프라인용 카드 저장 중… ${pct}%`,
    offlineFailed: '오프라인용 카드를 모두 저장하지 못했어요',
    retry: '다시 시도',
    offlineReady: '오프라인에서 쓸 준비가 됐어요',
  },
}

// ---- the deck

/** [name, upright] or [name, upright, keywords]; by default the keywords are the meaning's comma-separated phrases. */
type Raw = readonly [string, string] | readonly [string, string, readonly string[]]

const MAJORS: readonly Raw[] = [
  ['바보', '새로운 시작, 순수함, 믿음의 도약.'],
  ['마법사', '의지력, 재능, 뜻을 행동으로 옮기는 힘.'],
  ['여사제', '직관, 신비, 마음 깊은 곳의 앎.'],
  ['여황제', '보살핌, 풍요, 창조적인 성장.'],
  ['황제', '질서, 권위, 흔들림 없는 리더십.'],
  ['교황', '전통, 함께 나누는 가치, 가르침.'],
  ['연인', '결합, 조화, 의미 있는 선택.'],
  ['전차', '추진력, 결단력, 집중으로 얻는 승리.'],
  ['힘', '용기, 인내, 부드러운 내면의 힘.'],
  ['은둔자', '고독, 성찰, 내면을 비추는 빛.'],
  ['운명의 수레바퀴', '순환, 행운, 삶의 전환점.'],
  ['정의', '공정함, 진실, 선택에 대한 책임.'],
  ['매달린 사람', '내려놓음, 새로운 관점, 잠시 멈춤.'],
  ['죽음', '끝맺음, 변화, 새 길을 여는 정리.'],
  ['절제', '균형, 중용, 상반된 것의 조화.'],
  ['악마', '집착, 유혹, 벗어나기 힘든 굴레.'],
  ['탑', '갑작스러운 변화, 격변, 깨달음.'],
  ['별', '희망, 회복, 조용한 영감.'],
  ['달', '환상, 꿈, 무의식의 세계.'],
  ['태양', '기쁨, 활력, 빛나는 성공.'],
  ['심판', '각성, 지난날의 정산, 부름에 대한 응답.'],
  ['세계', '완성, 온전함, 한 순환의 마무리.'],
]

const MINOR_MEANINGS: Record<Suit, readonly Raw[]> = {
  wands: [
    ['', '영감의 불꽃과 대담한 새 에너지.', ['영감의 불꽃', '대담한 새 에너지']],
    ['', '계획, 선택, 지평선 너머를 보는 눈.'],
    ['', '확장, 선견지명, 기다리던 결실.'],
    ['', '축하, 반가운 귀향, 안정된 기쁨.'],
    ['', '라이벌 의식, 경쟁, 어수선한 갈등.'],
    ['', '승리, 인정, 모두가 아는 성공.'],
    ['', '굳은 의지로 자리를 지키는 힘.', ['굳은 의지', '자리를 지키는 힘']],
    ['', '빠른 움직임, 소식, 급속한 진전.'],
    ['', '회복력, 끈기, 마지막 한 걸음.'],
    ['', '무거운 짐, 과도한 책임, 버거움.'],
    ['', '열정적인 탐험심, 창의적인 아이디어.'],
    ['', '열정, 모험심, 충동적인 추진력.'],
    ['', '따뜻함, 자신감, 끌어당기는 리더십.'],
    ['', '비전, 대담한 리더십, 카리스마.'],
  ],
  cups: [
    ['', '새로운 감정, 사랑, 열린 마음.'],
    ['', '서로를 향한 끌림, 동반자 관계, 깊은 연결.'],
    ['', '우정, 축하, 함께 나누는 기쁨.'],
    ['', '무관심, 깊은 생각, 제안의 재검토.'],
    ['', '상실, 후회, 지나간 것에 대한 슬픔.'],
    ['', '향수, 어린 시절의 기억, 다정함.'],
    ['', '환상, 희망 사항, 너무 많은 선택지.'],
    ['', '떠남, 더 깊은 의미를 향한 여정.'],
    ['', '만족, 이루어진 소원, 감정의 충족.'],
    ['', '조화, 가족, 오래가는 행복.'],
    ['', '다정한 전령, 창의적인 소식, 설레는 연락.'],
    ['', '로맨스, 매력, 마음을 따르는 용기.'],
    ['', '연민, 직관, 감정의 지혜.'],
    ['', '감정의 균형, 외교력, 차분한 너그러움.'],
  ],
  swords: [
    ['', '명료함, 돌파구, 드러나는 진실.'],
    ['', '교착 상태, 어려운 선택, 외면한 진실.'],
    ['', '상심, 슬픔, 아픈 솔직함.'],
    ['', '휴식, 회복, 조용한 숙고.'],
    ['', '갈등, 공허한 승리, 팽팽한 긴장.'],
    ['', '떠나보냄, 전환, 한결 잔잔해진 물결.'],
    ['', '전략, 비밀, 홀로 하는 행동.'],
    ['', '제약, 자기 의심, 갇힌 듯한 느낌.'],
    ['', '불안, 걱정, 잠 못 드는 밤.'],
    ['', '고통스러운 끝, 밑바닥, 마침내 찾아온 해방.'],
    ['', '호기심, 경계심, 배움에 대한 열정.'],
    ['', '거침없는 속도, 솔직함, 생각이 이끄는 추진력.'],
    ['', '통찰력, 독립심, 흐림 없는 시선.'],
    ['', '지성, 권위, 공정한 판단.'],
  ],
  pentacles: [
    ['', '새로운 기회, 번영, 탄탄한 시작.'],
    ['', '우선순위 조율과 변화에 대한 적응.', ['우선순위 조율', '변화에 대한 적응']],
    ['', '팀워크, 솜씨, 함께 쌓아 올리는 결실.'],
    ['', '안정, 저축, 꽉 움켜쥔 손.'],
    ['', '고난, 결핍, 차가운 소외감.'],
    ['', '너그러움, 주고받음, 따뜻한 도움.'],
    ['', '인내, 장기적 투자, 수확을 기다리는 마음.'],
    ['', '성실함, 숙련, 꾸준한 연습.'],
    ['', '자립, 여유로운 풍요, 노력으로 얻은 안락.'],
    ['', '유산, 가족의 부, 오래가는 안정.'],
    ['', '배움의 열의, 실용성, 새로운 기술.'],
    ['', '믿음직함, 꼼꼼함, 꾸준한 노력.'],
    ['', '보살핌, 실용성, 지혜로운 풍요.'],
    ['', '번영, 든든한 신뢰, 너그러운 베풂.'],
  ],
}

const RANKS = ['에이스', '2', '3', '4', '5', '6', '7', '8', '9', '10', '페이지', '나이트', '퀸', '킹']
const SUIT_NAME: Record<Suit, string> = { wands: '완드', cups: '컵', swords: '소드', pentacles: '펜타클' }

const kw = (upright: string) => upright.replace(/\.$/, '').split(/,\s*/)
const text = ([name, upright, keywords]: Raw, nameOverride?: string): CardText => [nameOverride ?? name, upright, keywords ?? kw(upright)]

export const deck: DeckText = {
  majors: MAJORS.map((r) => text(r)),
  minors: Object.fromEntries(
    (Object.keys(MINOR_MEANINGS) as Suit[]).map((s) => [s, MINOR_MEANINGS[s].map((r, i) => text(r, `${SUIT_NAME[s]} ${RANKS[i]}`))]),
  ) as unknown as Record<Suit, readonly CardText[]>,
}

// ---- prose

const ELEMENT: Record<Element, string> = { fire: '불', water: '물', air: '바람', earth: '흙' }

const LEAD_TWIN = ['새로운 인연이 시작되는 지금,', '두 사람의 리듬이 자리 잡아 가는 지금,', '두 사람의 리듬이 점점 깊어지는 지금,', '이토록 깊은 리듬을 함께 쌓아 온 두 사람이니,']
const LEAD_DAILY = ['오늘은', '리듬이 자리 잡아 가는 지금,', '리듬이 점점 깊어지는 지금,', '이렇게 몸에 밴 리듬 속에서,']

type Fill = (a: string, b: string) => string
const REL: Record<Relation, readonly Fill[]> = {
  same: [(a) => `${iga(a)} ${a}에 화답하며 그 힘이 두 배가 돼요`, (a) => `하나의 ${a} 기운이 두 사람 모두에게 흘러요`],
  allied: [(a, b) => `${gwawa(a)} ${iga(b)} 서로를 북돋아요`, (a, b) => `${iga(a)} ${b}에 숨결을 불어넣어요`],
  opposed: [(a, b) => `${gwawa(a)} ${iga(b)} 서로 반대쪽으로 잡아당겨요`, (a, b) => `${gwawa(a)} ${iga(b)} 부딪히며 불꽃을 튀겨요`],
  neutral: [(a, b) => `${gwawa(a)} ${iga(b)} 부딪힘 없이 만나요`, (a, b) => `${gwawa(a)} ${iga(b)} 예의 바른 거리를 지켜요`],
}

const TONE: Record<Tone, readonly string[]> = {
  harmonious: ['하루의 운이 두 사람 모두에게 따라요', '함께라면 막아설 것이 거의 없어요', '나란히 시작한 일은 오래 이어질 거예요'],
  challenging: ['마찰이 오늘의 스승이 되어 줄 거예요', '편안함보다 솔직함이 더 중요해요', '조심스럽게 다가가고, 한 번 더 귀 기울이세요'],
  balanced: ['흐름은 두 사람이 마음을 기울이는 쪽으로 흘러가요', '어느 쪽도 앞서지 않으니 함께 선택하세요', '꾸준한 관심이 결과를 정할 거예요'],
}

const ELEMENT_DAILY: Record<Element, readonly string[]> = {
  fire: ['불꽃이 따뜻할 때 행동으로 옮겨 보세요', '용기가 앞장서도록 맡겨 보세요'],
  water: ['마음이 이끄는 대로 걸어 보세요', '수면 아래에서 느껴지는 것을 믿어 보세요'],
  air: ['생각을 솔직하고 분명하게 말해 보세요', '맑은 생각 하나를 훨훨 날려 보세요'],
  earth: ['작지만 오래가는 무언가를 쌓아 보세요', '단단한 땅에 두 발을 딛고 서 보세요'],
}

const LEAD = ['지나온 길에서는', '지금 이 순간에는', '다가올 날에는']
type Turn = (n: string, k: string) => string
const TURN: Record<'up' | 'down', readonly Turn[]> = {
  up: [(n, k) => `${iga(n)} ${eulreul(k)} 건네요`, (n, k) => `${iga(n)} ${eulreul(k)} 내어 줘요`, (n, k) => `${iga(n)} ${eulreul(k)} 품고 있어요`],
  down: [
    (n, k) => `뒤집힌 ${iga(n)} ${eulreul(k)} 흐리게 해요`,
    (n, k) => `역방향의 ${iga(n)} ${eulreul(k)} 손이 닿지 않는 곳에 두어요`,
    (n, k) => `거꾸로 선 ${iga(n)} ${eulreul(k)} 안으로 감춰요`,
  ],
}
const CLOSE: Record<Verdict, readonly string[]> = {
  yes: ['징조는 ‘예’ 쪽으로 기울어요.', '베일이 걷히며 ‘예’를 향해 열려요.', '별들이 당신 편으로 기울어요.'],
  no: ['징조는 ‘아니오’ 쪽으로 기울어요.', '베일은 드리운 채, ‘아니오’를 향해 닫혀요.', '별들이 얼굴을 돌려요.'],
  maybe: ['징조가 아직 자리를 잡지 못했어요.', '베일이 흔들릴 뿐, 답은 아직 쓰이지 않았어요.', '별들이 숨을 죽이고 있어요.'],
}

export const prose: ProseKit = {
  daily(card, bucket: Bucket, pick) {
    const k1 = pick(card.keywords)
    const k2 = pick(card.keywords.filter((k) => k !== k1).concat(k1))
    const s1 = k1 === k2 ? `${eunneun(card.name)} ${eulreul(k1)} 가져다줘요.` : `${eunneun(card.name)} ${gwawa(k1)} ${eulreul(k2)} 가져다줘요.`
    return `${s1} ${LEAD_DAILY[bucket]} ${pick(ELEMENT_DAILY[card.element])}.`
  },
  twin({ a, b, bridge, rel, tone, bucket }, pick) {
    const ka = pick(a.keywords), kb = pick(b.keywords), kg = pick(bridge.keywords)
    const pair = ka === kb ? iga(ka) : `${gwawa(ka)} ${iga(kb)}`
    const s1 = `${gwawa(a.name)} ${iga(b.name)} 만나요. ${pair} 나란히 놓인 자리에서 ${pick(REL[rel])(ELEMENT[a.element], ELEMENT[b.element])}.`
    const s2 = pick([
      `${iga(bridge.name)} 두 사람 사이에 다리를 놓으며 ${eulreul(kg)} 건네요.`,
      `두 사람 사이에는 ${iga(bridge.name)} ${kg}의 다리가 되어 서 있어요.`,
      `${iga(bridge.name)} 두 사람을 이어 주며 ${eulreul(kg)} 실어 날라요.`,
    ])
    return `${s1} ${s2} ${LEAD_TWIN[bucket]} ${pick(TONE[tone])}.`
  },
  oracle(cards, verdict, pick) {
    const parts = cards.map((d, i) => {
      const turn = pick(TURN[d.reversed ? 'down' : 'up'])
      return `${LEAD[i]} ${turn(d.card.name, pick(d.card.keywords))}.`
    })
    return `${parts.join(' ')} ${pick(CLOSE[verdict])}`
  },
}

export const ko: Locale = { tag: 'ko', native: '한국어', ui, deck, prose }
