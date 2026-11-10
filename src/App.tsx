import product from '../product.json'
import { toCsv } from './csv'
import { useMemo, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  CloudSun,
  Coins,
  Download,
  Info,
  Leaf,
  Menu,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Sprout,
  Tractor,
  Wheat,
  X,
} from 'lucide-react'
import { calculate, initialScenarios, money, number, type Modules, type Scenario } from './calc'

type Page = 'Calculadora' | 'Comparar' | 'Recomendaciones' | 'Datos'
const categories = [
  { name: 'Producción', desc: 'Rendimiento y precios', icon: Wheat, enabled: true },
  { name: 'Costos directos', desc: 'Insumos y labores', icon: Coins, enabled: true },
  { name: 'Tierra', desc: 'Alquiler o costo propio', icon: Sprout, enabled: false },
  { name: 'Maquinaria', desc: 'Costos de operación', icon: Tractor, enabled: false },
  { name: 'Comercialización', desc: 'Flete y descuentos', icon: BarChart3, enabled: false },
  { name: 'Financiación', desc: 'Intereses y capital', icon: Activity, enabled: false },
  { name: 'Flujo de caja', desc: 'Pagos y cobros', icon: Coins, enabled: false },
  { name: 'Contexto NASA', desc: 'Clima y suelo · demo', icon: CloudSun, enabled: false },
]
const fmtShort = (v: number) =>
  Math.abs(v) >= 1000000 ? `${(v / 1000000).toFixed(1)} M` : `${Math.round(v / 1000)} mil`

