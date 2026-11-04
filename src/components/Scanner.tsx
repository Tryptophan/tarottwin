import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { t } from '../i18n'

interface Detector {
  detect(src: CanvasImageSource): Promise<{ rawValue: string }[]>
}
declare global {
  interface Window {
    BarcodeDetector?: new (o: { formats: string[] }) => Detector
  }
}

/** Camera QR scanner. Calls onResult with decoded text (once per distinct value, rate-limited by caller). */
export default function Scanner({ onResult }: { onResult: (text: string) => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const cb = useRef(onResult)
  cb.current = onResult
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let raf = 0
    let stopped = false
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    async function start() {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setError(t.scanner.needsHttps)
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      } catch (e) {
        const n = (e as DOMException).name
        setError(
          n === 'NotAllowedError' || n === 'SecurityError'
            ? t.scanner.denied
            : n === 'NotFoundError' || n === 'OverconstrainedError'
              ? t.scanner.noCamera
              : t.scanner.failed,
        )
        return
      }
      if (stopped) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }
      const v = video.current!
      v.srcObject = stream
      await v.play().catch(() => {})
      const detector = window.BarcodeDetector ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null
      let busy = false
      const tick = async () => {
        if (stopped) return
        if (!busy && v.readyState >= 2 && v.videoWidth) {
          busy = true
          try {
            let text: string | null = null
            if (detector) {
              const r = await detector.detect(v)
              text = r[0]?.rawValue ?? null
            } else if (ctx) {
              const w = Math.min(640, v.videoWidth)
              const h = Math.round((v.videoHeight * w) / v.videoWidth)
              canvas.width = w
              canvas.height = h
              ctx.drawImage(v, 0, 0, w, h)
              text = jsQR(ctx.getImageData(0, 0, w, h).data, w, h)?.data ?? null
            }
            if (text && !stopped) cb.current(text)
          } catch {
            /* ignore frame errors */
          }
          busy = false
        }
        raf = requestAnimationFrame(tick)
      }
      tick()
    }
    start()
    return () => {
      stopped = true
      cancelAnimationFrame(raf)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  if (error) return <p className="scan-error" role="alert">{error}</p>
  return (
    <div className="scanner">
      <video ref={video} playsInline muted />
      <div className="scanner-frame" aria-hidden />
    </div>
  )
}
