import { useMemo } from 'react'
import { mulberry32 } from '../lib/rng'

export function Starfield() {
  const stars = useMemo(() => {
    const r = mulberry32(777)
    return Array.from({ length: 56 }, (_, i) => ({
      id: i,
      left: r() * 100,
      top: r() * 100,
      size: 1 + r() * 2,
      delay: r() * 6,
      dur: 3 + r() * 5,
      gold: r() > 0.8,
    }))
  }, [])
  return (
    <div className="starfield" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className={s.gold ? 'star star-gold' : 'star'}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
    </div>
  )
}
