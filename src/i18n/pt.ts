import type { Element, Suit } from '../data/cards'
import type { Relation, Tone } from '../lib/dignity'
import type { Verdict } from '../lib/oracle'
import type { Messages } from './en'
import type { Bucket, CardText, DeckText, Locale, ProseCard, ProseKit } from './types'

/** Brazilian Portuguese. "Twin" is "leitura gêmea", "Bonds" is "Laços", "Bridge" is "Ponte". */

const ui: Messages = {
  meta: {
    title: 'Tarot Twin – Tarô Diário Grátis, Tarô Sim ou Não e Tarô para Casais',
    description: 'O Tarot Twin oferece uma tiragem de tarô diária grátis e um oráculo de tarô sim ou não gratuito, e une você a um amigo ou parceiro para uma leitura gêmea de tarô a dois.',
  },
  common: {
    back: 'Voltar',
    copy: 'Copiar',
    copied: 'Copiado',
    couldNotCopy: 'Não foi possível copiar',
    save: 'Salvar',
    install: 'Instalar',
    gotIt: 'Entendi',
    you: 'Você',
    friend: 'Amigo',
    stranger: 'Desconhecido',
  },
  nav: {
    aria: 'Principal',
    daily: 'Diário',
    oracle: 'Oráculo',
    bonds: 'Laços',
    cards: 'Cartas',
    shop: 'Loja',
    settings: 'Ajustes',
  },
  topbar: {
    homeAria: 'Tarot Twin, início',
    installTitle: 'Instalar o Tarot Twin',
  },
  install: {
    ios: 'Toque no botão Compartilhar na barra do Safari e depois em “Adicionar à Tela de Início”.',
    android: 'Abra o menu do Firefox (⋮) e toque em “Adicionar app à tela inicial” ou “Instalar”.',
    mac: 'Na barra de menus do Safari, escolha Arquivo › Adicionar ao Dock.',
  },
  onboarding: {
    tagline: 'Uma carta por dia. Uma leitura gêmea a dois.',
    namePlaceholder: 'Seu nome',
    begin: 'Começar',
  },
  card: {
    inspectAria: (name: string) => `${name}. Toque para ver detalhes`,
    faceDownAria: (label?: string) => (label ? `Carta virada para baixo: ${label}. Toque para revelar` : 'Carta virada para baixo. Toque para revelar'),
    rarity: { COMMON: 'Comum', HOLO: 'Holo', GOLD: 'Ouro', GALAXY: 'Galáxia' },
    rarityAria: 'Raridade',
  },
  home: {
    title: 'Carta do dia',
    tapToReveal: 'Toque na carta para revelar',
    newCardIn: 'Nova carta em',
  },
  twinReadings: {
    title: 'Leituras gêmeas',
    emptyBefore: 'Convide um amigo em ',
    emptyAfter: ' para lerem juntos.',
    nextIn: 'Próxima leitura em',
    ready: 'Pronta para ler',
  },
  twin: {
    title: 'Leitura gêmea',
    intro: 'Uma leitura gêmea une a sua carta do dia à de um amigo e acrescenta uma carta-ponte.',
    tabInvite: 'Convidar',
    tabScan: 'Escanear',
    qrHint: 'Peça ao seu amigo para escanear o código ou abrir o link.',
    shareLink: 'Compartilhar',
    copyLink: 'Copiar link',
    pastePlaceholder: 'Ou cole um link',
    pasteAria: 'Colar link',
    go: 'Ir',
    notAnInvite: 'Isso não parece um convite do Tarot Twin.',
    shareText: (name: string) => `${name} convidou você para uma leitura gêmea`,
  },
  scanner: {
    needsHttps: 'A câmera precisa de uma conexão segura (https) e de um navegador compatível.',
    denied: 'A permissão da câmera foi negada. Libere o acesso à câmera nas configurações do navegador.',
    noCamera: 'Nenhuma câmera foi encontrada neste dispositivo.',
    failed: 'Não foi possível iniciar a câmera.',
  },
  reading: {
    invalidTitle: 'Link inválido',
    invalidTwin: 'Este link de leitura gêmea não é válido.',
    invalidInvite: 'Este link de convite não é válido.',
    selfTitle: 'Este é você',
    selfTwin: 'Este é o seu próprio código. Abra o convite de um amigo.',
    selfInvite: 'Este é o seu próprio convite. Envie-o para um amigo.',
    notBondTitle: 'Ainda não é um laço',
    notBondBody: 'Compartilhe seu convite em Laços ou abra o link de convite de um amigo.',
    joining: 'Conectando…',
    bridge: 'Ponte',
    pairTitle: (me: string, friend: string) => `${me} & ${friend}`,
    /** "Toque para revelar: você / Ada / a ponte" */
    tapToReveal: (who: string) => `Toque para revelar: ${who}`,
    revealYou: 'você',
    revealBridge: 'a ponte',
    nextIn: 'Próxima leitura em',
  },
  dignity: {
    relation: { same: 'Reforçados', allied: 'Aliados', opposed: 'Opostos', neutral: 'Neutros' } satisfies Record<Relation, string>,
    tone: { harmonious: 'Harmonioso', challenging: 'Desafiador', balanced: 'Equilibrado' } satisfies Record<Tone, string>,
    withBridge: (name: string) => `${name} · Ponte`,
  },
  collection: {
    title: 'Coleção',
    allUnlocked: 'todas desbloqueadas',
    count: (n: number, total: number) => `${n} de ${total} cartas desbloqueadas`,
    filterAria: 'Filtrar cartas',
    unlocked: 'Liberadas',
    all: 'Todas',
    major: 'Maiores',
    suits: { wands: 'Paus', cups: 'Copas', swords: 'Espadas', pentacles: 'Ouros' } satisfies Record<Suit, string>,
    emptyLocked: 'Nada por aqui ainda. Tire sua carta do dia ou faça uma leitura gêmea para desbloquear cartas, ou mostre as bloqueadas.',
    noMatch: 'Nenhuma carta encontrada.',
    owned: (n: number) => (n === 1 ? '1 cópia' : `${n} cópias`),
  },
  bonds: {
    title: 'Laços',
    invite: 'Convidar',
    empty: 'Nenhum laço ainda. Convide um amigo para criar o primeiro.',
    last: (date: string) => `Última: ${date}`,
    noReadings: 'Nenhuma leitura ainda',
    streak: (n: number) => (n === 1 ? 'Sequência de 1 dia' : `Sequência de ${n} dias`),
    streakAtRisk: (n: number) => (n === 1 ? 'Sequência de 1 dia: leia hoje para mantê-la' : `Sequência de ${n} dias: leia hoje para mantê-la`),
    waiting: 'aguardando sincronização',
    readToday: 'lida hoje',
    notYetToday: 'ainda não hoje',
  },
  bond: {
    notFound: 'Não encontrado',
    noReadings: 'Nenhuma leitura ainda.',
    delete: 'Remover amigo',
    confirmDelete: (name: string) => `Remover ${name} e todas as leituras gêmeas?`,
  },
  oracle: {
    title: 'Oráculo',
    intro: 'Mentalize uma pergunta de sim ou não e escreva-a. Três cartas vão responder.',
    placeholder: 'Será que eu devo…?',
    questionAria: 'Sua pergunta',
    ask: 'Consultar',
    positions: ['Passado', 'Presente', 'Futuro'] as readonly string[],
    /** As they read after "Toque para revelar: " */
    revealPositions: ['o passado', 'o presente', 'o futuro'] as readonly string[],
    tapToReveal: (pos: string) => `Toque para revelar: ${pos}`,
    reversed: 'invertida',
    reversedShort: '(inv.)',
    verdict: { yes: 'Provavelmente sim', no: 'Provavelmente não', maybe: 'Talvez' } satisfies Record<Verdict, string>,
    shareImage: 'Compartilhar imagem',
    share: 'Compartilhar',
    askAgainIn: 'Pergunte de novo em',
    journal: 'Diário',
    imageHeader: 'TAROT TWIN · ORÁCULO',
    shareTitle: 'Oráculo Tarot Twin',
  },
  shop: {
    title: 'Loja',
    featured: { title: 'Baralho de tarô', blurb: 'Um baralho físico para leituras além do app.' },
    atmosphere: 'Atmosfera',
    items: [
      { title: 'Cristais', blurb: 'Um pequeno conjunto para repousar ao lado das cartas.' },
      { title: 'Velas', blurb: 'Uma luz suave para a sua leitura.' },
      { title: 'Incenso', blurb: 'Purifique o ar antes de perguntar.' },
      { title: 'Bandeja de altar', blurb: 'Um lugar para o seu baralho e seus instrumentos.' },
    ] as ReadonlyArray<{ title: string; blurb: string }>,
    viewOnAmazon: 'Ver na Amazon',
    view: 'Ver',
    onAmazonAria: (title: string) => `${title} na Amazon`,
    comingSoon: 'Em breve',
    associate: 'Como associado da Amazon, recebo comissões por compras qualificadas.',
  },
  settings: {
    title: 'Ajustes',
    language: 'Idioma',
    yourName: 'Seu nome',
    yourId: 'Seu ID',
    offline: 'Offline',
    offlineReady: 'Todas as cartas estão salvas neste dispositivo.',
    offlineSaving: (pct: number) => `Salvando cartas… ${pct}%`,
    offlineError: 'Algumas cartas não puderam ser salvas.',
    offlineIdle: 'Salve todas as cartas para que o app funcione sem conexão.',
    installBody: 'Adicione o Tarot Twin à tela inicial para abri-lo como um app, mesmo offline.',
    sync: 'Sincronização',
    syncBody: (total: number, connected: number) =>
      `Nomes e datas das leituras gêmeas são sincronizados com os amigos por ${total} ${total === 1 ? 'relay público' : 'relays públicos'}, com criptografia de ponta a ponta. ${connected} ${connected === 1 ? 'conectado' : 'conectados'}.`,
    debugInfo: 'Informações de depuração',
    danger: 'Zona de perigo',
    dangerBody: 'Apagar todos os dados remove seus amigos e seu histórico e cria um novo ID. Seus amigos verão você como uma nova pessoa, e suas cartas do dia vão mudar. Isso não pode ser desfeito.',
    deleteAll: 'Apagar tudo / novo ID',
    confirmDeleteAll: 'Apagar todos os dados e redefinir seu ID? Isso não pode ser desfeito.',
  },
  banners: {
    newVersion: 'Uma nova versão do Tarot Twin está pronta',
    reload: 'Recarregar',
    savingOffline: (pct: number) => `Salvando cartas para uso offline… ${pct}%`,
    offlineFailed: 'Não foi possível salvar todas as cartas para uso offline',
    retry: 'Tentar de novo',
    offlineReady: 'Pronto para usar offline',
  },
}

