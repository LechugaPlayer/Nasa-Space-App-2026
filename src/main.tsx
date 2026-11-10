import product from '../product.json'
import React, { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { ErrorBoundary } from './ErrorBoundary'
const Planner = lazy(() => import('./planner/Planner'))
const App = lazy(() => import('./App'))
const MobileApp = lazy(() => import('./MobileApp'))
const params = new URLSearchParams(window.location.search)
const legacy = params.has('legacy'),
  mobile = params.has('android') || Capacitor.isNativePlatform()
document.title = `${product.name} | Decisiones agrícolas`
if (legacy) {
  if (mobile) document.documentElement.classList.add('mobile-root')
  else void import('./style.css')
}
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<p>Cargando aplicación…</p>}>
        {legacy ? mobile ? <MobileApp /> : <App /> : <Planner />}
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
)
if (import.meta.env.PROD && !Capacitor.isNativePlatform() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(import.meta.env.BASE_URL + 'sw.js')
      .catch((error) => console.warn('Offline installation unavailable', error))
  })
}
