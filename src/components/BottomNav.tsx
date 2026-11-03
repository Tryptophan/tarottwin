import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

const svg = (children: ReactNode) => (
  <svg className="nav-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const ITEMS = [
  {
    to: '/', label: 'Daily', end: true,
    // crescent moon with a small star
    icon: svg(<>
      <path d="M19 14.5A8 8 0 0 1 9.5 5a8 8 0 1 0 9.5 9.5z" />
      <path d="M17 3.5v3M15.5 5h3" />
    </>),
  },
  {
    to: '/twin', label: 'Twin', end: false,
    // two overlapping circles (vesica piscis)
    icon: svg(<>
      <circle cx="9" cy="12" r="6" />
      <circle cx="15" cy="12" r="6" />
    </>),
  },
  {
    to: '/bonds', label: 'Bonds', end: false,
    // infinity knot
    icon: svg(<path d="M12 12c-2-3-3.5-4.5-5.5-4.5a4.5 4.5 0 0 0 0 9c2 0 3.5-1.500 5.500-4.500zm0 0c2 3 3.500 4.500 5.500 4.500a4.500 4.500 0 0 0 0-9c-2 0-3.500 1.500-5.500 4.500z" />),
  },
  {
    to: '/collection', label: 'Cards', end: false,
    // a fanned pair of cards; the back card is masked where the front one overlaps, so no fill is needed
    icon: svg(<>
      <mask id="nav-cards-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#fff" />
        <rect x="9.500" y="4" width="10" height="15" rx="2" transform="rotate(8 14.500 11.500)" fill="#000" stroke="#000" strokeWidth="3" />
      </mask>
      <rect x="4.5" y="5" width="10" height="15" rx="2" transform="rotate(-10 9.500 12.500)" mask="url(#nav-cards-cut)" />
      <rect x="9.500" y="4" width="10" height="15" rx="2" transform="rotate(8 14.500 11.500)" />
    </>),
  },
  {
    to: '/shop', label: 'Shop', end: false,
    // shopping bag
    icon: svg(<>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6.500a3 3 0 0 1 6 0V8" />
    </>),
  },
  {
    to: '/settings', label: 'Settings', end: false,
    // sliders
    icon: svg(<>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>),
  },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {ITEMS.map((i) => (
        <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => (isActive ? 'active' : '')}>
          {i.icon}
          <span>{i.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
