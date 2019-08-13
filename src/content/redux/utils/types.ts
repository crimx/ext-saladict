import { Dispatch } from 'redux'

export interface Payload {
  [type: string]: any
}

export type ActionType<P extends Payload> = keyof P

export type Action<
  P extends Payload,
  T extends keyof P = keyof P
> = T extends any // 'extends' hack to generate union
  ? Readonly<{
      type: T
      payload: P[T]
    }>
  : never

export type ActionHandler<P extends Payload, S extends {}> = {
  [k in keyof P]: (state: S, action: Action<P, k>) => S
}

export type Init<P extends Payload> = (dispatch: Dispatch<Action<P>>) => void
