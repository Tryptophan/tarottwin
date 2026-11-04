import { assetUrl } from '../lib/foil'

export function Logo({ size = 48 }: { size?: number }) {
  return (
    <img
      className="logo"
      src={assetUrl('favicon.svg')}
      width={size}
      height={size}
      alt="Tarot Twin"
    />
  )
}
