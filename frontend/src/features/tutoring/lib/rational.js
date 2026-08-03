export function gcd(a, b) {
  let left = Math.abs(Math.trunc(a))
  let right = Math.abs(Math.trunc(b))
  while (right) [left, right] = [right, left % right]
  return left || 1
}

export function formatRational(numerator, denominator = 1) {
  if (denominator === 0) return '无意义'
  if (numerator === 0) return '0'
  const scale = 10 ** Math.max(decimalPlaces(numerator), decimalPlaces(denominator))
  const scaledNumerator = Math.round(numerator * scale)
  const scaledDenominator = Math.round(denominator * scale)
  const sign = Math.sign(scaledNumerator) * Math.sign(scaledDenominator) < 0 ? '-' : ''
  const divisor = gcd(scaledNumerator, scaledDenominator)
  const top = Math.abs(scaledNumerator) / divisor
  const bottom = Math.abs(scaledDenominator) / divisor
  return bottom === 1 ? `${sign}${top}` : `${sign}${top}/${bottom}`
}

function decimalPlaces(value) {
  const text = String(value).toLowerCase()
  if (!text.includes('e')) return (text.split('.')[1] || '').length
  const [coefficient, exponentText] = text.split('e')
  const fractionLength = (coefficient.split('.')[1] || '').length
  return Math.max(0, fractionLength - Number(exponentText))
}

function cleanNumber(value) {
  return Number(value.toFixed(10))
}

export function rationalOperation(a, b, operation) {
  if (operation === 'add') return { value: cleanNumber(a + b), text: String(cleanNumber(a + b)) }
  if (operation === 'subtract') return { value: cleanNumber(a - b), text: String(cleanNumber(a - b)) }
  if (operation === 'multiply') return { value: cleanNumber(a * b), text: String(cleanNumber(a * b)) }
  if (operation === 'divide') {
    return b === 0
      ? { value: Number.NaN, text: '除数不能为 0' }
      : { value: cleanNumber(a / b), text: formatRational(a, b) }
  }
  throw new Error(`Unknown operation: ${operation}`)
}

export function powerValue(base, exponent, grouped = true) {
  if (!Number.isInteger(exponent) || exponent < 0) throw new Error('Exponent must be a non-negative integer')
  if (grouped || base >= 0) return base ** exponent
  return -(Math.abs(base) ** exponent)
}

export function powerFactors(base, exponent, grouped = true) {
  if (exponent === 0) return ['1']
  const factor = grouped ? `(${base})` : String(Math.abs(base))
  const factors = Array.from({ length: exponent }, () => factor)
  if (!grouped && base < 0) factors[0] = `-${factors[0]}`
  return factors
}

export function signRule(left, right) {
  return Math.sign(left) === Math.sign(right) ? 'same' : 'different'
}
