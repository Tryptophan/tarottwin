import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles.css'
import OgImage from './OgImage'
import { applyDocumentLocale } from '../i18n'

applyDocumentLocale() // <html lang> picks the right CJK glyphs

createRoot(document.getElementById('root')!).render(<StrictMode><OgImage /></StrictMode>)
