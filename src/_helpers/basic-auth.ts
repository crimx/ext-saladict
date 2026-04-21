function encodeBase64(value: string): string {
  const scope = globalThis as any

  if (typeof scope.btoa === 'function') {
    return scope.btoa(unescape(encodeURIComponent(value)))
  }

  if (scope.Buffer) {
    return scope.Buffer.from(value, 'utf8').toString('base64')
  }

  throw new Error('Base64 encoding is not available in the current runtime.')
}

export function createBasicAuthorizationHeader(
  username: string,
  password: string
): string {
  return `Basic ${encodeBase64(`${username}:${password}`)}`
}
