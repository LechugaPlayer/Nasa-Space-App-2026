# Proyecto Agrícola — nombre provisional

Repositorio central para comparar decisiones agrícolas con evidencia y supuestos visibles. Piloto propuesto: rotaciones en Paraguay. **Prototipo funcional, sin validación agronómica todavía.**

## Ejecutar

Node.js 24 y npm, desde un clon limpio:

```bash
npm ci
npm run dev
```

Abrir la URL de Vite; agregar `/?android` para interfaz móvil. No requiere claves.

```bash
npm test
npm run build
npx playwright install chromium
npm run test:ui
```

## Implementado

Dos escenarios editables, costos, sensibilidad, comparación y exportación CSV. Motor TypeScript compartido entre web y Android. Persistencia local en interfaz móvil (escritorio aún no guarda). Dependencias fijadas, lockfile, pruebas y workflow CI.

**Pendiente:** datos reales NASA/clima/suelo, calendario con fechas, flujo de caja y recomendaciones agronómicas personalizadas. Los datos iniciales y la tarjeta NASA son ilustrativos. APK funciona sin conexión; web todavía no tiene service worker para arrancar sin red.

## Documentación

| Documento | Contenido |
|---|---|
| [Roadmap](ROADMAP.md) | Etapas, dependencias y aceptación |
| [Producto](docs/PRODUCT.md) | Decisiones, variables y validación |
| [Arquitectura](docs/ARCHITECTURE.md) | Stack y evolución |
| [Fuentes](docs/SOURCES.md) | Referencias verificadas y límites |
| [Cálculos](docs/CALCULATIONS.md) | Fórmulas y unidades |
| [Nombre](docs/BRANDING.md) | Marca configurable en product.json |
| [Android](ANDROID.md) | Compilar la app |
| [Contribuir](CONTRIBUTING.md) | Flujo profesional |
| [Verificación](docs/VALIDATION.md) | Evidencia y pendientes |

`src/`: app/motor; `tests/`: pruebas; `android/`: proyecto nativo; `docs/`: conocimiento; `.github/`: automatización. Archivos PROTOTYPE-* documentan el estado previo y no reemplazan estas instrucciones.

SDK, APK, secretos, cachés y archivos sincronizados de ChatGPT se excluyen del repositorio. Licencia propia pendiente de elección del propietario; dependencias y fuentes conservan sus licencias. El proyecto no está afiliado oficialmente a NASA.
