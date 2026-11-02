import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './app/App.tsx'
import { requestPersistence } from './lib/device.ts'
import { trackLastOnline } from './lib/online.ts'

// Ask the browser to keep the app's saved data rather than clearing it out
// when the phone is short of space.
void requestPersistence()

// Keep a note of when this device last had a connection, for the Info screen.
trackLastOnline()

// Outline the whole app in amber while this is a development build.
const root = document.getElementById('root')!
if (import.meta.env.DEV) root.classList.add('dev-build')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
