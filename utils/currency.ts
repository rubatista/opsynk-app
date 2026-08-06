export function formatCurrency(value: number): string {
  const rounded = Math.round(value * 100) / 100
  const hasCents = Math.round(rounded * 100) % 100 !== 0
  const fixed = hasCents ? rounded.toFixed(2) : rounded.toFixed(0)
  const [intPart, decPart] = fixed.split('.')
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return decPart ? `${withThousands},${decPart}€` : `${withThousands}€`
}
