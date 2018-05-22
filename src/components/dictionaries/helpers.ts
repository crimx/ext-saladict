export function handleNoResult<T> (): Promise<T> {
  return Promise.reject('No result')
}

export function getText (parent: ParentNode, selector?: string): string {
  const child = selector ? parent.querySelector(selector) : parent
  if (!child) { return '' }
  return child['textContent'] || ''
}
