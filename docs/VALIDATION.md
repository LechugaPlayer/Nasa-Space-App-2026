# Verificación de entrega

Fecha: 2026-11-10. Las afirmaciones siguientes distinguen software probado y validación externa pendiente.

## Evidencia ejecutada

- 28 pruebas de dominio: fechas reales/bisiestos, estructuras inválidas, independencia entre estrategias, solapamientos, economía contrastada manualmente, tierra una vez, caja, cobertura sin ventas, costos pendientes, sensibilidad, CSV y almacenamiento dañado.
- 10 recorridos Playwright sobre build de producción: tres casos, NASA respaldado, fallo HTTP, incompatibilidad de ubicación, umbrales inválidos/corrección, referencias de precio, dossier, recuperación, móvil/escritorio y regresión del prototipo.
- Recorrido offline: aplicación recargada con red bloqueada; los tres respaldos verifican 365 días; comparación y CSV funcionan.
- Consulta real NASA desde Chromium: CORS, datos y procedencia pasan (`playwright.live.config.ts`). Es una prueba puntual, no garantía de disponibilidad continua.
- Compilación TypeScript/Vite pasa; capturas móvil/escritorio inspeccionadas.
- APK debug compila con JDK 21 y SDK local; checksum junto al APK. Firma/manifest se verifican en el procedimiento Android.
- Instalación de dependencias informa cero vulnerabilidades conocidas en el momento de esta entrega; no equivale a auditoría de seguridad.

## Fallos encontrados y corregidos

Objetos compartidos entre plantillas alteraban presupuestos de otras estrategias; tests independientes lo detectaron. El caché offline no coincidía con solicitudes de módulos por `Vary: Origin`; se corrigió para los recursos estáticos propios. Etiquetas implícitas de select incluían texto de opciones; ahora usan asociación explícita. Capacitor necesitaba atributo de importación JSON. El script Android generaba APK pero fallaba al calcular hash en un PowerShell sin Get-FileHash; ahora usa SHA-256 de .NET.

Los recorridos de entrega usan preview de producción, no dependen de recompilación/HMR del servidor de desarrollo. No compilar dist mientras se ejecutan pruebas sobre él.

## No verificado ni afirmado

Teléfono físico, interacción de compartir nativo, teclado real, modo avión nativo, resultados agronómicos, entrevistas, ahorro real y calibración de cultivos. El test unitario Java de plantilla no sustituye estos puntos. SMAP/Landsat solo se verificaron a nivel de catálogo. CI remoto se comprueba en Actions por commit; no inferir su estado de las pruebas locales.

## Reproducir

`npm ci`; `npm run format:check`; `npm test`; `npx playwright install chromium`; `npm run test:ui`; `npm run report:cases`. Para red real: `npm run test:live`. Para APK: ANDROID.md.
