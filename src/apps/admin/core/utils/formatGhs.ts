export function formatGhs(
  value: number | string | null | undefined,
  showDecimals = false,
): string {
  if (value === null || value === undefined || value === '') return 'GHS 0'

  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) return 'GHS 0'

  const formatted = num.toLocaleString('en-GH', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  })

  return `GHS ${formatted}`
}
