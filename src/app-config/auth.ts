import { DictID } from '.'

const authReq = require.context(
  '@/components/dictionaries',
  true,
  /auth\.(json|ts)$/
)

export type DictAuth = {
  [index: string]: string
} & {
  url: string
}

export type DictAuths = {
  [id in DictID]?: DictAuth
}

export const defaultDictAuths: DictAuths = authReq
  .keys()
  .reduce<DictAuths>((o, filename) => {
    const authModule = authReq(filename)
    const dictID = /([^/]+)\/auth\.(json|ts)$/.exec(filename)![1] as DictID
    o[dictID] = authModule.auth || authModule
    return o
  }, {})

export const getDefaultDictAuths = (): DictAuths =>
  JSON.parse(JSON.stringify(defaultDictAuths))
