import type { Element, Suit } from '../data/cards'
import type { Relation, Tone } from '../lib/dignity'
import type { Verdict } from '../lib/oracle'
import type { Messages } from './en'
import type { Bucket, CardText, DeckText, Locale, ProseKit } from './types'

/** Spanish: neutral Latin American, "tú", understandable in Spain. */

const ui: Messages = {
  meta: {
    title: 'Tarot Twin – Tarot diario gratis, tarot sí o no y tarot de pareja',
    description: 'Tarot Twin te regala una lectura de tarot diario gratis y un oráculo de tarot sí o no, y te une con un amigo o tu pareja en una lectura de tarot compartida.',
  },
  common: {
    back: 'Volver',
    copy: 'Copiar',
    copied: 'Copiado',
    couldNotCopy: 'No se pudo copiar',
    save: 'Guardar',
    install: 'Instalar',
    gotIt: 'Entendido',
    you: 'Tú',
    friend: 'Amigo',
    stranger: 'Desconocido',
  },
  nav: {
    aria: 'Principal',
    daily: 'Hoy',
    oracle: 'Oráculo',
    bonds: 'Vínculos',
    cards: 'Cartas',
    shop: 'Tienda',
    settings: 'Ajustes',
  },
  topbar: {
    homeAria: 'Tarot Twin, inicio',
    installTitle: 'Instalar Tarot Twin',
  },
  install: {
    ios: 'Toca el botón Compartir en la barra de Safari y luego “Agregar a inicio”.',
    android: 'Abre el menú de Firefox (⋮) y toca “Añadir app a la pantalla de inicio” o “Instalar”.',
    mac: 'En la barra de menús de Safari, elige Archivo › Agregar al Dock.',
  },
  onboarding: {
    tagline: 'Una carta al día. Una lectura gemela para dos.',
    namePlaceholder: 'Tu nombre',
    begin: 'Comenzar',
  },
  card: {
    inspectAria: (name: string) => `${name}. Toca para ver detalles`,
    faceDownAria: (label?: string) => (label ? `Carta boca abajo de ${label}. Toca para revelarla` : 'Carta boca abajo. Toca para revelarla'),
    rarity: { COMMON: 'Común', HOLO: 'Holo', GOLD: 'Oro', GALAXY: 'Galaxia' },
    rarityAria: 'Rareza',
  },
  home: {
    title: 'Tu carta de hoy',
    tapToReveal: 'Toca la carta para revelarla',
    newCardIn: 'Nueva carta en',
  },
  twinReadings: {
    title: 'Lecturas gemelas',
    emptyBefore: 'Invita a un amigo desde ',
    emptyAfter: ' para leer juntos.',
    nextIn: 'Próxima lectura en',
    ready: 'Lista para leer',
  },
  twin: {
    title: 'Gemelos',
    intro: 'Una lectura gemela une tu carta del día con la de un amigo y suma una carta puente.',
    tabInvite: 'Invitar',
    tabScan: 'Escanear',
    qrHint: 'Pide a tu amigo que escanee esto o abra el enlace.',
    shareLink: 'Compartir',
    copyLink: 'Copiar enlace',
    pastePlaceholder: 'O pega un enlace',
    pasteAria: 'Pegar enlace',
    go: 'Ir',
    notAnInvite: 'Eso no parece una invitación de Tarot Twin.',
    shareText: (name: string) => `${name} te invita a ser Gemelos en Tarot Twin`,
  },
  scanner: {
    needsHttps: 'La cámara necesita una conexión segura (https) y un navegador compatible.',
    denied: 'Se denegó el permiso de la cámara. Permite el acceso en los ajustes del navegador.',
    noCamera: 'No se encontró ninguna cámara en este dispositivo.',
    failed: 'No se pudo iniciar la cámara.',
  },
  reading: {
    invalidTitle: 'Enlace no válido',
    invalidTwin: 'Este enlace de Gemelos no es válido.',
    invalidInvite: 'Este enlace de invitación no es válido.',
    selfTitle: 'Eres tú',
    selfTwin: 'Este es tu propio código. Abre mejor la invitación de un amigo.',
    selfInvite: 'Esta es tu propia invitación. Envíasela a un amigo.',
    notBondTitle: 'Aún no hay vínculo',
    notBondBody: 'Comparte tu invitación desde Vínculos o abre el enlace de invitación de un amigo.',
    joining: 'Uniendo…',
    bridge: 'Puente',
    pairTitle: (me: string, friend: string) => `${me} y ${friend}`,
    /** "Toca para revelar: tu carta / Ada / el puente" */
    tapToReveal: (who: string) => `Toca para revelar: ${who}`,
    revealYou: 'tu carta',
    revealBridge: 'el puente',
    nextIn: 'Próxima lectura en',
  },
  dignity: {
    relation: { same: 'Reforzado', allied: 'Aliado', opposed: 'Opuesto', neutral: 'Neutral' } satisfies Record<Relation, string>,
    tone: { harmonious: 'Armonioso', challenging: 'Desafiante', balanced: 'Equilibrado' } satisfies Record<Tone, string>,
    withBridge: (name: string) => `${name} · Puente`,
  },
  collection: {
    title: 'Colección',
    allUnlocked: 'todas desbloqueadas',
    count: (n: number, total: number) => `${n} de ${total} cartas desbloqueadas`,
    filterAria: 'Filtrar cartas',
    unlocked: 'Mías',
    all: 'Todas',
    major: 'Mayores',
    suits: { wands: 'Bastos', cups: 'Copas', swords: 'Espadas', pentacles: 'Oros' } satisfies Record<Suit, string>,
    emptyLocked: 'Aún no hay nada aquí. Saca tu carta del día o haz una lectura gemela para desbloquear cartas, o muestra las bloqueadas.',
    noMatch: 'Ninguna carta coincide.',
    owned: (n: number) => (n === 1 ? '1 copia' : `${n} copias`),
  },
  bonds: {
    title: 'Vínculos',
    invite: 'Invitar',
    empty: 'Aún no tienes vínculos. Invita a un amigo para crear uno.',
    last: (date: string) => `Última: ${date}`,
    noReadings: 'Aún sin lecturas',
    streak: (n: number) => `Racha de ${n} ${n === 1 ? 'día' : 'días'}`,
    streakAtRisk: (n: number) => `Racha de ${n} ${n === 1 ? 'día' : 'días'}: lee hoy para no perderla`,
    waiting: 'esperando sincronización',
    readToday: 'lectura de hoy hecha',
    notYetToday: 'aún sin lectura hoy',
  },
  bond: {
    notFound: 'No encontrado',
    noReadings: 'Aún no hay lecturas.',
    delete: 'Eliminar amigo',
    confirmDelete: (name: string) => `¿Eliminar a ${name} y todas sus lecturas gemelas?`,
  },
  oracle: {
    title: 'Oráculo',
    intro: 'Piensa en una pregunta de sí o no y escríbela. Tres cartas te responderán.',
    placeholder: '¿Debería…?',
    questionAria: 'Tu pregunta',
    ask: 'Consultar',
    positions: ['Pasado', 'Presente', 'Futuro'] as readonly string[],
    revealPositions: ['el pasado', 'el presente', 'el futuro'] as readonly string[],
    tapToReveal: (pos: string) => `Toca para revelar: ${pos}`,
    reversed: 'invertida',
    reversedShort: '(inv.)',
    verdict: { yes: 'Probablemente sí', no: 'Probablemente no', maybe: 'Quizás' } satisfies Record<Verdict, string>,
    shareImage: 'Compartir imagen',
    share: 'Compartir',
    askAgainIn: 'Vuelve a preguntar en',
    journal: 'Diario',
    imageHeader: 'TAROT TWIN · ORÁCULO',
    shareTitle: 'Oráculo de Tarot Twin',
  },
  shop: {
    title: 'Tienda',
    featured: { title: 'Mazo de tarot', blurb: 'Un mazo físico para lecturas más allá de la app.' },
    atmosphere: 'Ambiente',
    items: [
      { title: 'Cristales', blurb: 'Un pequeño set para acompañar tus cartas.' },
      { title: 'Velas', blurb: 'Una luz suave para tus lecturas.' },
      { title: 'Incienso', blurb: 'Purifica el ambiente antes de preguntar.' },
      { title: 'Bandeja de altar', blurb: 'Un lugar para tu mazo y tus herramientas.' },
    ] as ReadonlyArray<{ title: string; blurb: string }>,
    viewOnAmazon: 'Ver en Amazon',
    view: 'Ver',
    onAmazonAria: (title: string) => `${title} en Amazon`,
    comingSoon: 'Próximamente',
    associate: 'En calidad de Afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.',
  },
  settings: {
    title: 'Ajustes',
    language: 'Idioma',
    yourName: 'Tu nombre',
    yourId: 'Tu ID',
    offline: 'Sin conexión',
    offlineReady: 'Todas las cartas están guardadas en este dispositivo.',
    offlineSaving: (pct: number) => `Guardando cartas… ${pct} %`,
    offlineError: 'No se pudieron guardar algunas cartas.',
    offlineIdle: 'Guarda todas las cartas para que la app funcione sin conexión.',
    installBody: 'Agrega Tarot Twin a tu pantalla de inicio para abrirla como una app, incluso sin conexión.',
    sync: 'Sincronización',
    syncBody: (total: number, connected: number) =>
      `Los nombres y las fechas de las lecturas gemelas se sincronizan con tus amigos a través de ${total} ${total === 1 ? 'relé público' : 'relés públicos'}, con cifrado de extremo a extremo. ${connected} ${connected === 1 ? 'conectado' : 'conectados'}.`,
    debugInfo: 'Info de depuración',
    danger: 'Zona de peligro',
    dangerBody: 'Borrar todos los datos elimina a tus amigos y tu historial, y crea un ID nuevo. Tus amigos te verán como una persona nueva y tus cartas del día cambiarán. Esto no se puede deshacer.',
    deleteAll: 'Borrar todo / nuevo ID',
    confirmDeleteAll: '¿Borrar todos los datos y restablecer tu ID? Esto no se puede deshacer.',
  },
  banners: {
    newVersion: 'Hay una nueva versión de Tarot Twin lista',
    reload: 'Recargar',
    savingOffline: (pct: number) => `Guardando cartas para usar sin conexión… ${pct} %`,
    offlineFailed: 'No se pudieron guardar todas las cartas sin conexión',
    retry: 'Reintentar',
    offlineReady: 'Lista para usar sin conexión',
  },
}

