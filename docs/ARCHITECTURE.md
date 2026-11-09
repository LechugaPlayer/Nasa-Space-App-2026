# Arquitectura — ADR 001

Aceptada para el arranque, 2026-11-09. React + TypeScript estricto + Vite para web, Capacitor 8 para Android. Un repositorio y un paquete npm. Node 24 como referencia de CI; versiones exactas y lockfile. Se conserva el prototipo existente para evitar duplicar trabajo.

`src/calc.ts` es motor puro, `src/csv.ts` serializa exportaciones; `App.tsx` y `MobileApp.tsx` son interfaces. Extraer componentes por dominio al incorporar calendario. La persistencia móvil usa una clave estable en localStorage; escritorio aún no persiste.

Evolución: lote/calendario/escenario/observación → adaptadores externos con contratos → IndexedDB y migraciones → backend solo si hacen falta cuentas o sincronización. Candidato posterior: API TypeScript y PostgreSQL/PostGIS. Python solo para experimentos agronómicos si una decisión validada lo necesita. No hay infraestructura provisionada ni pagos recurrentes.

Reglas: UI → casos de uso → dominio. Adaptadores no deciden recomendaciones. Todo indicador conserva unidad, período, procedencia y versión de regla. Faltante no equivale a cero. Grilla no equivale a sensor del lote. Datos privados y coordenadas exactas no van a Git público.

Entrega por PR con evidencia, CI con permisos de lectura y sin secretos para build. Configurar protección de main y revisión cuando exista equipo; no se modificaron esas reglas. No hay despliegue automático a producción.
