# Verificación inicial — 2026-11-09

- `npm test`: 7 pruebas pasan (presupuesto conocido, escala por área, sensibilidad, costos adicionales, denominadores cero, equilibrio por campaña y CSV).
- `npm run build`: TypeScript y Vite pasan.
- `npm run test:ui`: 3 recorridos pasan en Chromium: edición/persistencia/comparación/exportación/restablecimiento; anchos 320/390/430; disponibilidad de escritorio.
- Captura móvil inspeccionada después de cambiar marca y etiquetas.

Se corrigieron exportación web fuera del horizonte, mezcla de cifras base/ajustadas, escape CSV, marca dispersa, moneda sin conversión y métricas de equilibrio mezclando campañas. Mayor costo de campaña ya no se presenta como necesidad real de capital. La sección agronómica se identifica como contenido educativo pendiente de reglas.

Limitaciones: no hay prueba en Android físico ni nuevo APK certificado en esta entrega; no hay integración NASA real, validación agronómica, auditoría de seguridad integral o prueba con productores. CI remoto se define en .github/workflows/ci.yml; comprobar su resultado en Actions, no inferirlo de estas pruebas locales.

El primer intento de UI encontró un puerto ocupado; las pruebas definitivas usan 5197. El entorno restringido requirió ejecutar navegador/servidor con permisos locales adicionales. Esto no es requisito del producto.
