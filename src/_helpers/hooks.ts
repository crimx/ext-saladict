import { useRef } from 'react'

/**
 * Equivalent to useCallback(fn, [])
 */
export function useFixedCallback<T>(fn: T): T {
  return useRef(fn).current
}

/**
 * Equivalent to useMemo(() => value, [])
 */
export function useFixedMemo<T>(fn: () => T): T {
  const initedRef = useRef(false)
  const valueRef = useRef<T>()
  if (!initedRef.current) {
    initedRef.current = true
    valueRef.current = fn()
  }
  return valueRef.current!
}
