import {
  CATALOG,
  dates,
  months,
  overlaps,
  type Cycle,
  type CropId,
  type Plan,
  type Strategy,
} from './model.ts'
import { Field, Numeric } from './Fields'
export function Timeline({ plan }: { plan: Plan }) {
  const columns = months(plan.start, plan.end)
  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">MISMO HORIZONTE · TRES ALTERNATIVAS</p>
          <h2>El calendario primero</h2>
        </div>
        <span className="badge">{dates(plan.start, plan.end).length} días</span>
      </div>
      <p>
        Las barras representan presencia programada de cultivo. Los espacios no prueban suelo
        desnudo.
      </p>
      <div className="table-scroll" tabIndex={0} aria-label="Calendario mensual desplazable">
        <table className="calendar">
          <thead>
            <tr>
              <th>Estrategia</th>
              {columns.map((m) => (
                <th key={m}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plan.strategies.map((s) => (
              <tr key={s.id}>
                <th scope="row">
                  {s.name}
                  <small>Residuos: {s.residues}</small>
                </th>
                {columns.map((m) => (
                  <td key={m}>
                    {s.cycles
                      .filter((c) => c.start.slice(0, 7) <= m && c.end.slice(0, 7) >= m)
                      .map((c) => (
                        <span
                          className={`crop crop-${c.crop}`}
                          key={c.id}
                          title={`${c.start} → ${c.end}`}
                        >
                          {CATALOG[c.crop].name}
                        </span>
                      ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
export function CalendarEditor({ plan, update }: { plan: Plan; update: (p: Plan) => void }) {
  const changeStrategy = (i: number, change: Partial<Strategy>) =>
    update({
      ...plan,
      strategies: plan.strategies.map((s, j) => (j === i ? { ...s, ...change } : s)),
    })
  const changeCycle = (i: number, id: string, change: Partial<Cycle>) =>
    changeStrategy(i, {
      cycles: plan.strategies[i].cycles.map((c) => (c.id === id ? { ...c, ...change } : c)),
    })
  function addCycle(i: number) {
    changeStrategy(i, {
      cycles: [
        ...plan.strategies[i].cycles,
        {
          id: crypto.randomUUID(),
          crop: 'avena',
          start: plan.start,
          end: plan.end,
          payDate: plan.start,
          saleDate: plan.end,
          yieldT: 0,
          price: 0,
          direct: null,
          other: null,
          extra: null,
          notes: '',
          priceSource: 'Sin venta: cobertura',
        },
      ],
    })
  }
  return (
    <>
      <Timeline plan={plan} />
      {plan.strategies.map((s, i) => (
        <section className="panel" key={s.id}>
          <div className="section-head">
            <h2>{i === 0 ? 'Práctica actual' : `Alternativa ${i}`}</h2>
            <span className="badge">{s.cycles.length} ciclos</span>
          </div>
          <div className="grid fields">
            <Field label={`Nombre de estrategia ${i + 1}`}>
              <input
                maxLength={100}
                value={s.name}
                onChange={(e) => changeStrategy(i, { name: e.target.value })}
              />
            </Field>
            <Field label={`Residuos · estrategia ${i + 1}`}>
              <select
                value={s.residues}
                onChange={(e) =>
                  changeStrategy(i, { residues: e.target.value as Strategy['residues'] })
                }
              >
                <option value="desconocido">Sin información</option>
                <option value="retenidos">Retenidos (informado)</option>
                <option value="retirados">Retirados (informado)</option>
              </select>
            </Field>
          </div>
          {overlaps(s).map((warning, j) => (
            <p role="alert" className="warning" key={j}>
              {warning} Se suspende el total económico de esta estrategia.
            </p>
          ))}
          {!s.cycles.length && (
            <p>
              Sin cultivo vivo programado. Se conserva costo de tierra; no se supone suelo desnudo.
            </p>
          )}
          {s.cycles.map((c, j) => (
            <fieldset className="cycle-editor" key={c.id}>
              <legend>
                {i + 1}.{j + 1} · {CATALOG[c.crop].name}
              </legend>
              <div className="grid fields">
                <Field label={`Cultivo ${i + 1}.${j + 1}`}>
                  <select
                    value={c.crop}
                    onChange={(e) => {
                      const crop = e.target.value as CropId
                      changeCycle(i, c.id, {
                        crop,
                        ...(CATALOG[crop].cover
                          ? { price: 0, yieldT: 0, priceSource: 'Sin venta: cobertura' }
                          : { price: null, yieldT: null, priceSource: 'Pendiente' }),
                      })
                    }}
                  >
                    {Object.entries(CATALOG).map(([id, item]) => (
                      <option key={id} value={id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={`Siembra/inicio ${i + 1}.${j + 1}`}>
                  <input
                    type="date"
                    min={plan.start}
                    max={plan.end}
                    value={c.start}
                    onChange={(e) =>
                      changeCycle(i, c.id, { start: e.target.value, payDate: e.target.value })
                    }
                  />
                </Field>
                <Field label={`Cosecha/fin ${i + 1}.${j + 1}`}>
                  <input
                    type="date"
                    min={c.start}
                    max={plan.end}
                    value={c.end}
                    onChange={(e) =>
                      changeCycle(i, c.id, { end: e.target.value, saleDate: e.target.value })
                    }
                  />
                </Field>
                <Field label={`Pago agregado ${i + 1}.${j + 1}`}>
                  <input
                    type="date"
                    min={plan.start}
                    max={c.start}
                    value={c.payDate}
                    onChange={(e) => changeCycle(i, c.id, { payDate: e.target.value })}
                  />
                </Field>
                <Field label={`Cobro agregado ${i + 1}.${j + 1}`}>
                  <input
                    type="date"
                    min={c.end}
                    max={plan.end}
                    value={c.saleDate}
                    onChange={(e) => changeCycle(i, c.id, { saleDate: e.target.value })}
                  />
                </Field>
              </div>
              <details>
                <summary>Presupuesto y procedencia · USD por hectárea</summary>
                <div className="grid fields">
                  {!CATALOG[c.crop].cover && (
                    <>
                      <Numeric
                        label={`Rendimiento t/ha ${i + 1}.${j + 1}`}
                        value={c.yieldT}
                        max={100}
                        nullable
                        onChange={(yieldT) => changeCycle(i, c.id, { yieldT })}
                      />
                      <Numeric
                        label={`Precio USD/t ${i + 1}.${j + 1}`}
                        value={c.price}
                        nullable
                        onChange={(price) =>
                          changeCycle(i, c.id, {
                            price,
                            priceSource: 'Informado manualmente por el usuario',
                          })
                        }
                      />
                    </>
                  )}
                  <Numeric
                    label={`Directos USD/ha ${i + 1}.${j + 1}`}
                    value={c.direct}
                    nullable
                    onChange={(direct) => changeCycle(i, c.id, { direct })}
                  />
                  <Numeric
                    label={`Otros USD/ha ${i + 1}.${j + 1}`}
                    value={c.other}
                    nullable
                    onChange={(other) => changeCycle(i, c.id, { other })}
                  />
                  <Numeric
                    label={`Adicionales USD/ha ${i + 1}.${j + 1}`}
                    value={c.extra}
                    nullable
                    onChange={(extra) => changeCycle(i, c.id, { extra })}
                  />
                  <Field label={`Fuente de precio ${i + 1}.${j + 1}`}>
                    <input
                      maxLength={300}
                      value={c.priceSource}
                      onChange={(e) => changeCycle(i, c.id, { priceSource: e.target.value })}
                    />
                  </Field>
                  {plan.references.some((r) => r.crop === c.crop) && !CATALOG[c.crop].cover && (
                    <Field label={`Aplicar referencia ${i + 1}.${j + 1}`}>
                      <select
                        value=""
                        onChange={(e) => {
                          const r = plan.references[Number(e.target.value)]
                          if (r)
                            changeCycle(i, c.id, {
                              price: r.price,
                              priceSource: `${r.kind}: ${r.market} · ${r.date} · ${r.currency} · ${r.unit}`,
                            })
                        }}
                      >
                        <option value="">Elegir explícitamente…</option>
                        {plan.references.map((r, k) =>
                          r.crop === c.crop ? (
                            <option key={k} value={k}>
                              {r.date} · {r.market} · {r.price} USD/t · {r.kind}
                            </option>
                          ) : null,
                        )}
                      </select>
                    </Field>
                  )}
                </div>
                <Field label={`Manejo y recursos aprovechables ${i + 1}.${j + 1}`}>
                  <textarea
                    maxLength={500}
                    value={c.notes}
                    onChange={(e) => changeCycle(i, c.id, { notes: e.target.value })}
                  />
                </Field>
                <p>
                  Vacío = pendiente; cero = sin costo/venta. Recursos existentes se registran en
                  notas; no se descuentan automáticamente. Adicionales excluyen tierra, cargada una
                  vez por horizonte.
                </p>
              </details>
              <button
                className="text-button danger"
                onClick={() => changeStrategy(i, { cycles: s.cycles.filter((x) => x.id !== c.id) })}
              >
                Eliminar ciclo {i + 1}.{j + 1}
              </button>
            </fieldset>
          ))}
          <button onClick={() => addCycle(i)} disabled={s.cycles.length >= 8}>
            Agregar ciclo a estrategia {i + 1}
          </button>
        </section>
      ))}
    </>
  )
}