// ---- the deck: [name, upright, keywords]. Keywords are bare noun phrases (no leading article), so they slot
// into "trae {k}", "un puente de {k}" and "la promesa de {k}" unchanged.

const MAJORS: readonly CardText[] = [
  ['El Loco', 'Nuevos comienzos, inocencia, un salto de fe.', ['nuevos comienzos', 'inocencia', 'fe en lo desconocido']],
  ['El Mago', 'Voluntad, habilidad, convertir la intención en acción.', ['voluntad', 'habilidad', 'intención hecha acción']],
  ['La Sacerdotisa', 'Intuición, misterio, sabiduría interior.', ['intuición', 'misterio', 'sabiduría interior']],
  ['La Emperatriz', 'Cuidado, abundancia, crecimiento creativo.', ['cuidado', 'abundancia', 'crecimiento creativo']],
  ['El Emperador', 'Estructura, autoridad, liderazgo firme.', ['estructura', 'autoridad', 'liderazgo firme']],
  ['El Hierofante', 'Tradición, valores compartidos, orientación.', ['tradición', 'valores compartidos', 'orientación']],
  ['Los Enamorados', 'Unión, armonía, una elección significativa.', ['unión', 'armonía', 'elecciones del corazón']],
  ['El Carro', 'Impulso, determinación, victoria gracias al enfoque.', ['impulso', 'determinación', 'victoria']],
  ['La Fuerza', 'Coraje, paciencia, un poder interior sereno.', ['coraje', 'paciencia', 'poder interior']],
  ['El Ermitaño', 'Soledad, reflexión, una luz interior que guía.', ['soledad', 'reflexión', 'luz interior']],
  ['La Rueda de la Fortuna', 'Ciclos, suerte, un punto de inflexión.', ['ciclos', 'suerte', 'giros del destino']],
  ['La Justicia', 'Equidad, verdad, responsabilidad.', ['equidad', 'verdad', 'responsabilidad']],
  ['El Colgado', 'Rendición, una nueva perspectiva, una pausa.', ['rendición', 'nuevas perspectivas', 'quietud']],
  ['La Muerte', 'Finales, transformación, abrir camino.', ['finales', 'transformación', 'espacio para lo nuevo']],
  ['La Templanza', 'Equilibrio, moderación, unir los opuestos.', ['equilibrio', 'moderación', 'unión de opuestos']],
  ['El Diablo', 'Apego, tentación, los patrones de la sombra.', ['apego', 'tentación', 'viejos patrones']],
  ['La Torre', 'Cambio repentino, sacudida, revelación.', ['cambios repentinos', 'sacudidas', 'revelación']],
  ['La Estrella', 'Esperanza, renovación, inspiración serena.', ['esperanza', 'renovación', 'inspiración serena']],
  ['La Luna', 'Ilusiones, sueños, el inconsciente.', ['espejismos', 'sueños', 'voces del inconsciente']],
  ['El Sol', 'Alegría, vitalidad, claridad y éxito.', ['alegría', 'vitalidad', 'éxito']],
  ['El Juicio', 'Despertar, rendición de cuentas, responder a un llamado.', ['despertar', 'renacimiento', 'vocación']],
  ['El Mundo', 'Plenitud, integración, un ciclo que se cumple.', ['plenitud', 'integración', 'ciclos cumplidos']],
]

