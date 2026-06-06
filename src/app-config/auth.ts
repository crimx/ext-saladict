import {
  auth as alibaba,
  url as alibabaUrl
} from '@/components/dictionaries/alibaba/auth'
import {
  auth as baidu,
  url as baiduUrl
} from '@/components/dictionaries/baidu/auth'
import {
  auth as caiyun,
  url as caiyunUrl
} from '@/components/dictionaries/caiyun/auth'
import {
  auth as niutrans,
  url as niutransUrl
} from '@/components/dictionaries/niutrans/auth'
import {
  auth as tencent,
  url as tencentUrl
} from '@/components/dictionaries/tencent/auth'
import {
  auth as volc,
  url as volcUrl
} from '@/components/dictionaries/volc/auth'
import {
  auth as youdaotrans,
  url as youdaotransUrl
} from '@/components/dictionaries/youdaotrans/auth'

export const defaultDictAuths = {
  alibaba,
  baidu,
  caiyun,
  niutrans,
  tencent,
  volc,
  youdaotrans
}

export type DictAuths = typeof defaultDictAuths

export const defaultDictAuthUrls: { [id in keyof DictAuths]: string } = {
  alibaba: alibabaUrl,
  baidu: baiduUrl,
  caiyun: caiyunUrl,
  niutrans: niutransUrl,
  tencent: tencentUrl,
  volc: volcUrl,
  youdaotrans: youdaotransUrl
}

export const getDefaultDictAuths = (): DictAuths =>
  JSON.parse(JSON.stringify(defaultDictAuths))
