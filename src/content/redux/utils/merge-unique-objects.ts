/**
 * Like Object.assign but not allow duplicated keys
 */
export function mergeUniqueObjects<S> (o1: S): S
export function mergeUniqueObjects<S, T> (o1: S, o2: T): S & T
export function mergeUniqueObjects<S, T, U> (o1: S, o2: T, o3: U): S & T & U
export function mergeUniqueObjects<S, T, U, V> (o1: S, o2: T, o3: U, o4: V): S & T & U & V
export function mergeUniqueObjects<S, T, U, V, W> (o1: S, o2: T, o3: U, o4: V, o5: W): S & T & U & V & W
export function mergeUniqueObjects<S, T, U, V, W, X> (o1: S, o2: T, o3: U, o4: V, o5: W, o6: X): S & T & U & V & W & X
export function mergeUniqueObjects (...states: any[]): any {
  if (process.env.NODE_ENV !== 'production') {
    const keys = ([] as string[]).concat(...states.map(state => Object.keys(state)))
    const conflicts = [...keys.reduce((m, k) => m.set(k, (m.get(k) || 0) + 1), new Map())]
      .filter(([key, count]) => count > 1)
      .map(([key]) => key)

    if (conflicts.length > 0) {
      throw new Error(`Merge state error: duplicated key ${conflicts}.`)
    }
  }

  return Object.assign({}, ...states)
}

export default mergeUniqueObjects
