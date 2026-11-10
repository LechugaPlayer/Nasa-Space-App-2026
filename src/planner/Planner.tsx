import { useEffect, useRef, useState } from 'react'
import { App as NativeApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import product from '../../product.json'
import { CASES, casePlan } from './demo'
import { CATALOG, parsePlan, validatePlan, type Plan } from './model'
import { CalendarEditor } from './Calendar'
import { Evidence } from './Evidence'
import { Comparison } from './Comparison'
import { Field, Numeric } from './Fields'
import { useWeather } from './useWeather'
import { loadPlan, savePlan, WEATHER_KEY } from './storage'
import { compatible, queryFor, weatherFromEnvelope } from './power'
import { comparisonCsv, dossier, saveFile } from './export'
import { parseReferences } from './references'
import './planner.css'
const tabs = ['Lote', 'Calendario', 'Evidencia', 'Comparar', 'Datos'] as const
type Tab = (typeof tabs)[number]
function Confirm({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
  }, [])
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      aria-labelledby="replace-title"
    >
      <h2 id="replace-title">¿Reemplazar el plan actual?</h2>
      <p>
        El caso elegido reemplaza las ediciones del dispositivo. Cancelá y exportá un dossier si
        querés conservarlas.
      </p>
      <div className="actions">
        <button autoFocus onClick={onCancel}>
          Conservar mi plan
        </button>
        <button className="primary" onClick={onConfirm}>
          Cargar caso
        </button>
      </div>
    </dialog>
  )
}
export default function Planner() {
  const [initial] = useState(() => loadPlan(localStorage))
  const [plan, setPlan] = useState<Plan>(initial.plan),
    [recovery, setRecovery] = useState(initial.recovery)
  const [tab, setTab] = useState<Tab>('Lote'),
    [notice, setNotice] = useState(initial.message),
    [saveStatus, setSaveStatus] = useState(''),
    [pendingCase, setPendingCase] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const climate = useWeather(plan),
    errors = validatePlan(plan),
    valid = errors.length === 0
  useEffect(() => {
    if (recovery !== null) {
      setSaveStatus('Original conservado: resolver recuperación antes de guardar.')
      return
    }
    if (!valid) {
      setSaveStatus('Cambios inválidos sin guardar. Se conserva el último plan válido.')
      return
    }
    try {
      savePlan(localStorage, plan)
      setSaveStatus('Guardado en este dispositivo')
    } catch {
      setSaveStatus('No se pudo guardar. Exportá el dossier para conservar tu trabajo.')
    }
  }, [plan, recovery, valid])
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const listener = NativeApp.addListener('backButton', () => {
      if (pendingCase) setPendingCase(null)
      else if (tab !== 'Lote') setTab('Lote')
      else NativeApp.minimizeApp()
    })
    return () => {
      void listener.then((l) => l.remove())
    }
  }, [tab, pendingCase])
  const plot = (patch: Partial<Plan['plot']>) =>
    setPlan((p) => ({ ...p, plot: { ...p.plot, ...patch } }))
  async function exportPlan(csv = false) {
    setExporting(true)
    try {
      parsePlan(plan)
      await saveFile(
        csv ? product.exportFile : 'dossier-agricola.json',
        csv ? comparisonCsv(plan) : dossier(plan, climate.envelope),
        csv ? 'text/csv;charset=utf-8' : 'application/json',
      )
      setNotice(
        csv
          ? 'Comparación exportada.'
          : 'Dossier exportado con plan y evidencia cargada, si existe.',
      )
    } catch (e) {
      setNotice(`No se exportó: ${e instanceof Error ? e.message : 'error desconocido'}`)
    } finally {
      setExporting(false)
    }
  }
  async function importPlan(file?: File) {
    if (!file) return
    try {
      if (file.size > 2e6) throw new Error('El archivo supera 2 MB.')
      const input: unknown = JSON.parse(await file.text())
      if (
        !input ||
        typeof input !== 'object' ||
        !('format' in input) ||
        input.format !== 'agriculture-dossier' ||
        !('version' in input) ||
        input.version !== 1 ||
        !('plan' in input)
      )
        throw new Error('Dossier no compatible; no se modificó el plan.')
      const next = parsePlan(input.plan)
      if ('climate' in input && input.climate) {
        const evidence = await weatherFromEnvelope(input.climate, 'cache')
        if (!compatible(evidence, queryFor(next)))
          throw new Error('Evidencia incompatible con el plan importado.')
        localStorage.setItem(WEATHER_KEY, JSON.stringify(input.climate))
      }
      setPlan(next)
      setRecovery(null)
      setNotice(
        'Dossier importado. Si incluye clima, abrirlo con «Abrir caché local» en Evidencia.',
      )
    } catch (e) {
      setNotice(`Importación rechazada: ${e instanceof Error ? e.message : 'archivo inválido'}`)
    }
  }
  async function importPrices(file?: File) {
    if (!file) return
    try {
      if (file.size > 100000) throw new Error('CSV supera 100 KB.')
      const references = parseReferences(await file.text())
      setPlan((p) => ({ ...p, references }))
      setNotice(
        `${references.length} referencias importadas. Aplicarlas explícitamente a cada ciclo.`,
      )
    } catch (e) {
      setNotice(`CSV rechazado: ${e instanceof Error ? e.message : 'archivo inválido'}`)
    }
  }
  return (
    <div className="planner">
      <a className="skip-link" href="#workspace">
        Saltar al contenido
      </a>
      <header className="app-header">
        <a href="#workspace" className="brand-name">
          ◈ {product.name}
          <small>{product.tagline}</small>
        </a>
        <span className="badge">DEMO · TRES CASOS</span>
      </header>
      <div className="layout">
        <aside className="navigation">
          <p className="eyebrow">ESPACIO DE DECISIÓN</p>
          <nav aria-label="Secciones">
            {tabs.map((t) => (
              <button
                key={t}
                aria-current={tab === t ? 'page' : undefined}
                className={tab === t ? 'selected' : ''}
                onClick={() => {
                  setTab(t)
                  window.scrollTo({ top: 0 })
                }}
              >
                {t}
              </button>
            ))}
          </nav>
          <p className="nav-note">
            Casos ficticios.
            <br />
            Clima histórico real.
            <br />
            Supuestos a la vista.
          </p>
          <div className="actions vertical">
            <button disabled={!valid || exporting} onClick={() => void exportPlan()}>
              Exportar dossier
            </button>
            <button disabled={!valid || exporting} onClick={() => void exportPlan(true)}>
              Exportar comparación CSV
            </button>
          </div>
        </aside>
        <main id="workspace" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <p className="eyebrow">PLANIFICACIÓN AGRÍCOLA / {tab.toUpperCase()}</p>
              <h1>
                {tab === 'Lote'
                  ? 'Una decisión empieza por su contexto.'
                  : tab === 'Calendario'
                    ? 'Tres caminos, un mismo horizonte.'
                    : tab === 'Evidencia'
                      ? 'Datos que podés comprobar.'
                      : tab === 'Comparar'
                        ? 'Cada alternativa tiene un costo.'
                        : 'Un análisis que se puede reproducir.'}
              </h1>
            </div>
          </div>
          <p className="save-status" role="status">
            {saveStatus}
          </p>
          {notice && (
            <p className="notice" role="status">
              {notice}
            </p>
          )}
          {recovery !== null && (
            <section className="panel warning">
              <h2>Recuperación del plan</h2>
              <p>{initial.message}</p>
              <div className="actions">
                <button
                  onClick={() =>
                    void saveFile('plan-original.txt', recovery, 'text/plain').catch(() =>
                      setNotice('No se pudo exportar el original.'),
                    )
                  }
                >
                  Exportar original
                </button>
                <button
                  onClick={() => {
                    setRecovery(null)
                    setNotice('Se autorizó reemplazar el plan no compatible por el caso actual.')
                  }}
                >
                  Guardar este caso en su lugar
                </button>
              </div>
            </section>
          )}
          {!valid && (
            <section className="warning" role="alert">
              <b>Revisá los datos antes de comparar o exportar.</b>
              <ul>
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </section>
          )}
          {tab === 'Lote' && (
            <>
              <section className="case-grid">
                {CASES.map((c) => (
                  <article className="case-card" key={c.id}>
                    <p className="eyebrow">CASO ILUSTRATIVO</p>
                    <h2>{c.title}</h2>
                    <p>{c.description}</p>
                    <button onClick={() => setPendingCase(c.id)}>Elegir {c.title}</button>
                  </article>
                ))}
              </section>
              <section className="panel">
                <div className="section-head">
                  <h2>Lote y condiciones</h2>
                  <span className="badge">EDITABLE</span>
                </div>
                <p>
                  Las ubicaciones son puntos regionales de referencia, no establecimientos
                  identificados. Precios, rendimientos, restricciones y fechas son supuestos; sin
                  revisión agronómica local.
                </p>
                <div className="grid fields">
                  <Field label="Nombre del lote">
                    <input
                      maxLength={100}
                      value={plan.plot.name}
                      onChange={(e) => plot({ name: e.target.value })}
                    />
                  </Field>
                  <Numeric
                    label="Superficie (ha)"
                    min={0.01}
                    value={plan.plot.hectares}
                    onChange={(hectares) => plot({ hectares: hectares! })}
                  />
                  <Numeric
                    label="Latitud"
                    min={-90}
                    max={90}
                    value={plan.plot.lat}
                    onChange={(lat) => plot({ lat: lat! })}
                  />
                  <Numeric
                    label="Longitud"
                    min={-180}
                    max={180}
                    value={plan.plot.lon}
                    onChange={(lon) => plot({ lon: lon! })}
                  />
                  <Field label="Inicio del horizonte">
                    <input
                      type="date"
                      value={plan.start}
                      onChange={(e) => setPlan({ ...plan, start: e.target.value })}
                    />
                  </Field>
                  <Field label="Fin del horizonte">
                    <input
                      type="date"
                      value={plan.end}
                      onChange={(e) => setPlan({ ...plan, end: e.target.value })}
                    />
                  </Field>
                  <Field label="Tenencia">
                    <select
                      value={plan.plot.tenancy}
                      onChange={(e) => plot({ tenancy: e.target.value as Plan['plot']['tenancy'] })}
                    >
                      <option value="propio">Propio</option>
                      <option value="alquilado">Alquilado</option>
                    </select>
                  </Field>
                  <Numeric
                    label="Tierra USD/ha por horizonte"
                    nullable
                    value={plan.plot.landCost}
                    onChange={(landCost) => plot({ landCost })}
                  />
                  <Numeric
                    label="Capital disponible USD (total)"
                    nullable
                    max={1e12}
                    value={plan.plot.capital}
                    onChange={(capital) => plot({ capital })}
                  />
                </div>
                <p>
                  Costo de tierra pagado una vez al inicio del horizonte. En propiedad puede ser
                  cero o un costo explícito; no se inventa renta. Cambiar tenencia no cambia el
                  monto automáticamente.
                </p>
              </section>
              <section className="panel">
                <h2>Qué importa en esta decisión</h2>
                <p>
                  Las prioridades cambian los aspectos a revisar, sin fabricar un puntaje único.
                </p>
                <div className="checks">
                  {(
                    [
                      ['water', 'Agua'],
                      ['soil', 'Suelo y cobertura'],
                      ['economy', 'Continuidad económica'],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key}>
                      <input
                        type="checkbox"
                        checked={plan.priorities[key]}
                        onChange={(e) =>
                          setPlan({
                            ...plan,
                            priorities: { ...plan.priorities, [key]: e.target.checked },
                          })
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <button className="primary" onClick={() => setTab('Calendario')}>
                  Continuar al calendario →
                </button>
              </section>
            </>
          )}
          {tab === 'Calendario' && <CalendarEditor plan={plan} update={setPlan} />}
          {tab === 'Evidencia' && (
            <Evidence
              plan={plan}
              update={setPlan}
              {...climate}
              weather={valid ? climate.weather : null}
              busy={climate.busy || !valid}
            />
          )}
          {tab === 'Comparar' &&
            (valid ? (
              <Comparison plan={plan} update={setPlan} weather={climate.weather} />
            ) : (
              <p>No se calculan resultados con datos inválidos.</p>
            ))}
          {tab === 'Datos' && (
            <>
              <section className="panel">
                <h2>Planes y respaldos</h2>
                <p>
                  El dossier conserva el plan y la evidencia cargada con hash del original. Se
                  valida antes de importar; no migra automáticamente el prototipo anterior. Exportá
                  tu plan antes de importar otro.
                </p>
                <div className="actions">
                  <button disabled={!valid || exporting} onClick={() => void exportPlan()}>
                    Guardar dossier JSON
                  </button>
                  <button disabled={!valid || exporting} onClick={() => void exportPlan(true)}>
                    Guardar comparación CSV
                  </button>
                </div>
                <Field label="Importar dossier JSON">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => {
                      void importPlan(e.target.files?.[0])
                      e.target.value = ''
                    }}
                  />
                </Field>
              </section>
              <section className="panel">
                <h2>Ventas previas y referencias de precio</h2>
                <p>
                  CSV de hasta 100 filas. Una venta previa no es una cotización vigente. Moneda USD,
                  unidad USD/t, punto decimal. No se convierte moneda ni se aplica precio
                  automáticamente. Una importación válida reemplaza la lista de referencias.
                </p>
                <p>
                  <a href={import.meta.env.BASE_URL + 'data/precios-ejemplo.csv'} download>
                    Descargar plantilla ilustrativa
                  </a>
                </p>
                <Field label="Importar referencias CSV">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(e) => {
                      void importPrices(e.target.files?.[0])
                      e.target.value = ''
                    }}
                  />
                </Field>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Cultivo</th>
                        <th>Fecha</th>
                        <th>Mercado</th>
                        <th>USD/t</th>
                        <th>Tipo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.references.map((r, i) => (
                        <tr key={i}>
                          <td>{CATALOG[r.crop].name}</td>
                          <td>{r.date}</td>
                          <td>{r.market}</td>
                          <td>{r.price}</td>
                          <td>{r.kind}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="panel">
                <h2>Cómo leer esta demo</h2>
                <ul>
                  <li>
                    Clima: NASA POWER real, histórico, de grilla. Modelado; no sensor de finca.
                  </li>
                  <li>Casos, presupuestos y alternativas: ficticios y editables.</li>
                  <li>Calendario: presencia programada, no cobertura efectiva medida.</li>
                  <li>Economía: USD, sensibilidad determinista, costo de tierra explícito.</li>
                  <li>
                    Agua/suelo: sin predicción de rendimiento, nitrógeno, humedad de raíces ni
                    prescripción de riego.
                  </li>
                  <li>
                    Sin cuentas ni envío automático del plan. Consultar NASA transmite coordenadas y
                    fechas al proveedor.
                  </li>
                  <li>
                    Revisión agronómica y pruebas en teléfono físico pendientes. SMAP/Landsat
                    diferidos por alcance documentado.
                  </li>
                </ul>
                <p>
                  <a
                    href="https://github.com/LechugaPlayer/Nasa-Space-App-2026"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Repositorio, metodología, fuentes y roadmap ↗
                  </a>
                </p>
              </section>
            </>
          )}
          <footer>
            Proyecto independiente · sin afiliación oficial con NASA · no reemplaza revisión local.
          </footer>
        </main>
      </div>
      {pendingCase && (
        <Confirm
          onCancel={() => setPendingCase(null)}
          onConfirm={() => {
            setPlan(casePlan(pendingCase))
            setRecovery(null)
            setPendingCase(null)
            setNotice(
              'Caso ficticio cargado. Presupuestos y alternativas pendientes de revisión local.',
            )
            setTab('Lote')
          }}
        />
      )}
    </div>
  )
}