// ---- o baralho

type Entry = readonly [name: string, upright: string, keywords: readonly string[]]

const MAJORS: readonly Entry[] = [
  ['O Louco', 'Novos começos, inocência, um salto de fé.', ['novos começos', 'a inocência', 'um salto de fé']],
  ['O Mago', 'Força de vontade, habilidade, intenção que vira ação.', ['a força de vontade', 'a habilidade', 'a intenção que vira ação']],
  ['A Sacerdotisa', 'Intuição, mistério, sabedoria interior.', ['a intuição', 'o mistério', 'a sabedoria interior']],
  ['A Imperatriz', 'Cuidado, abundância, crescimento criativo.', ['o cuidado', 'a abundância', 'o crescimento criativo']],
  ['O Imperador', 'Estrutura, autoridade, liderança firme.', ['a estrutura', 'a autoridade', 'a liderança firme']],
  ['O Hierofante', 'Tradição, valores compartilhados, orientação.', ['a tradição', 'os valores compartilhados', 'a orientação']],
  ['Os Enamorados', 'União, sintonia, uma escolha significativa.', ['a união', 'a sintonia', 'uma escolha significativa']],
  ['O Carro', 'Impulso, determinação, vitória pelo foco.', ['o impulso', 'a determinação', 'a vitória pelo foco']],
  ['A Força', 'Coragem, paciência, um poder interior gentil.', ['a coragem', 'a paciência', 'um poder interior gentil']],
  ['O Eremita', 'Solidão, reflexão, uma luz interior que guia.', ['a solidão', 'a reflexão', 'uma luz interior que guia']],
  ['A Roda da Fortuna', 'Ciclos, sorte, um ponto de virada.', ['os ciclos', 'a sorte', 'um ponto de virada']],
  ['A Justiça', 'Equidade, verdade, responsabilidade.', ['a equidade', 'a verdade', 'a responsabilidade']],
  ['O Enforcado', 'Entrega, nova perspectiva, uma pausa.', ['a entrega', 'uma nova perspectiva', 'uma pausa']],
  ['A Morte', 'Encerramentos, transformação, um caminho que se abre.', ['os encerramentos', 'a transformação', 'um caminho que se abre']],
  ['A Temperança', 'Equilíbrio, moderação, união dos opostos.', ['o equilíbrio', 'a moderação', 'a união dos opostos']],
  ['O Diabo', 'Apego, tentação, padrões de sombra.', ['o apego', 'a tentação', 'os padrões de sombra']],
  ['A Torre', 'Mudança súbita, ruptura, revelação.', ['uma mudança súbita', 'a ruptura', 'a revelação']],
  ['A Estrela', 'Esperança, renovação, inspiração serena.', ['a esperança', 'a renovação', 'uma inspiração serena']],
  ['A Lua', 'Ilusão, sonhos, o inconsciente.', ['a ilusão', 'os sonhos', 'o inconsciente']],
  ['O Sol', 'Alegria, vitalidade, clareza e sucesso.', ['a alegria', 'a vitalidade', 'a clareza e o sucesso']],
  ['O Julgamento', 'Despertar, acerto de contas, resposta a um chamado.', ['o despertar', 'um acerto de contas', 'a resposta a um chamado']],
  ['O Mundo', 'Conclusão, plenitude, um ciclo realizado.', ['a conclusão', 'a plenitude', 'um ciclo realizado']],
]

