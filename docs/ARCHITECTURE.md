# Arquitectura — ADR 001

## Evolución implementada v2 (2026-11-10)

`src/planner/` separa modelo/validación, fechas, economía, reglas, adaptador POWER, persistencia, CSV/exportación y componentes de interfaz. `Planner.tsx` es el punto de entrada común para web/Android. `src/calc.ts` se reutiliza por ciclo. El prototipo anterior permanece bajo `?legacy` y no es la interfaz por defecto.

El plan v2 tiene almacenamiento separado y validación completa al importar/guardar. Un plan corrupto se conserva hasta decisión explícita del usuario. Un presupuesto incompleto es válido; sus totales se abstienen. El dossier conserva el texto climático original; SHA-256 detecta alteraciones, no autentica archivos de terceros.

POWER se consulta desde el cliente sin secretos. Validar ubicación, fechas, unidades, faltantes, valores y procedencia antes de calcular. Timeout, cancelación y generación de solicitud evitan respuestas obsoletas; no hay fallback silencioso. Consulta live, caché y respaldo son opciones visibles. Una sola caché meteorológica limita uso de espacio; los tres respaldos están empaquetados.

Web: service worker generado al compilar, cache de recursos propios versionado por contenido, instalación atómica y activación después de cerrar pestañas anteriores. No cachea NASA automáticamente ni mezcla versiones. Android incluye assets y respaldos; no necesita service worker. Build/pruebas no deben correr simultáneamente contra el mismo dist.

CI: pruebas de dominio, formato, build/recorridos de producción/offline y job Android con APK debug. Consulta real opcional fuera del CI determinista. No hay backend ni infraestructura de pago.

## Decisión inicial (antecedente)

Aceptada para el arranque, 2026-11-09. React + TypeScript estricto + Vite para web, Capacitor 8 para Android. Un repositorio y un paquete npm. Node 24 como referencia de CI; versiones exactas y lockfile. Se conserva el prototipo existente para evitar duplicar trabajo.

`src/calc.ts` es motor puro, `src/csv.ts` serializa exportaciones; `App.tsx` y `MobileApp.tsx` son interfaces. Extraer componentes por dominio al incorporar calendario. La persistencia móvil usa una clave estable en localStorage; escritorio aún no persiste.

Evolución: lote/calendario/escenario/observación → adaptadores externos con contratos → IndexedDB y migraciones → backend solo si hacen falta cuentas o sincronización. Candidato posterior: API TypeScript y PostgreSQL/PostGIS. Python solo para experimentos agronómicos si una decisión validada lo necesita. No hay infraestructura provisionada ni pagos recurrentes.

Reglas: UI → casos de uso → dominio. Adaptadores no deciden recomendaciones. Todo indicador conserva unidad, período, procedencia y versión de regla. Faltante no equivale a cero. Grilla no equivale a sensor del lote. Datos privados y coordenadas exactas no van a Git público.

Entrega por PR con evidencia, CI con permisos de lectura y sin secretos para build. Configurar protección de main y revisión cuando exista equipo; no se modificaron esas reglas. No hay despliegue automático a producción.
