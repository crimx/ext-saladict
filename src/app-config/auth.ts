import {
  auth as baidu,
  url as baiduUrl
} from '@/components/dictionaries/baidu/auth'
import {
  auth as caiyun,
  url as caiyunUrl
} from '@/components/dictionaries/caiyun/auth'
import {
  auth as tencent,
  url as tencentUrl
} from '@/components/dictionaries/tencent/auth'
import {
  auth as youdaotrans,
  url as youdaotransUrl
} from '@/components/dictionaries/youdaotrans/auth'

export const defaultDictAuths = {
  baidu,
  caiyun,
  tencent,
  youdaotrans
}

export type DictAuths = typeof defaultDictAuths

export const defaultDictAuthUrls: { [id in keyof DictAuths]: string } = {
  baidu: baiduUrl,
  caiyun: caiyunUrl,
  tencent: tencentUrl,
  youdaotrans: youdaotransUrl
}

export const getDefaultDictAuths = (): DictAuths =>
  JSON.parse(JSON.stringify(defaultDictAuths))
