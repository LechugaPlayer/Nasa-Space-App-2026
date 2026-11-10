# Roadmap — estado de la demo

Actualización: 2026-11-10. El alcance inicial se conserva en `docs/PROTOTYPE-ROADMAP.md`. El propietario autorizó reemplazar el caso de productor real por **tres casos ficticios contrastantes**, porque trabaja solo y no dispone de asesor. Esta adaptación permite cerrar el desarrollo demostrativo, pero no equivale a validación de campo.

## Estado por hito

| Hito | Estado | Evidencia / límite |
|---|---|---|
| M0 · Caso y evidencia | Casos demo definidos; revisión externa pendiente | Tres casos, catálogo acotado, datos originales y procedencia. No entrevistas inventadas |
| M1 · Calendario | Implementado y probado | Lote, fechas, residuos, tres alternativas, solapamientos, móvil/escritorio |
| M2 · NASA | Implementado y probado | Consulta real desde navegador; tres años-localidad de 365 días; SHA-256; caché; faltantes; modo offline |
| M3 · Estrategias | Motor explicable implementado; viabilidad local pendiente | Restricciones, prioridades, señales e intercambios; plantillas no certificadas |
| M4 · Economía | Implementado y probado | Caja fechada, tierra una vez, sensibilidad, CSV con fuente y presupuestos incompletos |
| M5 · Segunda fuente | Evaluación terminada; integración diferida | Acceso a catálogos SMAP/Landsat probado; decisión documentada, sin raster ni índices inventados |
| M6 · Entrega | Software verificado; teléfono físico/campo pendientes | Tests, offline, build, APK debug, CI, guion y documentación |

## Checklist trazable

- [x] R01: tres contextos ficticios contrastantes aceptados por el propietario; misma pregunta de comparación.
- [ ] R02: catálogo y fechas ilustrativas implementados; revisión con profesional local no disponible. Etapas fenológicas no inferidas.
- [x] R03: procedencia, unidades, período, resolución, atribución e integridad documentados.
- [x] R04: modelo de lote, ciclos, fechas, manejo informado y residuos.
- [x] R05: calendario mensual con fechas editables y navegación móvil.
- [x] R06: práctica actual y dos variantes bajo un horizonte común.
- [x] R07: NASA POWER histórico; validación de consulta, respuesta, errores y faltantes.
- [x] R08: acumulados, días secos, rachas y calor con umbrales visibles.
- [x] R09: serie mensual, fuente, escala, fecha de consulta y cobertura.
- [x] R10: tres respaldos reales con SHA-256; incluidos en web offline y APK.
- [x] R11: prioridades y restricciones operativas editables.
- [ ] R12: dos plantillas por caso implementadas; factibilidad agronómica pendiente de revisión local.
- [x] R13: comparación de cobertura programada, familias, exposición y restricciones declaradas.
- [x] R14: cada señal remite a regla, límites, intercambios y faltantes.
- [x] R15: motor económico reutilizado por ciclo/estrategia.
- [x] R16: ventas/referencias CSV con cultivo, fecha, mercado, moneda, unidad y tipo.
- [x] R17: costos, recursos en notas, ingresos y pagos/cobros separados; tierra por horizonte.
- [x] R18: sensibilidad baja/base/alta, equilibrio por ciclo y presupuesto pendiente.
- [x] R19: comparación de acceso/cobertura/esfuerzo SMAP y Landsat.
- [ ] R20: diferido conforme a la cláusula opcional del roadmap; ver `docs/SECOND-SOURCE.md`.
- [x] R21: pruebas de fechas, reglas, costos, faltantes, archivos y escenarios límite.
- [ ] R22: persistencia, exportación y offline verificados en Chromium; teléfono Android físico pendiente.
- [x] R23: CI web/Android y APK debug compilado con checksum. Firma debug no reproducible bit a bit entre máquinas.
- [x] R24: documentación, atribuciones, límites y guion de tres minutos.

## Criterios que siguen abiertos

1. Revisión agronómica: validar calendarios, cultivos, manejo y restricciones con un asesor local. Registrar correcciones y fuentes; no cerrar R02/R12 por pruebas de software.
2. Android físico: instalación, teclado/fechas, botón atrás, compartir, modo avión y reabrir app. Checklist en ANDROID.md.
3. Campo: entrevistas y resultados observados antes de afirmar ahorro, precisión agronómica o utilidad real.
4. M5 solo se reabre con pregunta concreta y acceso/procesamiento sostenibles. No añadir una imagen satelital para aparentar precisión.

## Fuera de alcance

Prescripción de insumos, rendimiento predicho, riego recomendado, marketplace, cuentas multiusuario, sincronización, maquinaria conectada y optimización opaca. Futuras variables se registran en docs/PRODUCT.md y requieren validación antes de influir en resultados.
