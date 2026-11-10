import { useEffect, useRef, useState } from 'react'
import { type Plan } from './model.ts'
import {
  compatible,
  fetchPower,
  queryFor,
  queryKey,
  weatherFromEnvelope,
  type Weather,
  type WeatherEnvelope,
  type Query,
} from './power.ts'
import { WEATHER_KEY } from './storage.ts'
export function useWeather(plan: Plan) {
  const [weather, setWeather] = useState<Weather | null>(null),
    [envelope, setEnvelope] = useState<WeatherEnvelope | null>(null)
  const [status, setStatus] = useState('Sin evidencia cargada.'),
    [busy, setBusy] = useState(false)
  const query = queryFor(plan),
    key = queryKey(query),
    current = useRef(key),
    generation = useRef(0),
    controller = useRef<AbortController | null>(null)
  current.current = key
  useEffect(() => {
    generation.current++
    controller.current?.abort()
    setWeather(null)
    setEnvelope(null)
    setBusy(false)
    setStatus('Ubicación/período actual: elegir una fuente.')
    return () => {
      generation.current++
      controller.current?.abort()
    }
  }, [key])
  async function accept(
    value: unknown,
    origin: Weather['origin'],
    expected = current.current,
    ticket = generation.current,
  ) {
    const parsed = await weatherFromEnvelope(value, origin)
    if (expected !== current.current || ticket !== generation.current) return
    if (!compatible(parsed, queryFor(plan)))
      throw new Error('La evidencia no cubre esta ubicación y período.')
    setWeather(parsed)
    setEnvelope(value as WeatherEnvelope)
    setStatus(
      origin === 'live'
        ? 'Consulta NASA verificada.'
        : origin === 'snapshot'
          ? 'Respaldo real incluido; no es una consulta en vivo.'
          : 'Caché local verificada; consultar fecha de descarga.',
    )
  }
  async function load(origin: Weather['origin']) {
    const id = ++generation.current,
      expected = current.current
    controller.current?.abort()
    const ctrl = new AbortController()
    controller.current = ctrl
    setBusy(true)
    setStatus('Cargando y verificando evidencia…')
    try {
      let data: unknown
      if (origin === 'live') data = await fetchPower(query, ctrl.signal)
      else if (origin === 'cache') {
        const saved = localStorage.getItem(WEATHER_KEY)
        if (!saved) throw new Error('No hay caché local. Seleccionar consulta o respaldo.')
        data = JSON.parse(saved)
      } else {
        const base = import.meta.env.BASE_URL + 'data/'
        const response = await fetch(base + 'index.json', { signal: ctrl.signal })
        if (!response.ok) throw new Error('No se pudo abrir el índice de respaldos.')
        const list = (await response.json()) as {
          file: string
          query: Query
          hash: string
          retrievedAt: string
        }[]
        const entry = list.find(
          (x) =>
            x.query.lat === query.lat &&
            x.query.lon === query.lon &&
            x.query.start <= query.start &&
            x.query.end >= query.end,
        )
        if (!entry)
          throw new Error(
            'No hay respaldo incluido para esta ubicación/período. No se usaron datos de otro caso.',
          )
        if (!/^power-[a-z-]+-\d{8}-\d{8}\.json$/.test(entry.file))
          throw new Error('Archivo de respaldo inválido.')
        const rawResponse = await fetch(base + entry.file, { signal: ctrl.signal })
        if (!rawResponse.ok) throw new Error('No se pudo abrir el respaldo.')
        const rawText = await rawResponse.text()
        data = { query: entry.query, rawText, hash: entry.hash, retrievedAt: entry.retrievedAt }
      }
      if (id !== generation.current || expected !== current.current) return
      await accept(data, origin, expected, id)
      if (id === generation.current && expected === current.current) {
        try {
          localStorage.setItem(WEATHER_KEY, JSON.stringify(data))
        } catch {
          setStatus('Evidencia cargada; no pudo guardarse en caché. Exportar dossier.')
        }
      }
    } catch (e) {
      if (id === generation.current && expected === current.current)
        setStatus(
          `Error: ${e instanceof Error ? e.message : 'No se pudo cargar.'} La evidencia previa, si existe, conserva su origen.`,
        )
    } finally {
      if (id === generation.current) setBusy(false)
    }
  }
  return { weather, envelope, status, busy, load, accept }
}
