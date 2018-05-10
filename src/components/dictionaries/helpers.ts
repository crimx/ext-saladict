export function handleNoResult<T> (): Promise<T> {
  return Promise.reject('No result')
}
