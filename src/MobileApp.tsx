import product from '../product.json'
import { toCsv } from './csv'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CloudSun,
  FileText,
  Leaf,
  Plus,
  RotateCcw,
  Share2,
  SlidersHorizontal,
  Sprout,
  Trash2,
  Tractor,
  Wheat,
} from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { App as NativeApp } from '@capacitor/app'
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { calculate, initialScenarios, money, number, type Modules, type Scenario } from './calc'
import './mobile.css'

type Plan = {
  hectares: number
  scenarios: Scenario[]
  modules: Modules
  rent: number
  machine: number
  finance: number
  priceShift: number
  yieldShift: number
  costShift: number
}
const fresh = (): Plan => ({
  hectares: 120,
  scenarios: structuredClone(initialScenarios),
  modules: { Tierra: false, Maquinaria: false, Financiación: false },
  rent: 360,
  machine: 130,
  finance: 65,
  priceShift: 0,
  yieldShift: 0,
  costShift: 0,
})
const key = 'rotacion.android.v1'
function load(): Plan {
  try {
    const p = JSON.parse(localStorage.getItem(key) || 'null')
    if (
      p &&
      Number.isFinite(p.hectares) &&
      p.hectares >= 1 &&
      Array.isArray(p.scenarios) &&
      p.scenarios.length >= 2 &&
      p.scenarios.every(
        (s: Scenario) =>
          typeof s.name === 'string' &&
          Array.isArray(s.crops) &&
          s.crops.length > 0 &&
          s.crops.every(
            (c) =>
              typeof c.crop === 'string' &&
              ['yieldT', 'price', 'direct', 'other'].every(
                (k) =>
                  Number.isFinite(c[k as keyof typeof c]) && Number(c[k as keyof typeof c]) >= 0,
              ),
          ),
      ) &&
      p.modules &&
      ['rent', 'machine', 'finance', 'priceShift', 'yieldShift', 'costShift'].every((k) =>
        Number.isFinite(p[k]),
      )
    )
      return p
  } catch {
    /* A damaged save opens a clean demo. */
  }
  return fresh()
}
const tabs = [
  { name: 'Resumen', icon: Sprout },
  { name: 'Planificar', icon: SlidersHorizontal },
  { name: 'Comparar', icon: BarChart3 },
  { name: 'Datos', icon: FileText },
] as const
type Page = (typeof tabs)[number]['name']
export default function MobileApp() {
  const [plan, setPlan] = useState<Plan>(load)
  const [page, setPage] = useState<Page>('Resumen')
  const [active, setActive] = useState(0)
  const [notice, setNotice] = useState('')
  const [reset, setReset] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [sharing, setSharing] = useState(false)
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(plan))
      setSaveError(false)
    } catch {
      setSaveError(true)
    }
  }, [plan])
  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(''), 4000)
    return () => clearTimeout(id)
  }, [notice])
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    const listener = NativeApp.addListener('backButton', () => {
      if (reset) setReset(false)
      else if (page !== 'Resumen') setPage('Resumen')
      else NativeApp.minimizeApp()
    })
    return () => {
      void listener.then((l) => l.remove())
    }
  }, [page, reset])
  const results = useMemo(
    () =>
      plan.scenarios.map((s) =>
        calculate(
          s,
          plan.hectares,
          plan.modules,
          plan.rent,
          plan.machine,
          plan.finance,
          plan.priceShift,
          plan.yieldShift,
          plan.costShift,
        ),
      ),
    [plan],
  )
  const s = plan.scenarios[active],
    m = results[active]
  const base = calculate(s, plan.hectares, plan.modules, plan.rent, plan.machine, plan.finance)
  const go = (p: Page) => {
    setPage(p)
    window.scrollTo({ top: 0 })
  }
  const update = <K extends keyof Plan>(k: K, value: Plan[K]) =>
    setPlan((p) => ({ ...p, [k]: value }))
  const change = (index: number, field: string, value: string) =>
    update(
      'scenarios',
      plan.scenarios.map((scenario, i) =>
        i === active
          ? {
              ...scenario,
              crops: scenario.crops.map((crop, j) =>
                j === index
                  ? { ...crop, [field]: field === 'crop' ? value : Math.max(0, Number(value) || 0) }
                  : crop,
              ),
            }
          : scenario,
      ),
    )
  const share = async () => {
    setSharing(true)
    const rows = [
      [
        'Escenario',
        'Campaña',
        'Cultivo',
        'Superficie ha',
        'Rendimiento base t/ha',
        'Precio base USD/t',
        'Neto ajustado USD',
        'Variación precio %',
        'Variación rendimiento %',
        'Variación costos %',
      ],
      ...plan.scenarios.flatMap((scenario, i) =>
        scenario.crops.map((crop, j) => [
          scenario.name,
          j + 1,
          crop.crop,
          plan.hectares,
          crop.yieldT,
          crop.price,
          results[i].yearly[j],
          plan.priceShift,
          plan.yieldShift,
          plan.costShift,
        ]),
      ),
    ]
    const csv = toCsv(rows)
    try {
      if (Capacitor.isNativePlatform()) {
        const file = await Filesystem.writeFile({
          path: product.exportFile,
          data: csv,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        })
        await Share.share({
          title: product.name + ' · simulación agrícola',
          text: 'Resultados ilustrativos en USD. Incluye las variaciones aplicadas.',
          files: [file.uri],
        })
      } else {
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
        const link = document.createElement('a')
        link.href = url
        link.download = product.exportFile
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        setNotice('CSV descargado')
      }
    } catch {
      setNotice('No se compartió el archivo. Podés volver a intentarlo.')
    } finally {
      setSharing(false)
    }
  }
  return (
    <div className="mobile-app">
      <header className="mobile-header">
        <a
          className="mobile-brand"
          href="#"
          onClick={(e) => {
            e.preventDefault()
            go('Resumen')
          }}
        >
          <span>
            <Sprout size={23} />
          </span>
          {product.name}
          <span className="android-tag">DEMO</span>
        </a>
        <button
          className="round-button"
          aria-label="Compartir resultados"
          disabled={sharing}
          onClick={share}
        >
          <Share2 size={20} />
        </button>
      </header>
      <main className="mobile-content">
        <div className="farm-line">
          <span className="farm-dot" /> ESTANCIA LA ESPERANZA <span>Itapúa, PY</span>
        </div>
        <div className="mobile-heading">
          <div>
            <p>PLANIFICACIÓN AGRÍCOLA</p>
            <h1>
              {page === 'Resumen'
                ? 'Tu próxima cosecha,\ncon perspectiva.'
                : page === 'Planificar'
                  ? 'Diseñá tu rotación.'
                  : page === 'Comparar'
                    ? 'Dos caminos.\nMás claridad.'
                    : 'Detrás de los números.'}
            </h1>
          </div>
          {page === 'Resumen' && <Wheat className="heading-wheat" size={55} strokeWidth={1.2} />}
        </div>
        <div className="offline-line">
          <Check size={13} />
          {saveError ? 'No se pudo guardar en este dispositivo' : 'Guardado en este dispositivo'}
        </div>
        {page !== 'Datos' && (
          <div className="mobile-scenarios" role="group" aria-label="Escenario activo">
            {plan.scenarios.map((scenario, i) => (
              <button
                key={i}
                aria-pressed={active === i}
                className={active === i ? 'active' : ''}
                onClick={() => setActive(i)}
              >
                <span style={{ background: scenario.color }} />
                {scenario.name}
              </button>
            ))}
          </div>
        )}
        {page === 'Resumen' && (
          <>
            <section className="net-card">
              <div className="net-top">
                <span>NETO ESTIMADO DEL CICLO</span>
                <Leaf size={21} />
              </div>
              <strong>{money(m.net)}</strong>
              <p>
                {number(plan.hectares)} ha <span>·</span> {s.crops.length} campañas <span>·</span>{' '}
                USD
              </p>
              <div className="net-bottom">
                <span>Por hectárea del ciclo</span>
                <b>{money(m.net / plan.hectares)}</b>
              </div>
            </section>
            <div className="mobile-kpis">
              <section>
                <span>
                  <ArrowDownRight size={17} /> Ingresos brutos
                </span>
                <b>{money(m.revenue)}</b>
                <small>Ventas de todo el ciclo</small>
              </section>
              <section>
                <span>
                  <Tractor size={17} /> Mayor costo de campaña
                </span>
                <b>{money(m.maxCapital)}</b>
                <small>Mayor costo por campaña</small>
              </section>
            </div>
            <section className="mobile-card">
              <div className="section-heading">
                <h2>Tu secuencia de cultivos</h2>
                <button onClick={() => go('Planificar')}>
                  Editar <ChevronRight size={14} />
                </button>
              </div>
              <div className="crop-timeline">
                {s.crops.map((c, i) => (
                  <div key={i}>
                    <span className="timeline-icon">
                      <Wheat size={20} />
                    </span>
                    <div>
                      <small>CAMPAÑA {i + 1}</small>
                      <b>{c.crop}</b>
                      <span>
                        {number(c.yieldT)} t/ha · {money(c.price)}/t
                      </span>
                    </div>
                    <strong className={m.yearly[i] < 0 ? 'loss' : ''}>{money(m.yearly[i])}</strong>
                  </div>
                ))}
              </div>
              <div className="card-foot">Resultado neto por campaña, con ajustes aplicados.</div>
            </section>
            <button className="compare-cta" onClick={() => go('Comparar')}>
              <span className="cta-icon">
                <BarChart3 size={23} />
              </span>
              <span>
                <b>Explorá la otra alternativa</b>
                <small>Compará resultados y capital</small>
              </span>
              <ArrowRight size={20} />
            </button>
            <div className="mobile-note">
              <CloudSun size={21} />
              <div>
                <b>El campo tiene más variables.</b>
                <p>
                  Esta demo usa valores ilustrativos. El clima y el suelo todavía no están
                  conectados.
                </p>
              </div>
            </div>
          </>
        )}
        {page === 'Planificar' && (
          <>
            <section className="mobile-card">
              <div className="section-heading">
                <h2>Tu establecimiento</h2>
              </div>
              <div className="mobile-fields">
                <Numeric
                  label="Superficie (ha)"
                  value={plan.hectares}
                  min={1}
                  onChange={(v) => update('hectares', Math.max(1, v))}
                />
                <div className="static-field">
                  <span>Moneda de cálculo</span>
                  <b>USD · Dólar</b>
                </div>
              </div>
            </section>
            <div className="section-heading standalone">
              <h2>Campañas de {s.name.slice(-1)}</h2>
              <span>{s.crops.length} / 6</span>
            </div>
            {s.crops.map((crop, i) => (
              <section className="mobile-card crop-editor" key={i}>
                <div className="section-heading">
                  <h2>
                    <span className="campaign-number">{i + 1}</span> Campaña {i + 1}
                  </h2>
                  <button
                    aria-label={`Eliminar campaña ${i + 1}`}
                    disabled={s.crops.length === 1}
                    onClick={() =>
                      update(
                        'scenarios',
                        plan.scenarios.map((v, j) =>
                          j === active ? { ...v, crops: v.crops.filter((_, k) => k !== i) } : v,
                        ),
                      )
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
                <label className="mobile-field crop-select">
                  <span>Cultivo</span>
                  <select value={crop.crop} onChange={(e) => change(i, 'crop', e.target.value)}>
                    {['Soja', 'Maíz', 'Trigo', 'Canola', 'Cobertura'].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <div className="mobile-fields">
                  {(
                    [
                      ['yieldT', 'Rendimiento (t/ha)'],
                      ['price', 'Precio (USD/t)'],
                      ['direct', 'Costo directo (USD/ha)'],
                      ['other', 'Otros costos (USD/ha)'],
                    ] as const
                  ).map(([field, label]) => (
                    <Numeric
                      key={field}
                      label={label}
                      value={crop[field]}
                      onChange={(v) => change(i, field, String(v))}
                    />
                  ))}
                </div>
              </section>
            ))}
            <button
              className="mobile-add"
              disabled={s.crops.length >= 6}
              onClick={() =>
                update(
                  'scenarios',
                  plan.scenarios.map((v, i) =>
                    i === active
                      ? { ...v, crops: [...v.crops, { ...v.crops[v.crops.length - 1] }] }
                      : v,
                  ),
                )
              }
            >
              <Plus size={18} /> Agregar campaña
            </button>
            <section className="mobile-card">
              <div className="section-heading">
                <h2>Costos adicionales</h2>
              </div>
              <p className="section-sub">USD por hectárea y por campaña.</p>
              {(
                [
                  ['Tierra', 'rent'],
                  ['Maquinaria', 'machine'],
                  ['Financiación', 'finance'],
                ] as const
              ).map(([label, field]) => (
                <div className="cost-option" key={field}>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!plan.modules[label]}
                      onChange={(e) =>
                        update('modules', { ...plan.modules, [label]: e.target.checked })
                      }
                    />
                    <span>{label}</span>
                  </label>
                  {plan.modules[label] && (
                    <Numeric
                      label={`${label} (USD/ha)`}
                      value={plan[field]}
                      onChange={(v) => update(field, v)}
                    />
                  )}
                </div>
              ))}
            </section>
            <button className="mobile-primary" onClick={() => go('Resumen')}>
              Ver resultado <ArrowRight size={18} />
            </button>
          </>
        )}
        {page === 'Comparar' && (
          <>
            <section className="mobile-card">
              <div className="section-heading">
                <h2>Resultado de cada alternativa</h2>
              </div>
              <p className="section-sub">Total del ciclo · {number(plan.hectares)} ha</p>
              {plan.scenarios.map((scenario, i) => (
                <button
                  className={`comparison-row ${i === active ? 'chosen' : ''}`}
                  key={i}
                  onClick={() => setActive(i)}
                >
                  <span>
                    <b>{scenario.name}</b>
                    <small>{scenario.crops.map((c) => c.crop).join(' → ')}</small>
                  </span>
                  <strong className={results[i].net < 0 ? 'loss' : ''}>
                    {money(results[i].net)}
                  </strong>
                  <span className="comparison-bar">
                    <i
                      style={{
                        width: `${Math.max(3, (Math.abs(results[i].net) / Math.max(1, ...results.map((r) => Math.abs(r.net)))) * 100)}%`,
                        background: results[i].net < 0 ? '#ac4d3b' : scenario.color,
                      }}
                    />
                  </span>
                </button>
              ))}
              <div className="compare-detail">
                {[
                  ['Margen bruto', 'gross'],
                  ['Costos totales', 'cost'],
                  ['Mayor costo de campaña', 'maxCapital'],
                ].map(([label, field]) => (
                  <div key={field}>
                    <span>{label}</span>
                    {results.map((r, i) => (
                      <b key={i}>
                        {money(r[field as 'gross'])}
                        <small>{plan.scenarios[i].name.slice(-1)}</small>
                      </b>
                    ))}
                  </div>
                ))}
              </div>
            </section>
            <section className="mobile-card">
              <div className="section-heading">
                <h2>¿Y si cambian las condiciones?</h2>
              </div>
              <p className="section-sub">Los ajustes se aplican a ambos escenarios.</p>
              {(
                [
                  ['priceShift', 'Precio de venta'],
                  ['yieldShift', 'Rendimiento'],
                  ['costShift', 'Costos directos y otros'],
                ] as const
              ).map(([field, label]) => (
                <div className="mobile-slider" key={field}>
                  <label htmlFor={field}>
                    {label}
                    <b>
                      {plan[field] > 0 ? '+' : ''}
                      {plan[field]}%
                    </b>
                  </label>
                  <input
                    id={field}
                    aria-label={label}
                    type="range"
                    min={-30}
                    max={30}
                    value={plan[field]}
                    onChange={(e) => update(field, Number(e.target.value))}
                  />
                  <div>
                    <span>−30%</span>
                    <span>+30%</span>
                  </div>
                </div>
              ))}
              <div className="sensitivity-result">
                <span>Cambio en {s.name}</span>
                <b className={m.net < base.net ? 'loss' : ''}>
                  {m.net >= base.net ? '+' : '−'}
                  {money(Math.abs(m.net - base.net))}
                </b>
              </div>
              <button
                className="text-action"
                onClick={() =>
                  setPlan((p) => ({ ...p, priceShift: 0, yieldShift: 0, costShift: 0 }))
                }
              >
                <RotateCcw size={14} /> Quitar ajustes
              </button>
            </section>
            <section className="mobile-card">
              <div className="section-heading">
                <h2>Equilibrio · {s.name.slice(-1)}</h2>
              </div>
              <div className="equilibrium">
                <span>
                  Precio de equilibrio (una campaña)<b>{money(m.breakPrice)}/t</b>
                </span>
                <span>
                  Rendimiento de equilibrio (una campaña)<b>{number(m.breakYield)} t/ha</b>
                </span>
              </div>
              <p className="section-sub">
                Solo se calcula para una campaña. Para ciclos múltiples se muestra No definido;
                revisar cada campaña por separado.
              </p>
            </section>
          </>
        )}
        {page === 'Datos' && (
          <>
            <section className="mobile-card data-copy">
              <span className="data-badge">DEMO LOCAL · SIN CUENTA</span>
              <h2>Supuestos a la vista.</h2>
              <p>
                La calculadora anterior es la base de esta versión Android. Los precios,
                rendimientos y costos son ejemplos editables, no cotizaciones actuales.
              </p>
              <dl>
                <dt>Ingreso bruto</dt>
                <dd>Rendimiento × precio × superficie, sumado por campaña.</dd>
                <dt>Neto estimado</dt>
                <dd>
                  Ingresos menos costos directos, otros costos y componentes adicionales activos.
                </dd>
                <dt>Mayor costo de campaña</dt>
                <dd>Mayor costo de una campaña. No modela el calendario de cobros y pagos.</dd>
                <dt>Sensibilidad</dt>
                <dd>
                  Ajusta precios, rendimientos, costos directos y otros costos. Los adicionales
                  permanecen fijos.
                </dd>
                <dt>Datos y conexión</dt>
                <dd>
                  El plan se guarda en este dispositivo. El APK calcula sin conexión; la web
                  necesita cargar inicialmente; compartir requiere una app compatible. NASA no está
                  conectado.
                </dd>
              </dl>
            </section>
            <section className="mobile-card data-copy">
              <h2>Tu demo, desde cero</h2>
              <p>Podés restablecer los dos escenarios originales y todos sus valores.</p>
              <button className="reset-button" onClick={() => setReset(true)}>
                <RotateCcw size={16} /> Restablecer demo
              </button>
            </section>
          </>
        )}
        <p className="mobile-disclaimer">
          SIMULACIÓN ILUSTRATIVA · VALIDÁ LOS SUPUESTOS CON TU ASESOR
        </p>
      </main>
      <nav className="bottom-nav" aria-label="Navegación principal">
        {tabs.map(({ name, icon: Icon }) => (
          <button
            key={name}
            className={page === name ? 'active' : ''}
            aria-current={page === name ? 'page' : undefined}
            onClick={() => go(name)}
          >
            <span>
              <Icon size={21} />
            </span>
            {name}
          </button>
        ))}
      </nav>
      {notice && (
        <div role="status" className="mobile-toast">
          {notice}
        </div>
      )}
      {reset && (
        <div className="modal-backdrop">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            className="mobile-modal"
          >
            <h2 id="reset-title">¿Restablecer la demo?</h2>
            <p>
              Se reemplazarán los valores guardados en este dispositivo por los ejemplos originales.
            </p>
            <button
              className="mobile-primary"
              onClick={() => {
                setPlan(fresh())
                setActive(0)
                setReset(false)
                setNotice('Demo restablecida')
              }}
            >
              Restablecer
            </button>
            <button className="text-action" autoFocus onClick={() => setReset(false)}>
              Conservar mi plan
            </button>
          </section>
        </div>
      )}
    </div>
  )
}
function Numeric({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
}) {
  return (
    <label className="mobile-field">
      <span>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        step="any"
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
      />
    </label>
  )
}
