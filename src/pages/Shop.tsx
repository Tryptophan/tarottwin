import { ATMOSPHERE, FEATURED, type Product } from '../data/shop'
import { assetUrl } from '../lib/foil'

function Buy({ p, short = false }: { p: Product; short?: boolean }) {
  return p.url
    ? <a className={`btn btn-gold btn-sm shop-buy${short ? ' shop-buy-short' : ''}`} href={p.url} aria-label={`${p.title} on Amazon`} target="_blank" rel="noopener noreferrer sponsored">{short ? 'View' : 'View on Amazon'}</a>
    : <span className="muted shop-soon">Coming soon</span>
}

export default function Shop() {
  return (
    <main className="page shop">
      <h1>Shop</h1>
      <section className="shop-hero">
        <img src={assetUrl('foil/back/art.webp')} alt="" width="110" draggable={false} />
        <div>
          <h2>{FEATURED.title}</h2>
          <p className="muted">{FEATURED.blurb}</p>
          <Buy p={FEATURED} />
        </div>
      </section>
      <h2 className="shop-h">Atmosphere</h2>
      <ul className="bond-list">
        {ATMOSPHERE.map((p) => (
          <li key={p.title} className="shop-item">
            <div><strong>{p.title}</strong><div className="muted">{p.blurb}</div></div>
            <Buy p={p} short />
          </li>
        ))}
      </ul>
      <p className="muted shop-note">As an Amazon Associate I earn from qualifying purchases.</p>
    </main>
  )
}
