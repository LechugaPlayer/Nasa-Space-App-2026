import { climateSummary, type Weather } from './power'
import { months, type Plan } from './model'
import { decimal, Numeric } from './Fields'
export function Evidence({
  plan,
  update,
  weather,
  status,
  busy,
  load,
}: {
  plan: Plan
  update: (p: Plan) => void
  weather: Weather | null
  status: string
  busy: boolean
  load: (source: Weather['origin']) => Promise<void>
}) {
  const total = weather
    ? climateSummary(weather.days, plan.start, plan.end, plan.dryMm, plan.heatC)
    : null
  return (
    <>
      <section className="panel">
        <p className="eyebrow">EVIDENCIA HISTÓRICA · NASA POWER</p>
        <h2>El clima, con procedencia</h2>
        <p>
          Datos diarios de grilla, no mediciones del lote. El historial no es un pronóstico ni
          determina por sí solo el rendimiento.
        </p>
        <div className="actions">
          <button disabled={busy} onClick={() => void load('snapshot')}>
            Cargar respaldo real del caso
          </button>
          <button disabled={busy} onClick={() => void load('live')}>
            Consultar NASA
          </button>
          <button disabled={busy} onClick={() => void load('cache')}>
            Abrir caché local
          </button>
        </div>
        <p role="status" className={status.startsWith('Error:') ? 'warning' : 'notice'}>
          {status}
        </p>
        <div className="grid fields">
          <Numeric
            label="Día seco: lluvia menor a (mm/día)"
            value={plan.dryMm}
            min={0}
            max={50}
            onChange={(dryMm) => update({ ...plan, dryMm: dryMm! })}
          />
          <Numeric
            label="Día de calor: máxima desde (°C)"
            value={plan.heatC}
            min={-20}
            max={60}
            onChange={(heatC) => update({ ...plan, heatC: heatC! })}
          />
        </div>
        <p>
          Umbrales exploratorios editables; no son umbrales fenológicos calibrados. Dato faltante
          interrumpe una racha y no cuenta como cero.
        </p>
      </section>
      {weather && total && (
        <>
          <section className="panel">
            <div className="section-head">
              <h2>
                {weather.origin === 'snapshot'
                  ? 'Respaldo real incluido'
                  : weather.origin === 'cache'
                    ? 'Caché del dispositivo'
                    : 'Consulta en vivo'}
              </h2>
              <span className="badge">UTC</span>
            </div>
            <div className="metric-grid">
              <div>
                <small>Lluvia acumulada conocida</small>
                <strong>{decimal(total.rain)} mm</strong>
                <span>
                  {total.rainDays}/{total.expected} días
                </span>
              </div>
              <div>
                <small>Días secos conocidos</small>
                <strong>{decimal(total.dryDays)}</strong>
                <span>racha máxima: {decimal(total.longestDry)} días</span>
              </div>
              <div>
                <small>Días de calor conocidos</small>
                <strong>{decimal(total.hotDays)}</strong>
                <span>
                  {total.temperatureDays}/{total.expected} días con máxima
                </span>
              </div>
            </div>
            {!total.complete && (
              <p className="warning">
                Cobertura parcial: sumas y conteos son parciales; no extrapolar el período completo.
                Rachas son límites inferiores.
              </p>
            )}
            <dl className="provenance">
              <dt>Período original</dt>
              <dd>
                {weather.query.start} → {weather.query.end}
              </dd>
              <dt>Consulta original</dt>
              <dd>
                {weather.query.lat}, {weather.query.lon}
              </dd>
              <dt>Descarga</dt>
              <dd>{weather.retrievedAt}</dd>
              <dt>Fuentes / API</dt>
              <dd>
                {weather.sources.join(', ')} / {weather.apiVersion}
              </dd>
              <dt>Escala</dt>
              <dd>
                Grilla nativa MERRA-2: 0,5° latitud × 0,625° longitud. No remuestreada a precisión
                de lote.
              </dd>
              <dt>SHA-256 del original</dt>
              <dd>
                <code>{weather.hash}</code>
              </dd>
            </dl>
            <a href={weather.url} target="_blank" rel="noreferrer">
              Consulta original reproducible ↗
            </a>
            <p>
              NASA Langley Research Center POWER Project. Datos meteorológicos modelados; no
              constituyen observación directa de esta finca ficticia.
            </p>
          </section>
          <section className="panel">
            <h2>Serie mensual del horizonte</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>Lluvia conocida mm</th>
                    <th>Días lluvia válidos</th>
                    <th>Calor conocido</th>
                    <th>Máximas válidas</th>
                  </tr>
                </thead>
                <tbody>
                  {months(plan.start, plan.end).map((month) => {
                    const a = month + '-01' > plan.start ? month + '-01' : plan.start
                    const monthEnd = new Date(
                        Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0),
                      )
                        .toISOString()
                        .slice(0, 10),
                      b = monthEnd < plan.end ? monthEnd : plan.end
                    const m = climateSummary(weather.days, a, b, plan.dryMm, plan.heatC)
                    return (
                      <tr key={month}>
                        <th>{month}</th>
                        <td>{decimal(m.rain)}</td>
                        <td>
                          {m.rainDays}/{m.expected}
                        </td>
                        <td>{decimal(m.hotDays)}</td>
                        <td>
                          {m.temperatureDays}/{m.expected}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  )
}
