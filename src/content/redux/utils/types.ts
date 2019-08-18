import { Dispatch } from 'redux'

/** Default action catalog */
export interface ActionCatalog {
  [type: string]: {
    payload?: any
    meta?: any
  }
}

export type ActionType<P extends ActionCatalog> = keyof P

export type Action<
  C extends ActionCatalog,
  T extends keyof C = keyof C
> = T extends any // 'extends' hack to generate union
  ? Readonly<
      // prettier-ignore
      {
        type: T
        error?: boolean
      } &
      ('payload' extends keyof C[T] ? Pick<C[T], 'payload'> : { payload?: undefined }) &
      ('meta' extends keyof C[T] ? Pick<C[T], 'meta'> : { meta?: undefined })
    >
  : never

export type ActionHandler<
  /** module actions */
  C extends ActionCatalog,
  /** state */
  S extends {},
  /** all actions */
  SC extends {} = {}
> = {
  [k in keyof C]: (state: Readonly<S>, action: Action<C, k>) => Readonly<S>
} &
  {
    [k in keyof Omit<SC, keyof C>]?: (
      state: Readonly<S>,
      action: Action<SC, k>
    ) => Readonly<S>
  }

export type Init<C extends ActionCatalog> = (
  dispatch: Dispatch<Action<C>>
) => void
