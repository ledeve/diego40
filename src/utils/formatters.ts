export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value == null) return '—'
  if (Math.abs(value) >= 1) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  })
}

export function formatPL(value: number): string {
  return (value >= 0 ? '+' : '') + value.toFixed(2) + '%'
}
