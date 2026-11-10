import { CATALOG, dateValue, type CropId, type PriceReference } from './model.ts'
/** Quoted fields, CRLF, escaped quotes and embedded separators. Never evaluates cells. */
export function parseDelimited(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, '')
  if (text.length > 100000) throw new Error('CSV demasiado grande (máximo 100 KB).')
  const delimiter = text.split(/\r?\n/, 1)[0].includes(';') ? ';' : ','
  const rows: string[][] = []
  let row: string[] = [],
    value = '',
    quoted = false,
    closed = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          value += '"'
          i++
        } else {
          quoted = false
          closed = true
        }
      } else value += char
    } else if (char === '"' && value === '' && !closed) quoted = true
    else if (char === delimiter) {
      row.push(value)
      value = ''
      closed = false
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(value)
      if (row.some((v) => v !== '')) rows.push(row)
      row = []
      value = ''
      closed = false
    } else {
      if (closed || char === '"') throw new Error('CSV: comillas mal formadas.')
      value += char
    }
  }
  if (quoted) throw new Error('CSV: campo sin cerrar.')
  row.push(value)
  if (row.some((v) => v !== '')) rows.push(row)
  return rows
}
export function parseReferences(input: string): PriceReference[] {
  const [header, ...rows] = parseDelimited(input)
  const expected = ['crop', 'date', 'market', 'currency', 'unit', 'price', 'kind']
  if (!header || header.join('|') !== expected.join('|'))
    throw new Error('Columnas requeridas: ' + expected.join(','))
  if (!rows.length || rows.length > 100) throw new Error('El CSV requiere entre 1 y 100 filas.')
  return rows.map((r, i) => {
    const [crop, date, market, currency, unit, price, kind] = r
    if (
      r.length !== 7 ||
      !Object.hasOwn(CATALOG, crop) ||
      !Number.isFinite(dateValue(date)) ||
      !market.trim() ||
      market.length > 150 ||
      currency !== 'USD' ||
      unit !== 'USD/t' ||
      !/^\d+(\.\d+)?$/.test(price) ||
      Number(price) > 1e6 ||
      !['venta', 'referencia'].includes(kind)
    )
      throw new Error(
        `Fila ${i + 2}: cultivo, fecha, mercado, USD, USD/t, precio o tipo inválido. Usar punto decimal.`,
      )
    return {
      crop: crop as CropId,
      date,
      market,
      currency: 'USD',
      unit: 'USD/t',
      price: Number(price),
      kind: kind as PriceReference['kind'],
    }
  })
}
