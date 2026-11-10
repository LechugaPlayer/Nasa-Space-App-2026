# Modelo económico v2

Área en ha; rendimiento en t/ha; precio en USD/t; costos de ciclo en USD/ha. No hay conversión de moneda. Vacío significa pendiente; cero es un valor explícito.

Por ciclo: ingreso/ha = rendimiento × (1 + ajusteRendimiento/100) × precio × (1 + ajustePrecio/100). Costos/ha = (directos + otros) × (1 + ajusteCostos/100) + adicionales. Se reutiliza `src/calc.ts` con un solo cultivo por llamada.

Tierra = monto USD/ha del horizonte × superficie, **una sola vez** al inicio. Es independiente de los adicionales del ciclo. Cambiar propio/alquilado no inventa ni cambia el monto. En propiedad, cero no incluye costo de oportunidad; cargarlo explícitamente si se quiere evaluar.

Neto del horizonte = suma de ingresos − costos de ciclos − tierra. No se anualiza. No hay tributos/flete/intereses implícitos: deben estar en los rubros informados. Un recurso existente se registra en notas, sin crédito monetario automático.

## Caja

Un pago agregado por ciclo entre inicio del horizonte y siembra; un cobro agregado entre cosecha y fin del horizonte. Tierra al inicio. Sumar ingresos y pagos por día, acumular desde saldo cero. Financiación estimada = máximo(0, −mínimo saldo acumulado). Eventos del mismo día se compensan; no se modela orden intradía, interés dinámico, cuotas ni financiación aprobada. Capital disponible se compara con ese déficit, no se suma al margen.

Si falta presupuesto o hay solapamiento de cultivos, no se muestra total. Los ciclos con datos completos pueden verse individualmente. Un lote sin cultivos conserva costo de tierra. Una cobertura no comercial exige ingreso cero y puede tener costo.

## Sensibilidad y equilibrio

| Escenario | Precio | Rendimiento | Directos/otros |
|---|---:|---:|---:|
| Bajo | −20% | −20% | +10% |
| Base | 0% | 0% | 0% |
| Alto | +20% | +20% | −10% |

Adicionales y tierra permanecen fijos. Son escenarios conjuntos deterministas, no percentiles ni probabilidades.

Equilibrio por ciclo: costo/ha ÷ rendimiento ajustado para precio; costo/ha ÷ precio ajustado para rendimiento. Excluye tierra del horizonte porque no se asigna arbitrariamente a un cultivo. El neto/caja global sí incluye tierra. No mezclar toneladas de cultivos diferentes. Denominadores nulos o no definidos no producen un equilibrio ficticio.

CSV exporta valores base, fuente y fechas, una fila de tierra y total por estrategia. Dossier JSON conserva todo el plan y el archivo climático original como texto con hash. El hash verifica integridad, no autentica un archivo aportado por terceros.
