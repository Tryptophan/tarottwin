import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function QrCode({ text, size = 240 }: { text: string; size?: number }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    let alive = true
    QRCode.toDataURL(text, { width: size * 2, margin: 2, errorCorrectionLevel: 'M' })
      .then((u) => alive && setUrl(u))
      .catch(() => alive && setUrl(''))
    return () => {
      alive = false
    }
  }, [text, size])
  return url ? (
    <img className="qr" src={url} width={size} height={size} alt="Your Tarot Twin QR code" />
  ) : (
    <div className="qr" style={{ width: size, height: size }} />
  )
}
