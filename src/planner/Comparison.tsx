import { analyze } from './analysis'
import { budgetStrategy, SHIFTS, type Band } from './economics'
import { CATALOG, type Plan, type Strategy } from './model'
import type { Weather } from './power'
import { amount, decimal, Field } from './Fields'
export function Comparison({
  plan,
  update,
  weather,
}: {
  plan: Plan
  update: (p: Plan) => void
  weather: Weather | null
}) {
  function restriction(i: number, key: 'machinery' | 'experience' | 'buyer', value: string) {
    update({
      ...plan,
      strategies: plan.strategies.map((s, j) =>
        j === i ? ({ ...s, [key]: value } as Strategy) : s,
      ),
    })
  }
  return (
    <>
      <section className="panel">
        <p className="eyebrow">DECISIONES EXPLICABLES</p>
        <h2>Comparar, sin ocultar los supuestos</h2>
        <p>
          Mismo lote y horizonte. Las alternativas son plantillas ilustrativas, no recomendaciones
          validadas. No hay un puntaje combinado ni un ganador automático.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Indicador base</th>
                {plan.strategies.map((s) => (
                  <th key={s.id}>{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(['revenue', 'cost', 'net', 'funding'] as const).map((key) => (
                <tr key={key}>
                  <th>
                    {
                      {
                        revenue: 'Ingresos USD',
                        cost: 'Costos USD (incluye tierra)',
                        net: 'Neto USD',
                        funding: 'Déficit máximo de caja USD',
                      }[key]
                    }
                  </th>
                  {plan.strategies.map((s) => (
                    <td key={s.id}>{amount(budgetStrategy(s, plan)[key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Flujo simplificado: un pago agregado y un cobro por ciclo; tierra al inicio. Pagos/cobros
          del mismo día se compensan. No modela intereses dinámicos ni rentabilidad anualizada.
        </p>
      </section>
      <div className="strategy-grid">
        {plan.strategies.map((s, i) => {
          const a = analyze(s, plan, weather)
          return (
            <article className="panel strategy" key={s.id}>
              <p className="eyebrow">{i === 0 ? 'ACTUAL' : `ALTERNATIVA ${i}`}</p>
              <h2>{s.name}</h2>
              {a.issues.map((issue) => (
                <p key={issue} className="warning">
                  {issue}
                </p>
              ))}
              <div className="metric">
                <small>Neto base del horizonte</small>
                <strong>{amount(a.budget.net)}</strong>
              </div>
              {a.budget.funding !== null && plan.plot.capital !== null && (
                <p className={a.budget.funding > plan.plot.capital ? 'warning' : 'notice'}>
                  {a.budget.funding > plan.plot.capital
                    ? 'Capital insuficiente bajo los supuestos base'
                    : 'Capital cubre el déficit estimado base'}{' '}
                  · disponible {amount(plan.plot.capital)}
                </p>
              )}
              <h3>Restricciones informadas</h3>
              {(
                [
                  ['machinery', 'Maquinaria'],
                  ['experience', 'Experiencia'],
                  ['buyer', 'Comprador'],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={`${label} · estrategia ${i + 1}`}>
                  <select value={s[key]} onChange={(e) => restriction(i, key, e.target.value)}>
                    <option value="desconocido">Sin confirmar</option>
                    <option value="si">Disponible</option>
                    <option value="no">No disponible</option>
                  </select>
                </Field>
              ))}
              <h3>Evidencia y límites</h3>
              {a.signals.map((signal, index) => (
                <div className="signal" key={index}>
                  <small>{signal.rule}</small>
                  <b>{signal.title}</b>
                  <p>{signal.detail}</p>
                </div>
              ))}
              <h3>Exposición histórica por ciclo</h3>
              {a.exposure.map(({ cycle: c, climate: m }) => (
                <p key={c.id}>
                  <b>{CATALOG[c.crop].name}:</b>{' '}
                  {m
                    ? `${decimal(m.rain)} mm conocidos (${m.rainDays}/${m.expected} días); ${decimal(m.hotDays)} días de calor (${m.temperatureDays}/${m.expected} máximas).`
                    : 'Sin evidencia climática compatible.'}
                </p>
              ))}
              <h3>Intercambios a revisar</h3>
              <p>
                {s.cycles.some((c) => CATALOG[c.crop].cover)
                  ? 'Más días programados con cultivo vivo; la cobertura tiene costo y no genera ventas en este modelo. No se asigna ahorro de fertilizante ni aumento de rendimiento.'
                  : 'El margen depende de vender al precio y rendimiento supuestos. Los períodos sin cultivo registrado requieren revisar manejo y residuos.'}
              </p>
              <details>
                <summary>Economía baja / base / alta y caja</summary>
                <p>
                  Escenarios deterministas, no probabilidades. Adicionales y tierra permanecen
                  fijos.
                </p>
                {(Object.keys(SHIFTS) as Band[]).map((band) => (
                  <p key={band}>
                    <b>{band}:</b> {amount(budgetStrategy(s, plan, band).net)} · precio{' '}
                    {SHIFTS[band][0]}%, rendimiento {SHIFTS[band][1]}%, costos directos/otros{' '}
                    {SHIFTS[band][2]}%
                  </p>
                ))}
                <h4>Equilibrio por ciclo (sin tierra del horizonte)</h4>
                {a.budget.cycles.map(({ cycle: c, result: r }) => (
                  <p key={c.id}>
                    {CATALOG[c.crop].name}:{' '}
                    {CATALOG[c.crop].cover
                      ? 'Sin venta; no aplica equilibrio comercial.'
                      : `${amount(r?.breakPrice ?? null)}/t · ${decimal(r?.breakYield ?? null)} t/ha`}
                  </p>
                ))}
                <p>
                  La tierra no se asigna arbitrariamente a un cultivo; el neto y caja del horizonte
                  sí la incluyen.
                </p>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Cobro</th>
                        <th>Pago</th>
                        <th>Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.budget.cash.map((row) => (
                        <tr key={row.date}>
                          <td>{row.date}</td>
                          <td>{amount(row.income)}</td>
                          <td>{amount(row.expense)}</td>
                          <td>{amount(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
              <details>
                <summary>Información pendiente</summary>
                <ul>
                  {a.missing.map((m, j) => (
                    <li key={j}>{m}</li>
                  ))}
                </ul>
              </details>
            </article>
          )
        })}
      </div>
    </>
  )
}