export default function App() {
  const [page, setPage] = useState<Page>('Calculadora')
  const [hectares, setHectares] = useState(120)
  const [horizon, setHorizon] = useState(3)
  const [currency, setCurrency] = useState('USD')
  const [tenure, setTenure] = useState('Propia')
  const [modules, setModules] = useState<Modules>(
    Object.fromEntries(categories.map((c) => [c.name, c.enabled])),
  )
  const [scenarios, setScenarios] = useState<Scenario[]>(initialScenarios)
  const [active, setActive] = useState(0)
  const [priceShift, setPriceShift] = useState(0)
  const [yieldShift, setYieldShift] = useState(0)
  const [costShift, setCostShift] = useState(0)
  const [recMode, setRecMode] = useState<'Teórica / agronómica' | 'Económica'>(
    'Teórica / agronómica',
  )
  const [mobileMenu, setMobileMenu] = useState(false)
  const rentPerHa = tenure === 'Alquilada' ? 360 : 0
  const machinePerHa = 130
  const financePerHa = 65
  const metrics = useMemo(
    () =>
      scenarios.map((s) =>
        calculate(
          { ...s, crops: s.crops.slice(0, horizon) },
          hectares,
          modules,
          rentPerHa,
          machinePerHa,
          financePerHa,
          priceShift,
          yieldShift,
          costShift,
        ),
      ),
    [scenarios, hectares, horizon, modules, rentPerHa, priceShift, yieldShift, costShift],
  )
  const baseline = useMemo(
    () =>
      scenarios.map((s) =>
        calculate(
          { ...s, crops: s.crops.slice(0, horizon) },
          hectares,
          modules,
          rentPerHa,
          machinePerHa,
          financePerHa,
        ),
      ),
    [scenarios, hectares, horizon, modules, rentPerHa],
  )
  const selected = metrics[active]
  const changeCrop = (
    si: number,
    yi: number,
    key: 'crop' | 'yieldT' | 'price' | 'direct' | 'other',
    value: string,
  ) =>
    setScenarios((prev) =>
      prev.map((s, i) =>
        i !== si
          ? s
          : {
              ...s,
              crops: s.crops.map((c, j) =>
                j !== yi
                  ? c
                  : { ...c, [key]: key === 'crop' ? value : Math.max(0, Number(value) || 0) },
              ),
            },
      ),
    )
  const toggle = (name: string) => setModules((prev) => ({ ...prev, [name]: !prev[name] }))
  const navItems: { name: Page; icon: typeof BarChart3 }[] = [
    { name: 'Calculadora', icon: SlidersHorizontal },
    { name: 'Comparar', icon: BarChart3 },
    { name: 'Recomendaciones', icon: Leaf },
    { name: 'Datos', icon: CloudSun },
  ]
  const addYear = (si: number) =>
    setScenarios((prev) =>
      prev.map((s, i) =>
        i === si ? { ...s, crops: [...s.crops, { ...s.crops[s.crops.length - 1] }] } : s,
      ),
    )
  const removeYear = (si: number, yi: number) =>
    setScenarios((prev) =>
      prev.map((s, i) =>
        i === si && s.crops.length > 1 ? { ...s, crops: s.crops.filter((_, j) => j !== yi) } : s,
      ),
    )
  const exportCsv = () => {
    const rows = [
      [
        'Escenario',
        'Campaña',
        'Cultivo',
        'Rendimiento base t/ha',
        'Precio base ' + currency + '/t',
        'Ingreso ajustado ' + currency,
        'Neto ajustado ' + currency,
        'Variación precio %',
        'Variación rendimiento %',
        'Variación costos %',
      ],
      ...scenarios.flatMap((s, i) =>
        s.crops
          .slice(0, horizon)
          .map((c, y) => [
            s.name,
            y + 1,
            c.crop,
            c.yieldT,
            c.price,
            c.yieldT * (1 + yieldShift / 100) * c.price * (1 + priceShift / 100) * hectares,
            metrics[i].yearly[y],
            priceShift,
            yieldShift,
            costShift,
          ]),
      ),
    ]
    const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = product.exportFile
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Sprout size={20} />
          </div>
          <div>
            <b>{product.name}</b>
            <small>{product.tagline}</small>
          </div>
          <button className="close-menu" onClick={() => setMobileMenu(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="workspace-label">ESPACIO DE TRABAJO</div>
        <button className="farm-select">
          <span className="farm-icon">E</span>
          <span>
            <b>Estancia La Esperanza</b>
            <small>Itapúa, Paraguay</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <div className="nav-label">ANÁLISIS</div>
        <nav>
          {navItems.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${page === name ? 'selected' : ''}`}
              onClick={() => {
                setPage(name)
                setMobileMenu(false)
              }}
            >
              <Icon size={17} />
              {name}
              {name === 'Datos' && <span className="nav-demo">DEMO</span>}
            </button>
          ))}
        </nav>
        <div className="side-spacer" />
        <div className="season-card">
          <div className="season-head">
            <span className="season-dot" /> CAMPAÑA ACTUAL
          </div>
          <b>2025 / 26</b>
          <span>Planificación en curso</span>
          <div className="season-progress">
            <i />
          </div>
          <small>2 de 3 campañas modeladas</small>
        </div>
        <div className="profile">
          <div className="avatar">MG</div>
          <div>
            <b>María González</b>
            <small>Productora · Plan demo</small>
          </div>
          <ChevronDown size={15} />
        </div>
      </aside>
      {mobileMenu && (
        <button className="scrim" onClick={() => setMobileMenu(false)} aria-label="Cerrar menú" />
      )}
      <main className="main-area">
        <header className="topbar">
          <button className="menu-button" onClick={() => setMobileMenu(true)}>
            <Menu size={20} />
          </button>
          <div className="breadcrumbs">
            Estancia La Esperanza <span>/</span> <b>{page}</b>
          </div>
          <div className="top-actions">
            <span className="demo-pill">
              <i /> Datos ilustrativos
            </span>
            <button className="icon-button" title="Ayuda">
              <CircleHelp size={18} />
            </button>
            <div className="top-avatar">MG</div>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                PLANIFICACIÓN AGRÍCOLA <span>·</span> CAMPAÑA 2025 / 26
              </div>
              <h1>{page === 'Calculadora' ? 'Calculadora de rotaciones' : page}</h1>
              <p>
                {page === 'Calculadora'
                  ? 'Explorá escenarios productivos y entendé su impacto económico.'
                  : page === 'Comparar'
                    ? 'Compará resultados, costos y liquidez entre tus alternativas.'
                    : page === 'Recomendaciones'
                      ? 'Criterios transparentes para pensar tus próximos pasos.'
                      : 'Fuentes, supuestos y contexto de esta simulación.'}
              </p>
            </div>
            <button className="button secondary export" onClick={exportCsv}>
              <Download size={16} /> Exportar
            </button>
          </div>
          <div className="assumption-banner">
            <Info size={15} />
            <span>
              <b>Simulación ilustrativa.</b> Valores de ejemplo en USD por hectárea; ajustalos a tu
              establecimiento antes de usar estos resultados.
            </span>
            <button onClick={() => setPage('Datos')}>
              Ver supuestos <span>→</span>
            </button>
          </div>
          {page === 'Calculadora' && (
            <>
              <div className="overview-grid">
                <section className="panel general-panel">
                  <div className="panel-title">
                    <div>
                      <h2>Datos generales</h2>
                      <p>Definí el alcance de tu análisis</p>
                    </div>
                    <button
                      className="subtle-button"
                      title="Restablecer demo"
                      onClick={() => {
                        setScenarios(initialScenarios)
                        setHectares(120)
                        setPriceShift(0)
                        setYieldShift(0)
                        setCostShift(0)
                      }}
                    >
                      <RotateCcw size={15} />
                    </button>
                  </div>
                  <div className="form-grid">
                    <label className="field">
                      <span>Superficie</span>
                      <div className="input-unit">
                        <input
                          type="number"
                          min="1"
                          value={hectares}
                          onChange={(e) => setHectares(Math.max(1, Number(e.target.value) || 1))}
                        />
                        <em>ha</em>
                      </div>
                    </label>
                    <label className="field">
                      <span>Horizonte</span>
                      <div className="select-wrap">
                        <select
                          value={horizon}
                          onChange={(e) => setHorizon(Number(e.target.value))}
                        >
                          <option value={2}>2 campañas</option>
                          <option value={3}>3 campañas</option>
                          <option value={4}>4 campañas</option>
                          <option value={5}>5 campañas</option>
                        </select>
                        <ChevronDown size={14} />
                      </div>
                    </label>
                    <label className="field">
                      <span>Moneda · sin conversión</span>
                      <div className="select-wrap">
                        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                          <option value="USD">USD · Dólar</option>
                        </select>
                        <ChevronDown size={14} />
                      </div>
                    </label>
                    <label className="field">
                      <span>Tenencia</span>
                      <div className="select-wrap">
                        <select value={tenure} onChange={(e) => setTenure(e.target.value)}>
                          <option>Propia</option>
                          <option>Alquilada</option>
                        </select>
                        <ChevronDown size={14} />
                      </div>
                    </label>
                  </div>
                </section>
                <section className="panel module-panel">
                  <div className="panel-title">
                    <div>
                      <h2>Componentes del análisis</h2>
                      <p>Activá categorías para ampliar métricas</p>
                    </div>
                    <span className="module-count">
                      {Object.values(modules).filter(Boolean).length} activos
                    </span>
                  </div>
                  <div className="module-grid">
                    {categories.map(({ name, desc, icon: Icon }) => (
                      <button
                        className={`module-card ${modules[name] ? 'on' : ''}`}
                        key={name}
                        onClick={() => toggle(name)}
                      >
                        <span className="module-icon">
                          <Icon size={16} />
                        </span>
                        <span className="module-copy">
                          <b>{name}</b>
                          <small>{desc}</small>
                        </span>
                        <span className={`toggle ${modules[name] ? 'checked' : ''}`}>
                          <i />
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
              {modules['Contexto NASA'] && (
                <section className="nasa-banner">
                  <div className="nasa-icon">
                    <CloudSun size={22} />
                  </div>
                  <div className="nasa-copy">
                    <b>Contexto ambiental · demostración</b>
                    <p>
                      Itapúa · lluvia acumulada <strong>184 mm</strong> · humedad de suelo{' '}
                      <strong>0,31 m³/m³</strong> · temp. media <strong>24,8 °C</strong>
                    </p>
                    <small>
                      Datos ficticios para la demo. Una integración futura podría consultar NASA
                      POWER, GPM y SMAP.
                    </small>
                  </div>
                  <span className="demo-tag">MOCK</span>
                </section>
              )}
              <section className="panel scenario-panel">
                <div className="scenario-head">
                  <div>
                    <h2>Escenarios de rotación</h2>
                    <p>Editá cada cultivo para modelar tus alternativas</p>
                  </div>
                  <div className="scenario-tabs">
                    {scenarios.map((s, i) => (
                      <button
                        key={i}
                        className={active === i ? 'active' : ''}
                        onClick={() => setActive(i)}
                      >
                        <i style={{ background: s.color }} />
                        {s.name}
                      </button>
                    ))}
                    <button
                      className="add-scenario"
                      onClick={() => {
                        setScenarios((prev) => [
                          ...prev,
                          {
                            name: `Escenario ${String.fromCharCode(65 + prev.length)}`,
                            color: '#6d78af',
                            crops: [...prev[0].crops],
                          },
                        ])
                        setActive(scenarios.length)
                      }}
                    >
                      <Plus size={15} /> Agregar
                    </button>
                  </div>
                </div>
                <div className="table-scroll">
                  <table className="crop-table">
                    <thead>
                      <tr>
                        <th>CAMPAÑA / CULTIVO</th>
                        <th>
                          RENDIMIENTO <small>t / ha</small>
                        </th>
                        <th>
                          PRECIO <small>USD / t</small>
                        </th>
                        <th>
                          COSTO DIRECTO <small>USD / ha</small>
                        </th>
                        <th>
                          OTROS COSTOS <small>USD / ha</small>
                        </th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {scenarios[active].crops.slice(0, horizon).map((c, yi) => (
                        <tr key={yi}>
                          <td>
                            <div className="crop-name">
                              <span
                                className={`crop-badge ${c.crop.toLowerCase() === 'soja' ? 'soy' : c.crop.toLowerCase() === 'maíz' ? 'corn' : 'wheat'}`}
                              >
                                {c.crop === 'Soja' ? 'S' : c.crop === 'Maíz' ? 'M' : 'T'}
                              </span>
                              <div>
                                <b>
                                  Campaña {2025 + yi} / {String(26 + yi).padStart(2, '0')}
                                </b>
                                <select
                                  value={c.crop}
                                  onChange={(e) => changeCrop(active, yi, 'crop', e.target.value)}
                                >
                                  <option>Soja</option>
                                  <option>Maíz</option>
                                  <option>Trigo</option>
                                  <option>Canola</option>
                                  <option>Cobertura</option>
                                </select>
                              </div>
                            </div>
                          </td>
                          {(['yieldT', 'price', 'direct', 'other'] as const).map((k) => (
                            <td key={k}>
                              <input
                                className="table-input"
                                type="number"
                                value={c[k]}
                                step={k === 'yieldT' ? '.1' : '10'}
                                onChange={(e) => changeCrop(active, yi, k, e.target.value)}
                              />
                            </td>
                          ))}
                          <td>
                            <button
                              className="remove-row"
                              title="Quitar campaña"
                              onClick={() => removeYear(active, yi)}
                            >
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="add-year" onClick={() => addYear(active)}>
                  <Plus size={15} /> Agregar campaña
                </button>
                <div className="table-note">
                  <Info size={14} /> Los costos adicionales se calculan al activar Tierra,
                  Maquinaria o Financiación.
                </div>
              </section>
              <div className="results-title">
                <div>
                  <h2>Resultado estimado</h2>
                  <span>
                    Escenario {String.fromCharCode(65 + active)} <i>·</i> {hectares} ha <i>·</i>{' '}
                    {Math.min(horizon, scenarios[active].crops.length)} campañas
                  </span>
                </div>
                <span className="live-indicator">
                  <i /> Actualizado en tiempo real
                </span>
              </div>
              <div className="kpi-grid">
                <Kpi
                  label="Ingresos brutos"
                  value={money(selected.revenue, currency)}
                  hint="Ventas proyectadas"
                  icon={<ArrowUpRight size={17} />}
                  tint="green"
                />
                <Kpi
                  label="Margen bruto"
                  value={money(selected.gross, currency)}
                  hint="Ingresos − costos directos"
                  icon={<BarChart3 size={17} />}
                  tint="blue"
                />
                <Kpi
                  label="Neto estimado"
                  value={money(selected.net, currency)}
                  hint="Después de costos activados"
                  icon={<Coins size={17} />}
                  tint="dark"
                  featured
                />
                <Kpi
                  label="Mayor costo de campaña"
                  value={money(selected.maxCapital, currency)}
                  hint="Mayor inversión por campaña"
                  icon={<ArrowDownRight size={17} />}
                  tint="amber"
                />
              </div>
              <div className="insight-grid">
                <section className="panel chart-panel">
                  <div className="panel-title">
                    <div>
                      <h2>Acumulado por campaña</h2>
                      <p>Resultado neto estimado · {currency}</p>
                    </div>
                    <span className="chart-legend">
                      <i style={{ background: scenarios[active].color }} /> {scenarios[active].name}
                    </span>
                  </div>
                  <div className="chart-area">
                    <div className="y-labels">
                      <span>{fmtShort(Math.max(...selected.yearly, 0))}</span>
                      <span>0</span>
                      <span>−{fmtShort(Math.abs(Math.min(...selected.yearly, 0)))}</span>
                    </div>
                    <div className="plot">
                      <div className="grid-line top" />
                      <div className="grid-line middle" />
                      <div className="grid-line bottom" />
                      <div className="bars">
                        {selected.yearly.slice(0, horizon).map((v, i) => (
                          <div className="bar-col" key={i}>
                            <div
                              className={`bar ${v < 0 ? 'negative' : ''}`}
                              style={{
                                height: `${Math.max(7, (Math.abs(v) / Math.max(1, ...selected.yearly.map(Math.abs))) * 82)}%`,
                                background: scenarios[active].color,
                              }}
                              title={money(v, currency)}
                            />
                            <small>Camp. {i + 1}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="chart-foot">
                    <span>Resultado total del horizonte</span>
                    <b>{money(selected.net, currency)}</b>
                  </div>
                </section>
                <section className="panel break-panel">
                  <div className="panel-title">
                    <div>
                      <h2>Puntos de equilibrio</h2>
                      <p>Para cubrir los costos modelados</p>
                    </div>
                    <CircleHelp size={16} className="help-gray" />
                  </div>
                  <div className="break-row">
                    <span>
                      <i className="break-icon price-icon">$</i>
                      <span>
                        <b>Precio de equilibrio</b>
                        <small>Promedio ponderado del ciclo</small>
                      </span>
                    </span>
                    <strong>
                      {money(selected.breakPrice, currency)}
                      <small> / t</small>
                    </strong>
                  </div>
                  <div className="break-row">
                    <span>
                      <i className="break-icon yield-icon">↗</i>
                      <span>
                        <b>Rendimiento de equilibrio</b>
                        <small>Promedio del ciclo</small>
                      </span>
                    </span>
                    <strong>
                      {number(selected.breakYield)}
                      <small> t / ha</small>
                    </strong>
                  </div>
                  <div className="break-note">
                    <Info size={14} /> Los puntos de equilibrio se estiman con los costos y cultivos
                    cargados para el horizonte.
                  </div>
                </section>
              </div>
              <section className="panel sensitivity-panel">
                <div className="panel-title">
                  <div>
                    <h2>Análisis de sensibilidad</h2>
                    <p>Mové las variables para ver cómo cambia el resultado neto</p>
                  </div>
                  <button
                    className="subtle-button"
                    onClick={() => {
                      setPriceShift(0)
                      setYieldShift(0)
                      setCostShift(0)
                    }}
                  >
                    <RotateCcw size={14} /> Restablecer
                  </button>
                </div>
                <div className="sensitivity-grid">
                  <Sensitivity
                    label="Precio de venta"
                    value={priceShift}
                    onChange={setPriceShift}
                    color="green"
                  />
                  <Sensitivity
                    label="Rendimiento"
                    value={yieldShift}
                    onChange={setYieldShift}
                    color="blue"
                  />
                  <Sensitivity
                    label="Costos"
                    value={costShift}
                    onChange={setCostShift}
                    color="amber"
                  />
                </div>
                <div className="impact-note">
                  <span className="impact-dot" />
                  <span>
                    Con estos cambios, el neto estimado es <b>{money(selected.net, currency)}</b>.
                  </span>
                  <span
                    className="impact-delta"
                    data-negative={selected.net < baseline[active].net}
                  >
                    {selected.net >= baseline[active].net ? '+' : '−'}
                    {money(Math.abs(selected.net - baseline[active].net), currency)}
                  </span>
                </div>
              </section>
            </>
          )}
          {page === 'Comparar' && (
            <ComparePage
              scenarios={scenarios}
              metrics={metrics}
              active={active}
              setActive={setActive}
              currency={currency}
            />
          )}
          {page === 'Recomendaciones' && (
            <section className="recommend-layout">
              <div className="panel rec-main">
                <div className="rec-mode-tabs">
                  {(['Teórica / agronómica', 'Económica'] as const).map((mode) => (
                    <button
                      onClick={() => setRecMode(mode)}
                      className={recMode === mode ? 'active' : ''}
                      key={mode}
                    >
                      {mode === 'Económica' ? <Coins size={16} /> : <Leaf size={16} />} {mode}
                    </button>
                  ))}
                </div>
                <div className="rec-lead">
                  <div className="rec-icon">
                    <Leaf size={21} />
                  </div>
                  <div>
                    <span className="eyebrow">
                      {recMode === 'Económica' ? 'LECTURA ECONÓMICA' : 'LECTURA AGRONÓMICA'}
                    </span>
                    <h2>
                      {recMode === 'Económica'
                        ? 'El escenario con mayor neto es ' +
                          scenarios[metrics[1]?.net > metrics[0]?.net ? 1 : 0].name
                        : 'Una rotación con gramíneas diversifica el ciclo'}
                    </h2>
                    <p>
                      {recMode === 'Económica'
                        ? `Con los supuestos actuales, ${scenarios[metrics[1]?.net > metrics[0]?.net ? 1 : 0].name} muestra ${money(Math.abs(metrics[0]?.net - metrics[1]?.net), currency)} de diferencia neta en ${hectares} ha. El resultado cambia si varían precios o costos.`
                        : 'Incluir cultivos de familias distintas puede contribuir a diversificar riesgos y alternar demandas de nutrientes. Contenido educativo general: esta sección todavía no analiza las secuencias cargadas.'}
                    </p>
                  </div>
                </div>
                <div className="criteria-title">
                  <h3>Criterios usados</h3>
                  <span>Criterios orientativos · demo</span>
                </div>
                {(recMode === 'Económica'
                  ? [
                      ['Resultado neto estimado', 'Compara ingresos y costos por campaña', 'check'],
                      [
                        'Mayor costo de campaña',
                        'Considera la mayor necesidad de fondos',
                        'neutral',
                      ],
                      [
                        'Sensibilidad de precios y costos',
                        'Consultá el módulo de sensibilidad',
                        'neutral',
                      ],
                    ]
                  : [
                      ['Diversidad de familias', 'Revisar familias con un asesor local', 'neutral'],
                      ['Repetición de soja', 'Revisar repetición de cultivos', 'neutral'],
                      ['Cultivos de cobertura', 'Registrar cobertura y residuos', 'neutral'],
                    ]
                ).map(([title, desc, state]) => (
                  <div className="criteria-row" key={title}>
                    <span className={`criteria-check ${state}`}>
                      <Check size={13} />
                    </span>
                    <div>
                      <b>{title}</b>
                      <small>{desc}</small>
                    </div>
                    <span className={`criteria-state ${state}`}>
                      {state === 'check' ? 'Considerado' : 'A revisar'}
                    </span>
                  </div>
                ))}
                <div className="disclaimer">
                  <Info size={16} />
                  <span>
                    Estas señales son orientativas y no constituyen una recomendación definitiva.{' '}
                    <b>Validá el plan con tu asesor agronómico</b> y condiciones locales.
                  </span>
                </div>
              </div>
              <aside className="rec-aside">
                <div className="panel">
                  <h3>Escenarios evaluados</h3>
                  <p className="aside-sub">Resultados según el orden de carga</p>
                  {scenarios.map((s, i) => (
                    <button
                      className="ranking-row"
                      key={i}
                      onClick={() => {
                        setActive(i)
                        setPage('Calculadora')
                      }}
                    >
                      <span className="rank">0{i + 1}</span>
                      <span>
                        <b>{s.name}</b>
                        <small>{s.crops.map((c) => c.crop).join(' → ')}</small>
                      </span>
                      <strong>{money(metrics[i].net, currency)}</strong>
                    </button>
                  ))}
                </div>
                <div className="panel rec-tip">
                  <div className="tip-heading">
                    <Info size={16} /> Cómo leer esto
                  </div>
                  <p>
                    Las reglas comparan únicamente los datos ingresados. El resultado económico no
                    mide salud del suelo, riesgo climático ni restricciones operativas.
                  </p>
                  <button onClick={() => setPage('Calculadora')}>
                    Ajustar escenarios <span>→</span>
                  </button>
                </div>
              </aside>
            </section>
          )}
          {page === 'Datos' && <DataPage />}
          <footer className="footer">
            <span>
              rotación <i>·</i> herramienta de apoyo a decisiones
            </span>
            <span>
              Datos de ejemplo · Paraguay <i>·</i> 2026
            </span>
          </footer>
        </div>
      </main>
    </div>
  )
}

function Kpi({
  label,
  value,
  hint,
  icon,
  tint,
  featured = false,
}: {
  label: string
  value: string
  hint: string
  icon: React.ReactNode
  tint: string
  featured?: boolean
}) {
  return (
    <section className={`panel kpi ${featured ? 'featured' : ''}`}>
      <div className="kpi-top">
        <span>{label}</span>
        <i className={`kpi-icon ${tint}`}>{icon}</i>
      </div>
      <b className="kpi-value">{value}</b>
      <small>{hint}</small>
    </section>
  )
}
function Sensitivity({
  label,
  value,
  onChange,
  color,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  color: string
}) {
  return (
    <div className="sensitivity-item">
      <div>
        <b>{label}</b>
        <span className={`sensitivity-value ${color}`}>
          {value > 0 ? '+' : ''}
          {value}%
        </span>
      </div>
      <input
        aria-label={`${label}, variación porcentual`}
        className={`range ${color}`}
        type="range"
        min="-20"
        max="20"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="range-labels">
        <span>−20%</span>
        <span>Sin cambio</span>
        <span>+20%</span>
      </div>
    </div>
  )
}
function ComparePage({
  scenarios,
  metrics,
  active,
  setActive,
  currency,
}: {
  scenarios: Scenario[]
  metrics: ReturnType<typeof calculate>[]
  active: number
  setActive: (n: number) => void
  currency: string
}) {
  return (
    <>
      <div className="compare-cards">
        {scenarios.map((s, i) => (
          <button
            className={`panel compare-card ${i === active ? 'chosen' : ''}`}
            onClick={() => setActive(i)}
            key={i}
          >
            <span className="compare-card-head">
              <i style={{ background: s.color }} />
              {s.name}
              <span>{i === active ? 'Seleccionado' : 'Ver escenario'}</span>
            </span>
            <b>{money(metrics[i].net, currency)}</b>
            <small>Resultado neto estimado · {s.crops.map((c) => c.crop).join(' → ')}</small>
            <div className="compare-meter">
              <i
                style={{
                  width: `${Math.max(12, Math.min(100, (metrics[i].net / Math.max(...metrics.map((m) => m.net), 1)) * 100))}%`,
                  background: s.color,
                }}
              />
            </div>
          </button>
        ))}
      </div>
      <section className="panel compare-table-panel">
        <div className="panel-title">
          <div>
            <h2>Comparación detallada</h2>
            <p>Resultados totales del horizonte modelado</p>
          </div>
          <span className="demo-tag">ILUSTRATIVO</span>
        </div>
        <div className="table-scroll">
          <table className="compare-table">
            <thead>
              <tr>
                <th>MÉTRICA</th>
                {scenarios.map((s, i) => (
                  <th key={i}>
                    <i style={{ background: s.color }} />
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Ingreso bruto', 'revenue'],
                ['Margen bruto', 'gross'],
                ['Resultado neto estimado', 'net'],
                ['Mayor costo de campaña', 'maxCapital'],
              ].map(([label, key]) => (
                <tr key={key}>
                  <td>{label}</td>
                  {metrics.map((m, i) => (
                    <td className={key === 'net' ? 'strong' : ''} key={i}>
                      {money(m[key as keyof typeof m] as number, currency)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td>Secuencia de cultivos</td>
                {scenarios.map((s, i) => (
                  <td key={i}>{s.crops.map((c) => c.crop).join(' → ')}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="compare-note">
          <Info size={15} /> El neto compara los componentes activados en la calculadora y los
          costos cargados por cultivo.
        </div>
      </section>
      <div className="panel compare-footnote">
        <div className="nasa-icon">
          <BarChart3 size={19} />
        </div>
        <div>
          <b>Una comparación es tan útil como sus supuestos</b>
          <p>
            Probá variaciones de precio, rendimiento y costos en la calculadora. Los escenarios
            ordenados por resultado no consideran automáticamente riesgo, rotación recomendada ni
            disponibilidad de capital.
          </p>
        </div>
      </div>
    </>
  )
}
function DataPage() {
  return (
    <div className="data-grid">
      <section className="panel data-panel">
        <div className="panel-title">
          <div>
            <h2>Supuestos de la simulación</h2>
            <p>Todos los valores son ilustrativos; no son cotizaciones de mercado.</p>
          </div>
          <span className="demo-tag">MODO DEMO</span>
        </div>
        <div className="data-row">
          <span>Ubicación de referencia</span>
          <b>Itapúa, Paraguay</b>
        </div>
        <div className="data-row">
          <span>Moneda base</span>
          <b>USD · dólar estadounidense</b>
        </div>
        <div className="data-row">
          <span>Rendimientos y precios</span>
          <b>Valores de ejemplo editables</b>
        </div>
        <div className="data-row">
          <span>Costos directos</span>
          <b>Estimaciones ilustrativas por cultivo</b>
        </div>
        <div className="data-row">
          <span>Tierra, maquinaria y financiación</span>
          <b>Se activan como costos por hectárea</b>
        </div>
        <div className="data-row">
          <span>Flujo de caja y comercialización</span>
          <b>Componentes visuales; cálculo futuro</b>
        </div>
      </section>
      <section className="panel data-panel nasa-data">
        <div className="nasa-icon">
          <CloudSun size={21} />
        </div>
        <div className="eyebrow">INTEGRACIÓN FUTURA</div>
        <h2>Contexto ambiental</h2>
        <p>
          Esta demo no consulta servicios externos. La tarjeta ambiental presenta valores de muestra
          para ilustrar cómo datos de clima y suelo podrían acompañar el análisis económico.
        </p>
        <div className="data-source">
          <b>NASA POWER</b>
          <small>Variables meteorológicas y radiación</small>
        </div>
        <div className="data-source">
          <b>GPM</b>
          <small>Estimaciones de precipitación</small>
        </div>
        <div className="data-source">
          <b>SMAP</b>
          <small>Humedad superficial del suelo</small>
        </div>
        <span className="demo-tag">SIN CONEXIÓN REAL</span>
      </section>
      <section className="panel formula-panel">
        <div className="panel-title">
          <div>
            <h2>Cómo se calcula</h2>
            <p>Fórmulas simples y visibles para la demo</p>
          </div>
        </div>
        <div className="formula">
          <span>Ingreso bruto</span>
          <code>Σ (rendimiento × precio × hectáreas)</code>
        </div>
        <div className="formula">
          <span>Margen bruto</span>
          <code>Ingreso bruto − costos directos</code>
        </div>
        <div className="formula">
          <span>Neto estimado</span>
          <code>Ingreso bruto − todos los costos activos</code>
        </div>
        <div className="formula">
          <span>Mayor costo de campaña</span>
          <code>Mayor costo de campaña × hectáreas</code>
        </div>
        <div className="formula">
          <span>Precio de equilibrio</span>
          <code>Una campaña: costo/ha ÷ rendimiento</code>
        </div>
        <div className="disclaimer">
          <Info size={16} />
          <span>
            La herramienta orienta la conversación; no reemplaza presupuestos completos, asesoría
            financiera o asesoramiento agronómico.
          </span>
        </div>
      </section>
    </div>
  )
}
