/**
 * Generate a unique key
 */
export function genUniqueKey(): string {
  return (
    Date.now()
      .toString()
      .slice(6) +
    Math.random()
      .toString()
      .slice(2, 8)
  )
}

export function genUniqueKeyThunk() {
  return genUniqueKey
}

export function isGeneratedKey(key: unknown): boolean {
  return typeof key === 'string' && /^\d{13}$/.test(key)
}
