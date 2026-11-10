import { cloneElement, useId, type ReactElement } from 'react'
export function Field({
  label,
  children,
}: {
  label: string
  children: ReactElement<{ id?: string }>
}) {
  const id = useId()
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, { id })}
    </div>
  )
}
export function Numeric({
  label,
  value,
  onChange,
  min = 0,
  max = 1e6,
  nullable = false,
}: {
  label: string
  value: number | null
  onChange: (n: number | null) => void
  min?: number
  max?: number
  nullable?: boolean
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        inputMode="decimal"
        step="any"
        min={min}
        max={max}
        value={value === null || !Number.isFinite(value) ? '' : value}
        placeholder={nullable ? 'Pendiente' : 'Obligatorio'}
        onChange={(e) =>
          onChange(e.target.value === '' ? (nullable ? null : NaN) : Number(e.target.value))
        }
      />
    </Field>
  )
}
export const amount = (n: number | null) =>
  n === null || !Number.isFinite(n)
    ? 'No definido'
    : new Intl.NumberFormat('es-PY', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(n)
export const decimal = (n: number | null) =>
  n === null || !Number.isFinite(n)
    ? 'Sin datos'
    : new Intl.NumberFormat('es-PY', { maximumFractionDigits: 1 }).format(n)
