# ADR 002 — Segunda evidencia NASA

Decisión: evaluación terminada; **integración diferida** para esta demo, conforme al criterio opcional M5. Si se retoma, evaluar primero Landsat para contrastar presencia de vegetación con calendario; no interpretar NDVI como rendimiento o residuos.

## Evidencia de acceso del 2026-11-09

- SMAP: consulta pública CMR, `short_name=SPL3SMP`, versión 009, 2024-07-01 a 02, bbox −56,−28,−55,−27. Devolvió `SMAP_L3_SM_P_20240701_R19240_002.h5`, colección NSIDC, tamaño indicado ~33,6 MB, enlace de descarga protegido. **Se leyó metadata, no el raster.** [Producto y resolución de 36 km](https://nsidc.org/data/spl3smp/versions/9); [acceso Earthdata](https://nsidc.github.io/NSIDC-Data-Cookbook/reference-guides/access-data.html).
- Landsat: STAC USGS `landsat-c2l2-sr`, mismo bbox, julio 2024, límite 1. Devolvió 14 coincidencias y la escena `LC09_L2SP_225079_20240731_20240801_02_T1_SR`; nubosidad de escena 83,26%. El bbox es regional y no demuestra validez de un píxel del lote. **No se descargaron bandas ni se calculó NDVI.** [Acceso](https://www.usgs.gov/landsat-missions/landsat-data-access), [reflectancia superficial de 30 m](https://www.usgs.gov/landsat-missions/landsat-collection-2-surface-reflectance).

## Motivo

SMAP aporta contexto regional, no humedad de raíces del lote; requiere autenticación/procesamiento. Landsat necesita selección temporal, máscara QA de nubes/sombras, escala/offset y agregación espacial. Una escena con mucha nubosidad no basta. Los tres casos ficticios carecen de polígono y observaciones de campo para contrastar vegetación.

No hay todavía una decisión validada que mejore por introducir esta segunda fuente. POWER ya satisface evidencia climática reproducible. Mostrar un raster decorativo o convertirlo en precisión de lote no cumpliría el estándar.

## Reabrir cuando

Existan polígono autorizado, pregunta verificable, series suficientes, pruebas de calidad, procedimiento de acceso y presupuesto de procesamiento. Mantener resolución original, atribución, fechas, faltantes y trazabilidad. R19 está cumplido; R20 queda diferido, no implementado.