const MINORS: Record<Suit, readonly (readonly [upright: string, keywords: readonly string[]])[]> = {
  wands: [
    ['Uma faísca de inspiração e uma energia nova e ousada.', ['uma faísca de inspiração', 'uma energia nova e ousada']],
    ['Planejamento, escolhas e um olhar além do horizonte.', ['o planejamento', 'as escolhas', 'um olhar além do horizonte']],
    ['Expansão, visão de futuro e a espera pela chegada dos navios.', ['a expansão', 'a visão de futuro', 'a espera pela chegada dos navios']],
    ['Celebração, regresso ao lar e alegria estável.', ['a celebração', 'o regresso ao lar', 'uma alegria estável']],
    ['Rivalidade, competição e conflitos dispersos.', ['a rivalidade', 'a competição', 'os conflitos dispersos']],
    ['Vitória, reconhecimento e sucesso público.', ['a vitória', 'o reconhecimento', 'o sucesso público']],
    ['Defender sua posição com firmeza.', ['a defesa da sua posição', 'a firmeza']],
    ['Movimento rápido, mensagens e progresso veloz.', ['o movimento rápido', 'as mensagens', 'um progresso veloz']],
    ['Resiliência, persistência e um último esforço.', ['a resiliência', 'a persistência', 'um último esforço']],
    ['Fardo, excesso de compromissos e carga pesada demais.', ['o fardo', 'o excesso de compromissos', 'uma carga pesada demais']],
    ['Um explorador entusiasmado, cheio de novas ideias criativas.', ['o espírito explorador', 'novas ideias criativas']],
    ['Uma busca apaixonada, aventureira e impulsiva.', ['a paixão', 'a aventura', 'a impulsividade']],
    ['Liderança calorosa, confiante e magnética.', ['o calor humano', 'a confiança', 'o magnetismo']],
    ['Liderança visionária e ousada, cheia de carisma.', ['a visão', 'a ousadia', 'o carisma']],
  ],
  cups: [
    ['Novos sentimentos, amor e abertura emocional.', ['novos sentimentos', 'o amor', 'a abertura emocional']],
    ['Atração mútua, parceria e conexão.', ['a atração mútua', 'a parceria', 'a conexão']],
    ['Amizade, celebração e alegria compartilhada.', ['a amizade', 'a festa', 'a alegria compartilhada']],
    ['Apatia, contemplação e um novo olhar sobre as propostas.', ['a apatia', 'a contemplação', 'um novo olhar sobre as propostas']],
    ['Perda, arrependimento e luto pelo que passou.', ['a perda', 'o arrependimento', 'o luto pelo que passou']],
    ['Nostalgia, memórias de infância e gentileza.', ['a nostalgia', 'as memórias de infância', 'a gentileza']],
    ['Fantasia, devaneios e muitas opções.', ['a fantasia', 'os devaneios', 'muitas opções']],
    ['Partir em busca de algo mais profundo.', ['a partida', 'a busca por algo mais profundo']],
    ['Contentamento, um desejo realizado, satisfação emocional.', ['o contentamento', 'um desejo realizado', 'a satisfação emocional']],
    ['Harmonia, família e felicidade duradoura.', ['a harmonia', 'a família', 'a felicidade duradoura']],
    ['Um mensageiro terno com notícias criativas ou românticas.', ['a ternura', 'notícias criativas ou românticas']],
    ['Romântico, encantador e guiado pelo coração.', ['o romance', 'o encanto', 'a voz do coração']],
    ['Compassiva, intuitiva e emocionalmente sábia.', ['a compaixão', 'a escuta intuitiva', 'a sabedoria emocional']],
    ['Equilíbrio emocional, diplomacia e generosidade serena.', ['o equilíbrio emocional', 'a diplomacia', 'a generosidade serena']],
  ],
  swords: [
    ['Clareza, um grande avanço e a verdade revelada.', ['a clareza', 'um grande avanço', 'a verdade revelada']],
    ['Impasse, escolha difícil e verdades evitadas.', ['o impasse', 'uma escolha difícil', 'as verdades evitadas']],
    ['Coração partido, tristeza e honestidade dolorosa.', ['o coração partido', 'a tristeza', 'uma honestidade dolorosa']],
    ['Descanso, recuperação e contemplação tranquila.', ['o descanso', 'a recuperação', 'a contemplação tranquila']],
    ['Conflito, vitória vazia e tensão.', ['o conflito', 'uma vitória vazia', 'a tensão']],
    ['Seguir em frente, transição e águas mais calmas.', ['a transição', 'águas mais calmas', 'a coragem de seguir em frente']],
    ['Estratégia, segredo e agir sozinho.', ['a estratégia', 'o segredo', 'a ação solitária']],
    ['Restrição, insegurança e a sensação de estar sem saída.', ['a restrição', 'a insegurança', 'a sensação de estar sem saída']],
    ['Ansiedade, preocupação e noites sem dormir.', ['a ansiedade', 'a preocupação', 'noites sem dormir']],
    ['Fim doloroso, fundo do poço e libertação.', ['um fim doloroso', 'o fundo do poço', 'a libertação']],
    ['Curioso, atento e ávido por aprender.', ['a curiosidade', 'a atenção', 'a sede de aprender']],
    ['Rápido, direto e movido por ideias.', ['a rapidez', 'a franqueza', 'a força das ideias']],
    ['Perspicaz, independente e de olhar claro.', ['a perspicácia', 'a independência', 'um olhar claro']],
    ['Intelecto, autoridade e julgamento justo.', ['o intelecto', 'o comando', 'um julgamento justo']],
  ],
  pentacles: [
    ['Uma nova oportunidade, prosperidade e começos sólidos.', ['uma nova oportunidade', 'a prosperidade', 'começos sólidos']],
    ['Equilibrar prioridades e se adaptar às mudanças.', ['o equilíbrio entre prioridades', 'a adaptação às mudanças']],
    ['Trabalho em equipe, ofício e algo construído a dois.', ['o trabalho em equipe', 'o ofício', 'algo construído a dois']],
    ['Segurança, economia e apego ao que se tem.', ['a segurança', 'a economia', 'o apego ao que se tem']],
    ['Dificuldade, escassez e a sensação de ficar ao relento.', ['a dificuldade', 'a escassez', 'a sensação de ficar ao relento']],
    ['Generosidade, dar e receber, e apoio.', ['a generosidade', 'o dar e receber', 'o apoio']],
    ['Paciência, investimento a longo prazo e a espera pela colheita.', ['a paciência', 'o investimento a longo prazo', 'a espera pela colheita']],
    ['Diligência, maestria e prática dedicada.', ['a diligência', 'a maestria', 'a prática dedicada']],
    ['Autossuficiência, luxo e um conforto merecido.', ['a autossuficiência', 'o luxo', 'um conforto merecido']],
    ['Legado, riqueza familiar e segurança duradoura.', ['o legado', 'a riqueza familiar', 'a segurança duradoura']],
    ['Estudioso, prático e aberto a novas habilidades.', ['o estudo', 'o senso prático', 'novas habilidades']],
    ['Confiável, metódico e de esforço constante.', ['a confiabilidade', 'o método', 'o esforço constante']],
    ['Abundância acolhedora, prática e engenhosa.', ['o acolhimento', 'a fartura', 'a engenhosidade']],
    ['Provedor próspero, confiável e generoso.', ['a solidez', 'a lealdade', 'a mão generosa']],
  ],
}

