# Proyecto Agrícola

Demo web y Android de apoyo a decisiones agrícolas. Compara **tres estrategias por caso** mediante calendario, clima histórico NASA POWER, restricciones y presupuestos trazables. Nombre provisional configurable en `product.json`.

**Casos ficticios, clima real.** No son establecimientos identificados ni recomendaciones agronómicas validadas. No existe afiliación oficial con NASA.

## Probar

Node 24 y npm, desde un clon limpio:

```bash
npm ci
npm run dev
```

Para probar la versión de entrega y su modo sin conexión:

```bash
npm run build
npm run preview
```

Abrir la URL indicada. En web, esperar a que termine la primera carga con conexión; el service worker guarda aplicación y tres respaldos NASA. La versión nueva se activa cuando se cierran las pestañas anteriores. En Android, los datos están incluidos en el APK.

## Tres contextos, distintas decisiones

| Caso ficticio | Contexto | Lectura demostrable bajo los supuestos |
|---|---|---|
| Itapúa | 120 ha propias; prioridad margen | Práctica actual: neto base USD 66.840; déficit máximo USD 82.920 |
| Alto Paraná | 50 ha alquiladas; USD 500/ha de tierra y capital limitado | Práctica actual: neto base −USD 13.965; déficit USD 67.005 frente a USD 45.000 disponibles |
| Caaguazú | 15 ha propias; prioridad suelo/agua | Cobertura: 342 días con cultivo programado frente a 234; costo adicional USD 2.250; comprador de maíz no disponible en el supuesto |

La app muestra los intercambios y datos faltantes; no elige un ganador. Los rendimientos, precios, calendarios y restricciones se inventaron para explorar decisiones, con autorización del propietario del proyecto. [Casos y reproducción](docs/CASES.md).

## Funciones

- Lote, tenencia, tierra por horizonte, capital y prioridades editables.
- Tres calendarios con hasta ocho ciclos cada uno, residuos y detección de solapamientos.
- NASA POWER: consulta real, respaldo incluido o caché elegida explícitamente. Unidades, faltantes, cobertura, fuente, fecha y SHA-256 visibles.
- Lluvia, días secos, rachas y calor con umbrales editables. Series mensuales y exposición por ciclo; historial no es pronóstico.
- Restricciones de maquinaria, experiencia y comprador; reglas explicables sin puntaje opaco.
- Presupuestos incompletos permitidos, sensibilidad baja/base/alta y caja con fechas.
- Referencias/ventas CSV, exportación CSV y dossier JSON con plan y clima; validación al importar.
- Persistencia local, recuperación de archivos dañados y funcionamiento sin conexión.

## Verificar

```bash
npm run format:check
npm test
npx playwright install chromium
npm run test:ui
npm run report:cases
```

`test:ui` compila y prueba la versión de producción, incluido offline. Consulta real opcional (requiere red y disponibilidad del proveedor): `npm run test:live`. CI comprueba web y genera APK debug como artefacto. [Evidencia y límites](docs/VALIDATION.md).

## Documentación central

- [Roadmap y estado exacto](ROADMAP.md), [backlog](docs/BACKLOG.md).
- [Arquitectura](docs/ARCHITECTURE.md), [modelo económico](docs/CALCULATIONS.md), [reglas](docs/RULES.md).
- [Fuentes y datos](docs/SOURCES.md), [evaluación SMAP/Landsat](docs/SECOND-SOURCE.md).
- [Guion de tres minutos](docs/DEMO.md), [Android](ANDROID.md), [cambiar nombre](docs/BRANDING.md).
- [Contribuir](CONTRIBUTING.md), [variables futuras](docs/PRODUCT.md).

`src/planner/` contiene el producto actual; `src/calc.ts` es el motor económico compartido. El prototipo previo sigue accesible con `/?legacy` y `/?legacy&android`, sin migración automática de planes. `public/data/` conserva los originales NASA; no reformatearlos porque cambia su hash. PROTOTYPE-* es documentación histórica.

SDK, claves, APK, cachés y archivos sincronizados de ChatGPT no se versionan. Licencia propia pendiente de elección del propietario; dependencias y fuentes conservan sus licencias. Antes de usar en decisiones reales faltan revisión agronómica local y pruebas de campo.
