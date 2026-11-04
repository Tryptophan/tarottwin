import type { Lang } from '.'

/**
 * Search and link-preview copy for each language's static page (`/`, `/es/`, `/pt/`…). Written into the built
 * HTML by `scripts/localize-html.ts`, so crawlers and link previews (which don't run JavaScript) see it.
 * The page title and description come from each locale's `ui.meta`; English keeps the copy in index.html.
 */
export interface Seo {
  /** og:locale, e.g. `pt_BR` */
  ogLocale: string
  keywords: string
  ogTitle: string
  ogDescription: string
  ogImageAlt: string
  /** Headline and subline drawn on the share image (`scripts/gen-og.mjs`). */
  ogHeadline: string
  ogSub: string
  /** JSON-LD WebApplication description. */
  appDescription: string
  /** The page body for crawlers without JavaScript. */
  noscriptTitle: string
  noscriptBody: string
  noscriptEnable: string
}

export const SEO: Record<Lang, Seo> = {
  en: {
    ogLocale: 'en_US',
    keywords: 'tarot, daily tarot, yes no tarot, tarot oracle, free oracle reading, ask the tarot a question, tarot card of the day, free tarot reading, couples tarot, love tarot, tarot for two, friendship tarot, tarot compatibility, tarot app',
    ogTitle: 'Tarot Twin – Free Daily Tarot, Yes/No Oracle & Reading for Two',
    ogDescription: 'Draw your daily tarot card, ask the yes/no oracle, then share a twin reading with a friend or partner.',
    ogImageAlt: 'Tarot Twin – four holographic tarot cards fanned out: daily tarot readings with friends',
    ogHeadline: 'Your daily\ntarot, for two',
    ogSub: 'Daily tarot readings with friends',
    appDescription: 'A free daily tarot card reading, a free yes/no tarot oracle, and a shared twin tarot reading for two people.',
    noscriptTitle: 'Tarot Twin – Free Daily Tarot Card Reading',
    noscriptBody: 'Tarot Twin is a free daily tarot app. Draw your tarot card of the day, ask the yes/no tarot oracle a question, read each card\'s meaning, and connect with a friend or partner to unlock a twin reading for two, complete with a shared bridge card about your connection.',
    noscriptEnable: 'Please enable JavaScript to draw your card.',
  },
  es: {
    ogLocale: 'es_LA',
    keywords: 'tarot, tarot diario, tarot gratis, tarot sí o no, oráculo de tarot, carta del día, lectura de tarot gratis, tarot de pareja, tarot del amor, tarot para dos, compatibilidad tarot, app de tarot',
    ogTitle: 'Tarot Twin – Tarot diario gratis, oráculo sí o no y lectura para dos',
    ogDescription: 'Saca tu carta de tarot del día, pregúntale al oráculo sí o no y comparte una lectura gemela con un amigo o tu pareja.',
    ogImageAlt: 'Tarot Twin – cuatro cartas de tarot holográficas en abanico: tarot diario con amigos',
    ogHeadline: 'Tu tarot diario,\npara dos',
    ogSub: 'Lecturas de tarot diarias con amigos',
    appDescription: 'Una lectura de tarot diaria gratis, un oráculo de tarot sí o no gratis y una lectura gemela compartida para dos personas.',
    noscriptTitle: 'Tarot Twin – Tarot diario gratis',
    noscriptBody: 'Tarot Twin es una app de tarot diario gratis. Saca tu carta del día, hazle una pregunta de sí o no al oráculo, lee el significado de cada carta y conéctate con un amigo o tu pareja para una lectura gemela, con una carta puente que habla de su conexión.',
    noscriptEnable: 'Activa JavaScript para sacar tu carta.',
  },
  pt: {
    ogLocale: 'pt_BR',
    keywords: 'tarô, tarot, tarô diário, tarô grátis, tarô sim ou não, oráculo de tarô, carta do dia, tiragem de tarô grátis, tarô para casais, tarô do amor, tarô a dois, compatibilidade, app de tarô',
    ogTitle: 'Tarot Twin – Tarô diário grátis, oráculo sim ou não e leitura a dois',
    ogDescription: 'Tire sua carta de tarô do dia, pergunte ao oráculo sim ou não e compartilhe uma leitura gêmea com um amigo ou seu par.',
    ogImageAlt: 'Tarot Twin – quatro cartas de tarô holográficas em leque: tarô diário com amigos',
    ogHeadline: 'Seu tarô diário,\na dois',
    ogSub: 'Leituras de tarô diárias com amigos',
    appDescription: 'Uma tiragem de tarô diária grátis, um oráculo de tarô sim ou não grátis e uma leitura gêmea compartilhada para duas pessoas.',
    noscriptTitle: 'Tarot Twin – Tarô diário grátis',
    noscriptBody: 'O Tarot Twin é um app de tarô diário grátis. Tire sua carta do dia, faça uma pergunta de sim ou não ao oráculo, leia o significado de cada carta e conecte-se com um amigo ou seu par para uma leitura gêmea, com uma carta-ponte sobre a conexão de vocês.',
    noscriptEnable: 'Ative o JavaScript para tirar sua carta.',
  },
  ja: {
    ogLocale: 'ja_JP',
    keywords: 'タロット, タロット占い, 無料タロット, 今日の運勢, 今日のタロット, イエスノー タロット, オラクル, 相性占い, 恋愛占い, ふたりで占う, タロットアプリ',
    ogTitle: 'Tarot Twin｜無料タロット占い・イエスノー・ふたりで占う相性リーディング',
    ogDescription: '今日のタロットカードを引いて、イエスノーで質問に答え、友達や恋人とふたりでツインリーディング。',
    ogImageAlt: 'Tarot Twin – 扇状に並んだ4枚のホログラムのタロットカード：友達と毎日タロット占い',
    ogHeadline: '毎日のタロットを\nふたりで',
    ogSub: '友達と楽しむ、毎日のタロット占い',
    appDescription: '無料の今日のタロット占い、イエスノー タロット、そしてふたりで占うツインリーディング。',
    noscriptTitle: 'Tarot Twin – 無料で毎日タロット占い',
    noscriptBody: 'Tarot Twin（タロットツイン）は無料の毎日タロット占いアプリです。今日のカードを引き、イエスノーで質問し、カードの意味を読み、友達や恋人とつながってツインリーディングを。ふたりの関係を映すブリッジカードも現れます。',
    noscriptEnable: 'カードを引くにはJavaScriptを有効にしてください。',
  },
  ko: {
    ogLocale: 'ko_KR',
    keywords: '타로, 무료 타로, 오늘의 타로, 오늘의 운세, 예스노 타로, 타로 오라클, 커플 타로, 연애 타로, 궁합, 둘이 보는 타로, 타로 앱',
    ogTitle: 'Tarot Twin 타로 트윈 – 무료 오늘의 타로, 예스노 타로, 둘이 보는 트윈 리딩',
    ogDescription: '오늘의 타로 카드를 뽑고, 예스노 오라클에 물어보고, 친구나 연인과 트윈 리딩을 함께 보세요.',
    ogImageAlt: 'Tarot Twin – 부채꼴로 펼친 홀로그램 타로 카드 네 장: 친구와 함께 보는 오늘의 타로',
    ogHeadline: '오늘의 타로,\n둘이 함께',
    ogSub: '친구와 함께 보는 매일의 타로',
    appDescription: '무료 오늘의 타로 리딩, 무료 예스노 타로 오라클, 그리고 두 사람이 함께 보는 트윈 타로 리딩.',
    noscriptTitle: 'Tarot Twin – 무료 오늘의 타로',
    noscriptBody: 'Tarot Twin(타로 트윈)은 무료 오늘의 타로 앱이에요. 오늘의 카드를 뽑고, 예스노 오라클에 질문하고, 카드의 의미를 읽고, 친구나 연인과 연결해 두 사람의 인연을 보여 주는 브릿지 카드가 담긴 트윈 리딩을 열어 보세요.',
    noscriptEnable: '카드를 뽑으려면 JavaScript를 켜 주세요.',
  },
  pl: {
    ogLocale: 'pl_PL',
    keywords: 'tarot, darmowy tarot, tarot dzienny, karta dnia, tarot tak czy nie, wyrocznia tarota, darmowe wróżenie, tarot dla par, tarot miłosny, tarot we dwoje, zgodność, aplikacja tarot',
    ogTitle: 'Tarot Twin – darmowy tarot dzienny, wyrocznia tak czy nie i rozkład we dwoje',
    ogDescription: 'Wylosuj kartę dnia, zapytaj wyrocznię tak czy nie i podziel się rozkładem bliźniaczym z przyjacielem lub partnerem.',
    ogImageAlt: 'Tarot Twin – cztery holograficzne karty tarota w wachlarzu: codzienny tarot z przyjaciółmi',
    ogHeadline: 'Twój tarot\nna każdy dzień,\nwe dwoje',
    ogSub: 'Codzienny tarot z przyjaciółmi',
    appDescription: 'Darmowa karta tarota na każdy dzień, darmowa wyrocznia tak czy nie i wspólny rozkład bliźniaczy dla dwojga.',
    noscriptTitle: 'Tarot Twin – darmowy tarot dzienny',
    noscriptBody: 'Tarot Twin to darmowa aplikacja z tarotem na każdy dzień. Wylosuj kartę dnia, zadaj wyroczni pytanie tak czy nie, przeczytaj znaczenie każdej karty i połącz się z przyjacielem lub partnerem, by odkryć rozkład bliźniaczy z kartą-mostem o waszej więzi.',
    noscriptEnable: 'Włącz JavaScript, aby wylosować kartę.',
  },
}