const RANKS = ['Ás', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito', 'Nove', 'Dez', 'Valete', 'Cavaleiro', 'Rainha', 'Rei']
const SUIT_NAME: Record<Suit, string> = { wands: 'Paus', cups: 'Copas', swords: 'Espadas', pentacles: 'Ouros' }

export const deck: DeckText = {
  majors: MAJORS.map(([n, u, k]): CardText => [n, u, k]),
  minors: Object.fromEntries(
    (Object.keys(MINORS) as Suit[]).map((s) => [s, MINORS[s].map(([u, k], i): CardText => [`${RANKS[i]} de ${SUIT_NAME[s]}`, u, k])]),
  ) as unknown as Record<Suit, readonly CardText[]>,
}

// ---- prosa

/**
 * Card names in prose always carry an article: majors already have one ("A Estrela"), minors get one here
 * ("o Ás de Paus", "a Rainha de Copas"). Mid-sentence the article is lowercased. Names only appear as subjects
 * or after a colon, never after a preposition, so no contraction ("da", "do") is ever needed.
 */
const ARTICLE = /^(O|A|Os|As) /
const named = (name: string, start = false) => {
  const full = ARTICLE.test(name) ? name : `${name.startsWith('Rainha') ? 'A' : 'O'} ${name}`
  return start ? full : full.replace(ARTICLE, (m) => m.toLowerCase())
}
/** "Os Enamorados" takes a plural verb. */
const verb = (c: ProseCard, sg: string, pl: string) => (/^(Os|As) /.test(c.name) ? pl : sg)

const EL: Record<Element, string> = { fire: 'o Fogo', water: 'a Água', air: 'o Ar', earth: 'a Terra' }
const DE_EL: Record<Element, string> = { fire: 'do Fogo', water: 'da Água', air: 'do Ar', earth: 'da Terra' }
const A_EL: Record<Element, string> = { fire: 'ao Fogo', water: 'à Água', air: 'ao Ar', earth: 'à Terra' }

const LEAD_TWIN = ['Enquanto novos fios se tecem,', 'Enquanto o ritmo se firma,', 'Com o ritmo de vocês crescendo,', 'Com um ritmo tão profundo entre vocês,']
const LEAD_DAILY = ['Hoje,', 'Enquanto o ritmo se firma,', 'Com o seu ritmo crescendo,', 'Com um ritmo já tão trilhado,']

/** {a}/{b} = "o Fogo", {de_a} = "do Fogo", {a_b} = "ao Ar" / "à Terra". */
const REL: Record<Relation, readonly string[]> = {
  same: ['{a} ecoa {a}, dobrando sua força', 'uma só corrente {de_a} corre por vocês dois'],
  allied: ['{a} e {b} se alimentam', '{a} empresta seu sopro {a_b}'],
  opposed: ['{a} e {b} puxam em direções opostas', 'faíscas saltam entre {a} e {b}'],
  neutral: ['{a} e {b} se encontram sem atrito', '{a} e {b} mantêm uma distância cortês'],
}
const fill = (t: string, a: Element, b: Element) =>
  t.replace(/\{de_a\}/g, DE_EL[a]).replace(/\{a_b\}/g, A_EL[b]).replace(/\{a\}/g, EL[a]).replace(/\{b\}/g, EL[b])

const TONE: Record<Tone, readonly string[]> = {
  harmonious: ['o dia favorece vocês dois', 'pouca coisa resiste a vocês dois juntos', 'o que começarem juntos vai se sustentar'],
  challenging: ['o atrito será o mestre do dia', 'a sinceridade valerá mais que o conforto', 'pisem com cuidado e escutem duas vezes'],
  balanced: ['o dia pende para onde vocês se inclinarem', 'ninguém sai na frente, então escolham juntos', 'uma atenção constante vai decidir'],
}

const ELEMENT_DAILY: Record<Element, readonly string[]> = {
  fire: ['aja enquanto o fogo ainda está aceso', 'deixe a sua coragem tomar a frente'],
  water: ['deixe o sentimento guiar seus passos', 'confie no que você sente sob a superfície'],
  air: ['diga o que pensa com clareza', 'deixe uma ideia clara alçar voo'],
  earth: ['construa algo pequeno e duradouro', 'mantenha os pés em terra firme'],
}

const LEAD = ['Atrás de você,', 'Diante de você,', 'Mais adiante,']
type Turn = (n: string, c: ProseCard, k: string) => string
const TURN: Record<'up' | 'down', readonly Turn[]> = {
  up: [
    (n, c, k) => `${n} ${verb(c, 'concede', 'concedem')} ${k}`,
    (n, c, k) => `${n} ${verb(c, 'oferece', 'oferecem')} ${k}`,
    (n, c, k) => `${n} ${verb(c, 'traz consigo', 'trazem consigo')} ${k}`,
  ],
  down: [
    (n, c, k) => `${n}, de cabeça para baixo, ${verb(c, 'encobre', 'encobrem')} ${k}`,
    (n, c, k) => `${n}, em posição invertida, ${verb(c, 'mantém', 'mantêm')} ${k} fora de alcance`,
    (n, c, k) => `${n}, de ponta-cabeça, ${verb(c, 'recolhe', 'recolhem')} ${k} para dentro de si`,
  ],
}
const CLOSE: Record<Verdict, readonly string[]> = {
  yes: ['Os presságios pendem para o sim.', 'O véu se abre e revela um sim.', 'As estrelas se inclinam a seu favor.'],
  no: ['Os presságios pendem para o não.', 'O véu permanece fechado e anuncia um não.', 'As estrelas desviam o olhar.'],
  maybe: ['Os presságios não se decidem.', 'O véu estremece, e a resposta ainda não foi escrita.', 'As estrelas prendem a respiração.'],
}

export const prose: ProseKit = {
  daily(card, bucket: Bucket, pick) {
    const k1 = pick(card.keywords)
    const k2 = pick(card.keywords.filter((k) => k !== k1).concat(k1))
    const n = `${named(card.name, true)} ${verb(card, 'traz', 'trazem')}`
    const s1 = k1 === k2 ? `${n} ${k1}.` : `${n} ${k1} e ${k2}.`
    return `${s1} ${LEAD_DAILY[bucket]} ${pick(ELEMENT_DAILY[card.element])}.`
  },
  twin({ a, b, bridge, rel, tone, bucket }, pick) {
    const ka = pick(a.keywords), kb = pick(b.keywords), kg = pick(bridge.keywords)
    const pair = ka === kb ? `${ka} em dobro` : `${ka} e ${kb} lado a lado`
    const s1 = `${named(a.name, true)} ${verb(a, 'encontra', 'encontram')} ${named(b.name)}: ${pair}, onde ${fill(pick(REL[rel]), a.element, b.element)}.`
    const s2 = pick([
      `${named(bridge.name, true)} ${verb(bridge, 'se ergue', 'se erguem')} como um arco entre vocês, oferecendo ${kg}.`,
      `Entre vocês ${verb(bridge, 'está', 'estão')} ${named(bridge.name)}, uma ponte que traz ${kg}.`,
      `${named(bridge.name, true)} ${verb(bridge, 'une', 'unem')} os dois, trazendo ${kg}.`,
    ])
    return `${s1} ${s2} ${LEAD_TWIN[bucket]} ${pick(TONE[tone])}.`
  },
  oracle(cards, verdict, pick) {
    const parts = cards.map((d, i) => {
      const turn = pick(TURN[d.reversed ? 'down' : 'up'])
      return `${LEAD[i]} ${turn(named(d.card.name), d.card, pick(d.card.keywords))}.`
    })
    return `${parts.join(' ')} ${pick(CLOSE[verdict])}`
  },
}

export const pt: Locale = { tag: 'pt-BR', native: 'Português (Brasil)', ui, deck, prose }