const MINORS: Record<Suit, ReadonlyArray<readonly [upright: string, keywords: readonly string[]]>> = {
  wands: [
    ['Una chispa de inspiración y una energía nueva y audaz.', ['inspiración', 'energía audaz', 'nuevos impulsos']],
    ['Planes, decisiones y mirar más allá del horizonte.', ['planes', 'decisiones', 'visión de futuro']],
    ['Expansión, previsión y esperar a que lleguen tus barcos.', ['expansión', 'previsión', 'horizontes abiertos']],
    ['Celebración, regreso al hogar y una alegría estable.', ['celebración', 'regreso al hogar', 'alegría estable']],
    ['Rivalidad, competencia y conflictos dispersos.', ['rivalidad', 'competencia', 'roces']],
    ['Victoria, reconocimiento y éxito público.', ['victoria', 'reconocimiento', 'éxito público']],
    ['Defender tu posición con firmeza.', ['firmeza', 'convicción', 'defensa de lo propio']],
    ['Movimiento veloz, mensajes y avances rápidos.', ['movimiento', 'mensajes', 'avances rápidos']],
    ['Resiliencia, persistencia y un último esfuerzo.', ['resiliencia', 'persistencia', 'fuerzas renovadas']],
    ['Carga, exceso de compromisos y llevar demasiado peso.', ['cargas', 'exceso de compromisos', 'peso de más']],
    ['Un espíritu explorador con ideas frescas y creativas.', ['entusiasmo', 'espíritu explorador', 'ideas frescas']],
    ['Búsqueda apasionada, aventurera e impulsiva.', ['pasión', 'aventura', 'impulsividad']],
    ['Liderazgo cálido, seguro y magnético.', ['calidez', 'confianza', 'magnetismo']],
    ['Visión, liderazgo audaz y carisma.', ['visión', 'liderazgo audaz', 'carisma']],
  ],
  cups: [
    ['Nuevos sentimientos, amor y apertura emocional.', ['nuevos sentimientos', 'amor', 'apertura emocional']],
    ['Atracción mutua, unión y conexión.', ['atracción mutua', 'complicidad', 'conexión']],
    ['Amistad, celebración y alegría compartida.', ['amistad', 'celebración', 'alegría compartida']],
    ['Apatía, contemplación y repensar lo que se ofrece.', ['apatía', 'contemplación', 'dudas ante lo ofrecido']],
    ['Pérdida, arrepentimiento y duelo por lo que fue.', ['pérdida', 'arrepentimiento', 'duelo']],
    ['Nostalgia, recuerdos de infancia y bondad.', ['nostalgia', 'recuerdos de infancia', 'bondad']],
    ['Fantasía, ilusiones y demasiadas opciones.', ['fantasía', 'castillos en el aire', 'opciones']],
    ['Alejarse en busca de algo más profundo.', ['desapego', 'búsqueda de sentido']],
    ['Satisfacción, un deseo cumplido, plenitud emocional.', ['satisfacción', 'deseos cumplidos', 'plenitud emocional']],
    ['Armonía, familia y felicidad duradera.', ['armonía', 'familia', 'felicidad duradera']],
    ['Un mensajero tierno con noticias creativas o románticas.', ['ternura', 'noticias románticas', 'sensibilidad creativa']],
    ['Romántico, encantador y fiel a su corazón.', ['romance', 'encanto', 'corazonadas']],
    ['Compasiva, intuitiva y emocionalmente sabia.', ['compasión', 'intuición', 'sabiduría emocional']],
    ['Equilibrio emocional, diplomacia y generosidad serena.', ['equilibrio emocional', 'diplomacia', 'generosidad serena']],
  ],
  swords: [
    ['Claridad, un gran avance y la verdad revelada.', ['claridad', 'grandes avances', 'verdades reveladas']],
    ['Punto muerto, decisiones difíciles y verdades evitadas.', ['indecisión', 'decisiones difíciles', 'verdades evitadas']],
    ['Desamor, pena y una honestidad dolorosa.', ['desamor', 'pena', 'honestidad dolorosa']],
    ['Descanso, recuperación y contemplación serena.', ['descanso', 'recuperación', 'contemplación serena']],
    ['Conflicto, victorias vacías y tensión.', ['conflicto', 'victorias vacías', 'tensión']],
    ['Seguir adelante, transición y aguas más tranquilas.', ['transición', 'nuevos rumbos', 'aguas tranquilas']],
    ['Estrategia, secretos y actuar en solitario.', ['estrategia', 'secretos', 'independencia']],
    ['Restricción, inseguridad y sentir que no hay salida.', ['restricción', 'inseguridad', 'encierro']],
    ['Ansiedad, preocupación y noches sin dormir.', ['ansiedad', 'preocupación', 'desvelos']],
    ['Un final doloroso, tocar fondo y liberación.', ['finales dolorosos', 'liberación']],
    ['Curiosidad, atención y ganas de aprender.', ['curiosidad', 'mente alerta', 'ganas de aprender']],
    ['Rapidez, franqueza y el impulso de las ideas.', ['rapidez', 'franqueza', 'ideas en marcha']],
    ['Perspicacia, independencia y mirada clara.', ['perspicacia', 'independencia', 'mirada clara']],
    ['Intelecto, autoridad y juicio justo.', ['intelecto', 'autoridad', 'juicio justo']],
  ],
  pentacles: [
    ['Una nueva oportunidad, prosperidad y comienzos sólidos.', ['oportunidades', 'prosperidad', 'comienzos sólidos']],
    ['Hacer malabares con prioridades y adaptarse al cambio.', ['equilibrio entre prioridades', 'adaptación', 'flexibilidad']],
    ['Trabajo en equipo, oficio y construir algo juntos.', ['trabajo en equipo', 'oficio', 'obra compartida']],
    ['Seguridad, ahorro y aferrarse con fuerza.', ['seguridad', 'ahorro', 'control']],
    ['Penuria, carencia y sentirse a la intemperie.', ['penurias', 'carencia', 'desamparo']],
    ['Generosidad, dar y recibir, apoyo mutuo.', ['generosidad', 'reciprocidad', 'apoyo mutuo']],
    ['Paciencia, inversión a largo plazo y esperar la cosecha.', ['paciencia', 'inversión a largo plazo', 'frutos por llegar']],
    ['Diligencia, maestría y práctica constante.', ['diligencia', 'maestría', 'práctica constante']],
    ['Autosuficiencia, lujo y un bienestar bien ganado.', ['autosuficiencia', 'lujo', 'bienestar merecido']],
    ['Legado, riqueza familiar y seguridad duradera.', ['legado', 'riqueza familiar', 'seguridad duradera']],
    ['Estudio, sentido práctico y apertura a nuevas habilidades.', ['estudio', 'sentido práctico', 'aprendizaje']],
    ['Fiabilidad, método y esfuerzo constante.', ['fiabilidad', 'método', 'esfuerzo constante']],
    ['Cuidado, sentido práctico y abundancia con recursos.', ['cuidado', 'sentido práctico', 'abundancia']],
    ['Prosperidad, fiabilidad y la generosidad de quien provee.', ['prosperidad', 'fiabilidad', 'generosidad']],
  ],
}

