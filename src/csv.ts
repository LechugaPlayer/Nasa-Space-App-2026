/** RFC-style quoting and spreadsheet formula protection for user-provided strings. */
export function toCsv(rows: (string | number)[][]): string {
  return (
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((value) => {
            const text = String(value)
            const safe = typeof value === 'string' && /^[\s]*[=+@-]/.test(text) ? "'" + text : text
            return '"' + safe.replaceAll('"', '""') + '"'
          })
          .join(';'),
      )
      .join('\r\n')
  )
}
