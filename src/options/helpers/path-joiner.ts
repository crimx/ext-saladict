import { useRefFn } from 'observable-hooks'
import { AppConfig } from '@/app-config'
import { Profile } from '@/app-config/profiles'

export function getConfigPath<A extends keyof AppConfig>(pA: A): string
export function getConfigPath<
  A extends keyof AppConfig,
  B extends keyof AppConfig[A]
>(pA: A, pB: B): string
export function getConfigPath<
  A extends keyof AppConfig,
  B extends keyof AppConfig[A],
  C extends keyof AppConfig[A][B]
>(pA: A, pB: B, pC: C): string
export function getConfigPath<
  A extends keyof AppConfig,
  B extends keyof AppConfig[A],
  C extends keyof AppConfig[A][B],
  D extends keyof AppConfig[A][B][C]
>(pA: A, pB: B, pC: C, pD: D): string
export function getConfigPath<
  A extends keyof AppConfig,
  B extends keyof AppConfig[A],
  C extends keyof AppConfig[A][B],
  D extends keyof AppConfig[A][B][C],
  E extends keyof AppConfig[A][B][C][D]
>(pA: A, pB: B, pC: C, pD: D, pE: E): string
export function getConfigPath<
  A extends keyof AppConfig,
  B extends keyof AppConfig[A],
  C extends keyof AppConfig[A][B],
  D extends keyof AppConfig[A][B][C],
  E extends keyof AppConfig[A][B][C][D],
  F extends keyof AppConfig[A][B][C][D][E]
>(pA: A, pB: B, pC: C, pD: D, pE: E, pF: F): string
export function getConfigPath<
  A extends keyof AppConfig,
  B extends keyof AppConfig[A],
  C extends keyof AppConfig[A][B],
  D extends keyof AppConfig[A][B][C],
  E extends keyof AppConfig[A][B][C][D],
  F extends keyof AppConfig[A][B][C][D][E],
  G extends keyof AppConfig[A][B][C][D][E][F]
>(pA: A, pB: B, pC: C, pD: D, pE: E, pF: F, pG: G): string
export function getConfigPath<
  A extends keyof AppConfig,
  B extends keyof AppConfig[A],
  C extends keyof AppConfig[A][B],
  D extends keyof AppConfig[A][B][C],
  E extends keyof AppConfig[A][B][C][D],
  F extends keyof AppConfig[A][B][C][D][E],
  G extends keyof AppConfig[A][B][C][D][E][F],
  H extends keyof AppConfig[A][B][C][D][E][F][G]
>(pA: A, pB: B, pC: C, pD: D, pE: E, pF: F, pG: G, pH: H): string
export function getConfigPath<
  A extends keyof AppConfig,
  B extends keyof AppConfig[A],
  C extends keyof AppConfig[A][B],
  D extends keyof AppConfig[A][B][C],
  E extends keyof AppConfig[A][B][C][D],
  F extends keyof AppConfig[A][B][C][D][E],
  G extends keyof AppConfig[A][B][C][D][E][F],
  H extends keyof AppConfig[A][B][C][D][E][F][G],
  I extends keyof AppConfig[A][B][C][D][E][F][G][H]
>(pA: A, pB: B, pC: C, pD: D, pE: E, pF: F, pG: G, pH: H, pI: I): string
export function getConfigPath<
  A extends keyof AppConfig,
  B extends keyof AppConfig[A],
  C extends keyof AppConfig[A][B],
  D extends keyof AppConfig[A][B][C],
  E extends keyof AppConfig[A][B][C][D],
  F extends keyof AppConfig[A][B][C][D][E],
  G extends keyof AppConfig[A][B][C][D][E][F],
  H extends keyof AppConfig[A][B][C][D][E][F][G],
  I extends keyof AppConfig[A][B][C][D][E][F][G][H],
  J extends keyof AppConfig[A][B][C][D][E][F][G][H][I]
>(pA: A, pB: B, pC: C, pD: D, pE: E, pF: F, pG: G, pH: H, pI: I, pJ: J): string
export function getConfigPath<
  A extends keyof AppConfig,
  B extends keyof AppConfig[A],
  C extends keyof AppConfig[A][B],
  D extends keyof AppConfig[A][B][C],
  E extends keyof AppConfig[A][B][C][D],
  F extends keyof AppConfig[A][B][C][D][E],
  G extends keyof AppConfig[A][B][C][D][E][F],
  H extends keyof AppConfig[A][B][C][D][E][F][G],
  I extends keyof AppConfig[A][B][C][D][E][F][G][H],
  J extends keyof AppConfig[A][B][C][D][E][F][G][H][I],
  K extends keyof AppConfig[A][B][C][D][E][F][G][H][I][J]
>(
  pA: A,
  pB: B,
  pC: C,
  pD: D,
  pE: E,
  pF: F,
  pG: G,
  pH: H,
  pI: I,
  pJ: J,
  pK: K
): string
export function getConfigPath(...args: string[]): string {
  return 'config.' + args.join('.')
}