const RANKS = ['As', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez', 'Sota', 'Caballero', 'Reina', 'Rey']
const SUIT_NAME: Record<Suit, string> = { wands: 'Bastos', cups: 'Copas', swords: 'Espadas', pentacles: 'Oros' }

const suit = (s: Suit): readonly CardText[] => MINORS[s].map(([u, k], i): CardText => [`${RANKS[i]} de ${SUIT_NAME[s]}`, u, k])

export const deck: DeckText = {
  majors: MAJORS,
  minors: {
    wands: suit('wands'),
    cups: suit('cups'),
    swords: suit('swords'),
    pentacles: suit('pentacles'),
  },
}

// ---- prose

/**
 * A card name as it reads mid-sentence: majors carry their article ("El Loco" → "el Loco"), minors get one
 * ("As de Copas" → "el As de Copas", "Reina de Oros" → "la Reina de Oros").
 */
const nm = (name: string) => {
  const m = /^(El|La|Los|Las) (.*)$/.exec(name)
  if (m) return `${m[1].toLowerCase()} ${m[2]}`
  return /^(Sota|Reina) /.test(name) ? `la ${name}` : `el ${name}`
}
/** At the start of a sentence. */
const Nm = (name: string) => {
  const s = nm(name)
  return s.charAt(0).toUpperCase() + s.slice(1)
}
/** Only "Los Enamorados" is plural: picks the verb form in "{trae|traen}". */
const agree = (t: string, name: string) => t.replace(/\{([^|{}]+)\|([^|{}]+)\}/g, (_, sg: string, pl: string) => (/^(Los|Las) /.test(name) ? pl : sg))
/** "x y z", with "y" → "e" before an i- sound ("e intuición", "e hilos", but "y hielo"). */
const and = (x: string, y: string) => `${x} ${/^h?[iíÍI]/.test(y) && !/^h?[iI][aeouáéóú]/.test(y) ? 'e' : 'y'} ${y}`

const LEAD_TWIN = ['Mientras nacen nuevos lazos,', 'Con un ritmo que se afianza,', 'Con el ritmo que crece entre los dos,', 'Con un ritmo tan hondo entre los dos,']
const LEAD_DAILY = ['Hoy,', 'Mientras toma forma un ritmo,', 'Con tu ritmo en aumento,', 'Con un ritmo ya tan arraigado,']

/** {A}/{B}: the element with its article ("el agua"); {a}: bare ("agua"). */
const EL: Record<Element, string> = { fire: 'el fuego', water: 'el agua', air: 'el aire', earth: 'la tierra' }
const BARE: Record<Element, string> = { fire: 'fuego', water: 'agua', air: 'aire', earth: 'tierra' }

const REL: Record<Relation, readonly string[]> = {
  same: ['{A} encuentra su reflejo y duplica su fuerza', 'una misma corriente de {a} recorre a los dos'],
  allied: ['{A} y {B} se alimentan mutuamente', '{A} y {B} se dan aliento'],
  opposed: ['{A} y {B} tiran en direcciones opuestas', '{A} y {B} sacan chispas al chocar'],
  neutral: ['{A} y {B} se encuentran sin roces', '{A} y {B} guardan una distancia cortés'],
}
const fill = (t: string, a: Element, b: Element) => t.replace(/\{A\}/g, EL[a]).replace(/\{B\}/g, EL[b]).replace(/\{a\}/g, BARE[a])

const TONE: Record<Tone, readonly string[]> = {
  harmonious: ['el día sonríe a los dos', 'poco podrá resistirse a esta unión', 'lo que empiece codo a codo perdurará'],
  challenging: ['la fricción será la maestra del día', 'la honestidad valdrá más que la comodidad', 'conviene avanzar con tacto y escuchar dos veces'],
  balanced: ['el día puede inclinarse hacia cualquier lado', 'ninguna fuerza se impone, así que la elección es compartida', 'una atención constante lo decidirá'],
}

const ELEMENT_DAILY: Record<Element, readonly string[]> = {
  fire: ['actúa mientras el fuego aún arde', 'deja que tu valor marque el camino'],
  water: ['deja que lo que sientes guíe tus pasos', 'confía en lo que percibes bajo la superficie'],
  air: ['di lo que piensas con claridad', 'deja que una idea clara alce el vuelo'],
  earth: ['construye algo pequeño y duradero', 'mantén los pies en tierra firme'],
}

const LEAD = ['Detrás de ti,', 'Ante ti,', 'Más adelante,']
const TURN: Record<'up' | 'down', readonly string[]> = {
  up: ['{n} {aporta|aportan} {k}', '{n} {ofrece|ofrecen} {k}', '{n} {trae|traen} consigo {k}'],
  down: ['invertida la carta, {n} {enturbia|enturbian} la promesa de {k}', 'con la carta del revés, {n} {deja|dejan} fuera de alcance cualquier atisbo de {k}', 'del revés, {n} {repliega|repliegan} hacia dentro su mensaje de {k}'],
}
const CLOSE: Record<Verdict, readonly string[]> = {
  yes: ['Los augurios se inclinan hacia el sí.', 'El velo se abre y deja ver un sí.', 'Las estrellas están de tu lado.'],
  no: ['Los augurios se inclinan hacia el no.', 'El velo no se descorre y la respuesta se inclina hacia el no.', 'Las estrellas apartan la mirada.'],
  maybe: ['Los augurios no terminan de asentarse.', 'El velo tiembla y la respuesta sigue sin escribirse.', 'Las estrellas contienen el aliento.'],
}

export const prose: ProseKit = {
  daily(card, bucket: Bucket, pick) {
    const k1 = pick(card.keywords)
    const k2 = pick(card.keywords.filter((k) => k !== k1).concat(k1))
    const s1 = k1 === k2 ? `${Nm(card.name)} ${agree('{trae|traen}', card.name)} ${k1}.` : `${Nm(card.name)} ${agree('{trae|traen}', card.name)} ${and(k1, k2)}.`
    return `${s1} ${LEAD_DAILY[bucket]} ${pick(ELEMENT_DAILY[card.element])}.`
  },
  twin({ a, b, bridge, rel, tone, bucket }, pick) {
    const ka = pick(a.keywords), kb = pick(b.keywords), kg = pick(bridge.keywords)
    const pair = ka === kb ? ka : and(ka, kb)
    const s1 = `${Nm(a.name)} ${agree('{se encuentra|se encuentran}', a.name)} con ${nm(b.name)}: ${pair}, mientras ${fill(pick(REL[rel]), a.element, b.element)}.`
    const s2 = pick([
      `${Nm(bridge.name)} {tiende|tienden} un arco entre los dos y {ofrece|ofrecen} ${kg}.`,
      `Entre los dos {se alza|se alzan} ${nm(bridge.name)}, un puente de ${kg}.`,
      `${Nm(bridge.name)} {une|unen} a ambos y {trae|traen} consigo ${kg}.`,
    ].map((t) => agree(t, bridge.name)))
    return `${s1} ${s2} ${LEAD_TWIN[bucket]} ${pick(TONE[tone])}.`
  },
  oracle(cards, verdict, pick) {
    const parts = cards.map((d, i) => {
      const t = agree(pick(TURN[d.reversed ? 'down' : 'up']), d.card.name).replace('{n}', nm(d.card.name)).replace('{k}', pick(d.card.keywords))
      return `${LEAD[i]} ${t}.`
    })
    return `${parts.join(' ')} ${pick(CLOSE[verdict])}`
  },
}

export const es: Locale = { tag: 'es', native: 'Español', ui, deck, prose }
