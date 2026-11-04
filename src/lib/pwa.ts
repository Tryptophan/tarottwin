import { useSyncExternalStore } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { downloadForOffline } from './offline'
import { t } from '../i18n'

/**
 * The installable app: the browser's install prompt (caught early, offered from our own button) and
 * updates (a new service worker waits until the person reloads into it).
 */

interface InstallPrompt extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * How this browser installs Tarot Twin: `prompt` from a button, or by hand from the browser's own
 * menu (`ios`, `android`: Firefox, `mac`: Safari). `none` when it can't or already has.
 */
export type InstallWay = 'prompt' | 'ios' | 'android' | 'mac' | 'none'

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}

let deferred: InstallPrompt | null = null
let installed = false
let updateReady = false
let applying: ((reload?: boolean) => Promise<void>) | null = null

const standalone = () =>
  matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

function manualWay(): InstallWay {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/.test(ua) && /Firefox\//.test(ua)) return 'android'
  if (/Macintosh/.test(ua) && /Version\/(1[7-9]|[2-9]\d).*Safari/.test(ua)) return 'mac'
  return 'none'
}

function way(): InstallWay {
  if (installed || standalone()) return 'none'
  return deferred ? 'prompt' : manualWay()
}

/** Call before the first render: the install prompt fires once, early. */
export function initPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as InstallPrompt
    emit()
    // installable: start saving the cards now, so they are usually all there by the time it is installed
    void downloadForOffline()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    installed = true
    emit()
    void downloadForOffline() // installed: keep everything, cards included, for offline use
  })
  // an installed app opens in its own window (also how iOS "Add to Home Screen" shows up): finish any download
  if (standalone()) void downloadForOffline()
  applying = registerSW({
    onNeedRefresh() {
      updateReady = true
      emit()
    },
    onRegisteredSW(_url, reg) {
      if (!reg) return
      // an installed app can stay open for days: look for a new version now and then
      const check = () => void reg.update().catch(() => {})
      setInterval(check, 60 * 60 * 1000)
      document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && check())
    },
  })
}

/** Reloads into the waiting version. */
export function applyUpdate() {
  if (applying) void applying(true)
  else location.reload()
}

/** Shows the browser's install prompt; false if it isn't available (use the manual steps). */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  const d = deferred
  deferred = null
  emit()
  await d.prompt()
  return (await d.userChoice).outcome === 'accepted'
}

export const useInstallWay = () => useSyncExternalStore(subscribe, way)
export const useUpdateReady = () => useSyncExternalStore(subscribe, () => updateReady)

/** What to do by hand where there's no install prompt. */
export const INSTALL_STEPS: Record<Exclude<InstallWay, 'prompt' | 'none'>, string> = t.install
