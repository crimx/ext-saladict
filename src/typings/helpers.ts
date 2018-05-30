interface DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>
}

export type DeepReadonly<T> =
    T extends (infer R)[]
      ? DeepReadonlyArray<R>
      : T extends Function
        ? T
        : T extends object
          ? DeepReadonlyObject<T>
          : T

export type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T]

export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }
