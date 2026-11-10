# Contribuir

Tomar issue con objetivo, dependencias y aceptación. Rama feat/descripcion o fix/descripcion; PR con problema, cambio y pruebas. Commits: feat, fix, docs, test, chore. Evitar mezclar refactors amplios con fórmulas.

Terminado: `npm run format:check`, pruebas relevantes, build, recorrido afectado y documentación. Ejecutar `npm run format` para aplicar el estilo compartido. Cambios numéricos exigen ejemplo independiente con unidades; proveedores exigen fixtures, faltantes y procedencia. Tests de software no implican validación agronómica. No compilar dist mientras las pruebas UI lo sirven; `npm run test:ui` gestiona build y preview en secuencia.

No versionar SDK, node_modules, fuentes sincronizadas de ChatGPT, credenciales, datos privados ni compilados. Reportar secretos al propietario en privado. Decisiones van a docs/ARCHITECTURE.md; fuentes a docs/SOURCES.md. Licencia del código pendiente de decisión del propietario.