export const useConfigPath: typeof getConfigPath = (
  ...args: string[]
): string => {
  return useRefFn(() => 'config.' + args.join('.')).current
}

export function getProfilePath<A extends keyof Profile>(pA: A): string
export function getProfilePath<
  A extends keyof Profile,
  B extends keyof Profile[A]
>(pA: A, pB: B): string
export function getProfilePath<
  A extends keyof Profile,
  B extends keyof Profile[A],
  C extends keyof Profile[A][B]
>(pA: A, pB: B, pC: C): string
export function getProfilePath<
  A extends keyof Profile,
  B extends keyof Profile[A],
  C extends keyof Profile[A][B],
  D extends keyof Profile[A][B][C]
>(pA: A, pB: B, pC: C, pD: D): string
export function getProfilePath<
  A extends keyof Profile,
  B extends keyof Profile[A],
  C extends keyof Profile[A][B],
  D extends keyof Profile[A][B][C],
  E extends keyof Profile[A][B][C][D]
>(pA: A, pB: B, pC: C, pD: D, pE: E): string
export function getProfilePath<
  A extends keyof Profile,
  B extends keyof Profile[A],
  C extends keyof Profile[A][B],
  D extends keyof Profile[A][B][C],
  E extends keyof Profile[A][B][C][D],
  F extends keyof Profile[A][B][C][D][E]
>(pA: A, pB: B, pC: C, pD: D, pE: E, pF: F): string
export function getProfilePath<
  A extends keyof Profile,
  B extends keyof Profile[A],
  C extends keyof Profile[A][B],
  D extends keyof Profile[A][B][C],
  E extends keyof Profile[A][B][C][D],
  F extends keyof Profile[A][B][C][D][E],
  G extends keyof Profile[A][B][C][D][E][F]
>(pA: A, pB: B, pC: C, pD: D, pE: E, pF: F, pG: G): string
export function getProfilePath<
  A extends keyof Profile,
  B extends keyof Profile[A],
  C extends keyof Profile[A][B],
  D extends keyof Profile[A][B][C],
  E extends keyof Profile[A][B][C][D],
  F extends keyof Profile[A][B][C][D][E],
  G extends keyof Profile[A][B][C][D][E][F],
  H extends keyof Profile[A][B][C][D][E][F][G]
>(pA: A, pB: B, pC: C, pD: D, pE: E, pF: F, pG: G, pH: H): string
export function getProfilePath<
  A extends keyof Profile,
  B extends keyof Profile[A],
  C extends keyof Profile[A][B],
  D extends keyof Profile[A][B][C],
  E extends keyof Profile[A][B][C][D],
  F extends keyof Profile[A][B][C][D][E],
  G extends keyof Profile[A][B][C][D][E][F],
  H extends keyof Profile[A][B][C][D][E][F][G],
  I extends keyof Profile[A][B][C][D][E][F][G][H]
>(pA: A, pB: B, pC: C, pD: D, pE: E, pF: F, pG: G, pH: H, pI: I): string
export function getProfilePath<
  A extends keyof Profile,
  B extends keyof Profile[A],
  C extends keyof Profile[A][B],
  D extends keyof Profile[A][B][C],
  E extends keyof Profile[A][B][C][D],
  F extends keyof Profile[A][B][C][D][E],
  G extends keyof Profile[A][B][C][D][E][F],
  H extends keyof Profile[A][B][C][D][E][F][G],
  I extends keyof Profile[A][B][C][D][E][F][G][H],
  J extends keyof Profile[A][B][C][D][E][F][G][H][I]
>(pA: A, pB: B, pC: C, pD: D, pE: E, pF: F, pG: G, pH: H, pI: I, pJ: J): string
export function getProfilePath<
  A extends keyof Profile,
  B extends keyof Profile[A],
  C extends keyof Profile[A][B],
  D extends keyof Profile[A][B][C],
  E extends keyof Profile[A][B][C][D],
  F extends keyof Profile[A][B][C][D][E],
  G extends keyof Profile[A][B][C][D][E][F],
  H extends keyof Profile[A][B][C][D][E][F][G],
  I extends keyof Profile[A][B][C][D][E][F][G][H],
  J extends keyof Profile[A][B][C][D][E][F][G][H][I],
  K extends keyof Profile[A][B][C][D][E][F][G][H][I][J]
>(
  pA: A,
  pB: B,
  pC: C,
  pD: D,
  pE: E,
  pF: F,
  pG: G,
  pH: H,
  pI: I,
  pJ: J,
  pK: K
): string
export function getProfilePath(...args: string[]): string {
  return 'profile.' + args.join('.')
}

export const useProfilePath: typeof getProfilePath = (
  ...args: string[]
): string => {
  return useRefFn(() => 'profile.' + args.join('.')).current
}
