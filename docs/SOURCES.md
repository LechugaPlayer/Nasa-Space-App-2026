# Fuentes y antecedentes

## Integración implementada (2026-11-10)

Tres respuestas originales NASA POWER en `public/data/power-*.json`, con índice de consultas, fechas de descarga, hash SHA-256, fuentes y versión API en `public/data/index.json`. No reformatear esos originales. `scripts/archive-power.mjs --refresh` hace nuevas consultas; sin esa opción verifica originales y hashes sin modificar fechas de procedencia. Descargar de nuevo requiere la opción explícita --refresh y validar las tres respuestas antes de escribir archivos.

Período 2024-07-01 a 2025-06-30, UTC; comunidad AG. Variables PRECTOTCORR (mm/day), T2M_MAX/T2M_MIN (C). Fuente declarada por la respuesta: MERRA2/POWER. Faltante declarado por API: −999; se normaliza a null y nunca a cero. Temperatura mínima se conserva en el original aunque la señal de calor usa máxima.

[Contrato Daily API](https://power.larc.nasa.gov/docs/services/api/temporal/daily/), [unidades, escala y origen](https://power.larc.nasa.gov/docs/faqs/data/), [política NASA de datos](https://science.data.nasa.gov/about/license). Datos científicos públicos de POWER, atribuidos a NASA LaRC; no se extiende una licencia de la app a proveedores ni se presupone que todos los productos NASA tengan idénticos términos. No se incluyeron datos comerciales ajenos. Catálogos SMAP/Landsat y límites: SECOND-SOURCE.md.

Los casos geográficos y presupuestos son ficticios, no extraídos de fincas privadas. Coordenadas son puntos regionales de consulta. La procedencia del clima no valida los supuestos económicos o agronómicos.

## Investigación inicial

Revisión: 2026-11-09. Se encontró un roadmap local previo, conservado en PROTOTYPE-ROADMAP.md. No se encontró un roadmap universal listo para copiar que cubra todas las decisiones agrícolas. El roadmap del proyecto es una adaptación propia, no una metodología oficial de NASA.

| Fuente primaria | Uso propuesto | Límites |
|---|---|---|
| [farmOS: contribución y roadmaps](https://farmos.org/community/contributing/) | Antecedente de backlog modular agrícola | No es un modelo agronómico |
| [FAO AquaCrop](https://www.fao.org/aquacrop/overview/about-aquacrop/) | Respuesta al agua y comparación de manejo | Requiere parámetros y validación; no integrado |
| [FAO-56, 1998](https://www.fao.org/4/X0490E/X0490E00.htm) | Evapotranspiración y necesidades de agua | [FAO informa una revisión](https://www.fao.org/land-water/news/detail/Join-webinar-Main-Innovations-in-the-Revised-FAO-Irrigation-and-Drainage-Paper-56-Guidelines-for-Computing-Crop-Water-Requirements-13-April-2026/en); elegir/versionar método antes de implementar |
| [NASA POWER: datos](https://power.larc.nasa.gov/docs/faqs/data/) | Primera integración: historia meteorológica | Escala original, no sensor del lote; unidades por comunidad |
| [POWER: fuentes](https://power.larc.nasa.gov/docs/methodology/data/sources_fluxes/) | Producto y resolución | No asumir igual resolución para toda variable |
| [NASA: catálogo POWER](https://data.nasa.gov/dataset/prediction-of-worldwide-energy-resources-power) | Procedencia y atribución | Conservar atribución NASA LaRC POWER |
| [DSSAT](https://dssat.net/frontpage/) | Simulación futura | Evaluar requisitos, licencia y calibración; no integrado |
| [Vite](https://vite.dev/guide/) y [Capacitor](https://capacitorjs.com/docs/getting-started/environment-setup) | Stack | Versiones fijadas en lockfile |

Antes de integrar: guardar proveedor, URL exacta, producto/versión, licencia, atribución, escala espacial, fechas de observación/consulta, zona horaria, unidades, faltantes, calidad, transformaciones y hash del original. Distinguir observado, modelado, informado y supuesto. Verificar redistribución antes de guardar respaldo público.

Probar caída de red, rango vacío, datos parciales y caché vencido. Nunca sustituir un fallo por datos ficticios. SMAP/Landsat y fuentes comerciales siguen pendientes de evaluación específica.

