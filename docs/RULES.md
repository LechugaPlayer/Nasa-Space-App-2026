# Reglas de interpretación v2

| ID | Entrada → salida | Límite |
|---|---|---|
| CAL-01 | Unión de días inclusivos de ciclos → días con cultivo programado | No cobertura vegetal observada; no doble conteo; huecos no prueban suelo desnudo |
| DIV-01 | Catálogo de familias y secuencia → cantidad de familias/repetición | No mide diversidad integral, plagas o salud del suelo |
| OPS-01 | Maquinaria/experiencia/comprador declarados → revisión de disponibilidad | No verifica respuestas ni garantiza factibilidad |
| ECO-01 | Caja + capital → cubre/no cubre déficit base | Fechas agregadas; no crédito concedido ni probabilidad |
| SOIL-01 | Prioridad suelo → recordar calendario, residuos y faltantes | Sin análisis local no se estima salud o nitrógeno |
| WATER-01 | Prioridad agua + clima compatible → revisar lluvia/sequía histórica | No balance de raíces ni prescripción de riego |

Clima: suma solo lluvia válida; día seco si lluvia < umbral (por defecto 1 mm/día); calor si máxima ≥ umbral (35 °C). Umbrales exploratorios, no fenológicos. Faltantes se conservan; rompen racha seca. Con faltantes, sumas/conteos son parciales y racha observada es límite inferior. Se informa denominador por variable. No se deriva rendimiento del clima.

Equivalencia espacial/temporal: ubicación exacta del plan y período contenido en el respaldo. Cambiar ubicación/período invalida evidencia activa; se debe cargar explícitamente otra. No se trasladan datos de Itapúa a Alto Paraná ni se mapea un año histórico a una temporada futura.

Referencias: precio con fecha, mercado, moneda, unidad y tipo; aplicar a ciclo es acción explícita. Precio internacional no equivale a venta neta local. El usuario debe describir descuentos/flete en la fuente o costos; no se incorporan sin datos.
