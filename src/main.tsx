import product from '../product.json'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import MobileApp from './MobileApp'
import { Capacitor } from '@capacitor/core'

document.title = `${product.name} | Calculadora agrícola`
const mobile = Capacitor.isNativePlatform() || new URLSearchParams(window.location.search).has('android')
if (mobile) document.documentElement.classList.add('mobile-root')
else void import('./style.css')
createRoot(document.getElementById('root')!).render(<React.StrictMode>{mobile ? <MobileApp /> : <App />}</React.StrictMode>)
