/**
 * Generate a unique key
 */
export function genUniqueKey (): string {
  return Date.now().toString().slice(6) + Math.random().toString().slice(2, 8)
}
