# Rotación — calculadora económica agrícola

La demo Android está documentada en [ANDROID.md](ANDROID.md). El APK de prueba se genera en `deliverables/rotacion-demo.apk`. La interfaz móvil se puede revisar en el navegador agregando `/?android` a la URL local.

Prototipo web para explorar, comparar y conversar sobre alternativas de rotación de cultivos en Paraguay. La aplicación muestra resultados y trade-offs; no elige una opción ni reemplaza asesoramiento agronómico o financiero.

## Ejecutar localmente

Requiere Node.js 20 o posterior.

```bash
npm install
npm run dev
```

Vite mostrará una dirección local para abrir en el navegador. Para generar una versión de producción: `npm run build`; para previsualizarla: `npm run preview`.

## Qué incluye el MVP

- Datos generales editables: hectáreas, horizonte, moneda y tenencia.
- Categorías modulares para producción, costos, tierra, maquinaria, financiación y contexto NASA. Comercialización y flujo de caja aparecen como módulos de interfaz para una siguiente iteración.
- Escenarios de rotación editables por campaña, con cultivos, rendimientos, precios y costos.
- Resultados totales y por campaña: ingresos brutos, margen bruto, neto estimado, capital máximo y puntos de equilibrio.
- Comparación de escenarios, controles de sensibilidad de precio/rendimiento/costos, recomendaciones explicables y exportación CSV.
- Modo NASA con datos ficticios explícitamente marcados como demo. No hay conexión a servicios externos.

## Cálculos

La lógica vive en `src/calc.ts`, separada de la interfaz. El ingreso bruto es la suma de rendimiento × precio × superficie. El margen bruto resta costos directos; el neto resta todos los costos activados. Los costos opcionales de tierra, maquinaria y financiación se suman por hectárea y campaña. La sensibilidad modifica precio, rendimiento o costos porcentualmente.

Los valores iniciales son ilustrativos y deben reemplazarse por presupuestos, precios, condiciones de venta y rendimientos del establecimiento. El prototipo no convierte monedas: cambiar la moneda actualiza el formato mostrado, no los valores internos.

## Próximas integraciones

Una etapa posterior podría incorporar NASA POWER para variables meteorológicas, GPM para precipitación y SMAP para humedad del suelo. Antes de integrarlas habría que definir ubicación, período, resolución, políticas de actualización y trazabilidad de fuentes. Para un flujo de caja más realista, se pueden agregar calendario de pagos/cobros, costo de oportunidad del capital, flete, comercialización y tributos.
