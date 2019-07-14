interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
  readonly [P in keyof T]: DeepReadonly<T[P]>
}

export type DeepReadonly<T> = T extends (infer R)[]
  ? DeepReadonlyArray<R>
  : T extends Function
  ? T
  : T extends object
  ? DeepReadonlyObject<T>
  : T

export type Diff<T, K> = Exclude<T, K>

export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

export type UnionKeys<T> = T extends any ? keyof T : never
export type UnionPick<T, K extends UnionKeys<T>> = T extends any
  ? Pick<T, Extract<K, keyof T>>
  : never
