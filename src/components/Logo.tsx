export function Logo({ size = 48 }: { size?: number }) {
  return (
    <img
      className="logo"
      src={`${import.meta.env.BASE_URL}favicon.svg`}
      width={size}
      height={size}
      alt="Tarot Twin"
    />
  )
}
