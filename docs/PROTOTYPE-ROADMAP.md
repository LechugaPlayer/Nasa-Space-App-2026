# Rotación — roadmap de demo técnica

## Objetivo
Comparar la rotación actual y dos alternativas viables mediante un calendario, evidencia ambiental NASA, restricciones locales y consecuencias económicas explícitas. Apoyar el juicio profesional sin presentar escenarios como pronósticos.

## Alcance
Una zona piloto de Paraguay, un establecimiento, un horizonte de 12–18 meses y un catálogo pequeño revisado localmente. Android y navegador comparten lógica. Sin cuentas ni backend permanente inicialmente. Los tiempos siguientes son estimaciones de trabajo para una persona con experiencia y revisión agronómica puntual, no compromisos de entrega.

## Hitos e issues propuestos

### M0 — Definir el caso y la evidencia (2–3 días)
- [ ] R01: Elegir establecimiento piloto, calendario actual y pregunta de adaptación.
- [ ] R02: Definir catálogo de cultivos, etapas aproximadas y restricciones con un profesional local.
- [ ] R03: Registrar fuentes, unidades, licencias, resolución, períodos y límites de cada producto.
Aceptación: caso reproducible y documentación de qué es observado, informado y supuesto.

### M1 — Calendario como centro (4–6 días)
- [ ] R04: Modelar lote, ciclo de cultivo, fechas, manejo, cobertura y residuos informados.
- [ ] R05: Crear calendario mensual con ventanas entre cultivos y edición accesible en móvil.
- [ ] R06: Comparar práctica actual y dos variantes bajo el mismo horizonte.
Aceptación: cambiar fechas actualiza las tres líneas; solapamientos se explican; ausencia de cultivo vivo no se etiqueta automáticamente como suelo desnudo.

### M2 — NASA real y reproducible (4–7 días)
- [ ] R07: Integrar NASA POWER histórico para ubicación y período; gestionar unidades, faltantes y errores.
- [ ] R08: Calcular acumulados, días secos y exposición a calor usando umbrales documentados y editables.
- [ ] R09: Mostrar series, fuente, resolución espacial, fecha de consulta y cobertura temporal.
- [ ] R10: Guardar un conjunto real de respaldo con procedencia para la presentación sin conexión.
Aceptación: indicadores reproducibles desde datos conservados; caché identificado; nunca sustituir silenciosamente por datos ficticios; explicar que historial no es pronóstico.

### M3 — Estrategias explicables (4–6 días)
- [ ] R11: Registrar prioridades de agua, suelo y continuidad económica; maquinaria, experiencia y comprador.
- [ ] R12: Crear dos variantes desde plantillas viables, manteniendo la estrategia actual.
- [ ] R13: Comparar cobertura informada, diversidad, exposición histórica y viabilidad operativa.
- [ ] R14: Mostrar por estrategia evidencia, beneficio potencial, intercambio, información faltante y revisión local.
Aceptación: cada señal tiene una regla trazable; prioridades no se convierten en un puntaje opaco; no inferir rendimiento, nitrógeno ni salud del suelo directamente de una señal climática.

### M4 — Contexto económico acotado (3–5 días)
- [ ] R15: Reutilizar el motor de cálculo como detalle de cada estrategia.
- [ ] R16: Incorporar venta previa del productor y referencias CSV con fecha, mercado, moneda y unidad.
- [ ] R17: Separar costos adicionales, recursos aprovechables, ingresos y momento aproximado del cobro.
- [ ] R18: Comparar precio/rendimiento bajo, base y alto; mostrar equilibrio y datos económicos pendientes.
Aceptación: fuentes comerciales y supuestos diferenciados; no confundir precio internacional con precio neto local; una cobertura puede tener costo y cero ventas; no exigir presupuesto completo para explorar.

### M5 — Segunda evidencia NASA opcional (3–6 días)
- [ ] R19: Probar acceso, cobertura y esfuerzo de SMAP frente a Landsat; elegir solo uno.
- [ ] R20: SMAP: contexto regional de humedad y anomalías con referencia temporal explícita; o Landsat: evolución de vegetación contrastada con calendario y residuos informados.
Aceptación: conservar escalas y fechas originales; no fabricar precisión de lote mediante remuestreo; documentar faltantes y nubes donde corresponda. Si no aporta una decisión clara, diferir este hito.

### M6 — Demo verificable y entrega (3–4 días)
- [ ] R21: Probar reglas, fechas, costos, datos faltantes y escenarios extremos.
- [ ] R22: Verificar Android real, persistencia, respaldo sin conexión y exportación de comparación.
- [ ] R23: Añadir CI para compilación y pruebas; generar APK de demo reproducible.
- [ ] R24: Preparar README, arquitectura, atribuciones, límites y guion de presentación de 3 minutos.
Aceptación: recorrido completo ubicación → calendario → evidencia → adaptación → comparación, con datos reales y sin dependencia de Internet durante la exposición.

## Secuencia y esfuerzo
M0 → M1 → M2 → M3 → M4 → M6: 20–31 días de trabajo, aproximadamente 4–7 semanas a tiempo completo, sujeto a disponibilidad de datos y revisión local. M5 añade 3–6 días. Para un fin de semana de hackatón: un caso preparado, calendario acotado, un dataset NASA real, tres estrategias predefinidas revisadas y comparación económica simple; no intentar todo el backlog.

## Fuera de alcance inicial
John Deere, autenticación multiusuario, sincronización, marketplace, cotizaciones en vivo, chatbot, predicción validada de cosechas, biodiversidad integral y optimización automática. Reconsiderar después de validar el recorrido central.

## Organización en GitHub
Milestones M0–M6; una issue por R01–R24; etiquetas calendario, nasa-data, agronomia, economia, android, quality, documentation y optional. Tablero sugerido: Backlog, Ready, In progress, Review, Done. Cada issue debe incluir objetivo, dependencias, aceptación y evidencia de verificación. Este archivo es un borrador local: aún no se han creado issues ni repositorios remotos.
