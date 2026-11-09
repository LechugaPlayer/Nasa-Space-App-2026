# Modelo económico v0.1

Área: ha; rendimiento: t/ha; precio: USD/t; costos: USD/ha/campaña. USD fijo, sin conversión.

Ingreso/ha = rendimiento × (1 + ajusteRendimiento/100) × precio × (1 + ajustePrecio/100). Costo/ha = (directo + otros) × (1 + ajusteCostos/100) + adicionales activos. Tierra, maquinaria y financiación se suman **por campaña**, no por año. Evitar duplicarlos en otros rubros.

Totales: sumar por campaña y multiplicar por área. Margen bruto = ingreso menos directos. Neto = ingreso menos todos los costos activos. Impuestos/flete/oportunidad solo están incluidos si el usuario los carga explícitamente.

`maxCapital` conserva nombre interno pero se muestra como mayor costo de campaña. No es necesidad real de financiación: faltan fechas y acumulación de saldos.

Equilibrio solo para una campaña: precio = costo/ha ÷ rendimiento ajustado; rendimiento = costo/ha ÷ precio ajustado. Múltiples campañas o denominadores no definidos muestran No definido. No sumar toneladas de cultivos distintos para prometer un precio único.

Comparaciones son totales del ciclo, no anualizados. Distintas duraciones no son directamente equivalentes. Sensibilidad determinista, sin probabilidades. CSV conserva valores base, neto ajustado y porcentajes; escritorio respeta horizonte. Se escapan textos y fórmulas de planilla.
