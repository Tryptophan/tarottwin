import { useMemo } from 'react'
import { mulberry32 } from '../lib/rng'

export function Sparkles({ burst, ambient = false }: { burst: number; ambient?: boolean }) {
  const parts = useMemo(() => {
    const r = mulberry32(burst * 7919 + 13)
    return Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2 + r() * 0.4
      const d = 50 + r() * 70
      return {
        id: i,
        dx: Math.cos(a) * d,
        dy: Math.sin(a) * d,
        size: 3 + r() * 5,
        delay: r() * 0.12,
      }
    })
  }, [burst])
  const motes = useMemo(() => {
    const r = mulberry32(4242)
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: 5 + r() * 90,
      size: 2 + r() * 3,
      delay: r() * 6,
      dur: 5 + r() * 5,
    }))
  }, [])
  return (
    <div className="sparkles" aria-hidden="true">
      {ambient &&
        motes.map((m) => (
          <span
            key={`m${m.id}`}
            className="mote"
            style={{ left: `${m.left}%`, width: m.size, height: m.size, animationDelay: `${m.delay}s`, animationDuration: `${m.dur}s` }}
          />
        ))}
      {burst > 0 &&
        parts.map((p) => (
          <span
            key={`${burst}-${p.id}`}
            className="spark"
            style={
              {
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
              } as React.CSSProperties
            }
          />
        ))}
    </div>
  )
}
