import { ATMOSPHERE, FEATURED, type Product } from '../data/shop'
import { Logo } from '../components/Logo'
import { t } from '../i18n'

function Buy({ p, short = false }: { p: Product; short?: boolean }) {
  return p.url
    ? <a className={`btn btn-gold btn-sm shop-buy${short ? ' shop-buy-short' : ''}`} href={p.url} aria-label={t.shop.onAmazonAria(p.title)} target="_blank" rel="noopener noreferrer sponsored">{short ? t.shop.view : t.shop.viewOnAmazon}</a>
    : <span className="muted shop-soon">{t.shop.comingSoon}</span>
}

export default function Shop() {
  return (
    <main className="page shop">
      <h1>{t.shop.title}</h1>
      <section className="shop-hero">
        <Logo size={110} />
        <div>
          <h2>{FEATURED.title}</h2>
          <p className="muted">{FEATURED.blurb}</p>
          <Buy p={FEATURED} />
        </div>
      </section>
      <h2 className="shop-h">{t.shop.atmosphere}</h2>
      <ul className="bond-list">
        {ATMOSPHERE.map((p) => (
          <li key={p.title} className="shop-item">
            <div><strong>{p.title}</strong><div className="muted">{p.blurb}</div></div>
            <Buy p={p} short />
          </li>
        ))}
      </ul>
      <p className="muted shop-note">{t.shop.associate}</p>
    </main>
  )
}
