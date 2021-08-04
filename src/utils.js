export function initialize (count, value) {
  const xs = []
  for (let i = 0; i < count; i++) {
    if (typeof value === 'function') xs.push(value(i))
    else xs.push(value)
  }
  return xs
}
