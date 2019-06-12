import { SupportedLangs } from '@/_helpers/lang-check'

import baidu from '@/components/dictionaries/baidu/config'
import bing from '@/components/dictionaries/bing/config'
import caiyun from '@/components/dictionaries/caiyun/config'
import cambridge from '@/components/dictionaries/cambridge/config'
import cnki from '@/components/dictionaries/cnki/config'
import cobuild from '@/components/dictionaries/cobuild/config'
import etymonline from '@/components/dictionaries/etymonline/config'
import eudic from '@/components/dictionaries/eudic/config'
import google from '@/components/dictionaries/google/config'
import googledict from '@/components/dictionaries/googledict/config'
import guoyu from '@/components/dictionaries/guoyu/config'
import hjdict from '@/components/dictionaries/hjdict/config'
import jukuu from '@/components/dictionaries/jukuu/config'
import liangan from '@/components/dictionaries/liangan/config'
import longman from '@/components/dictionaries/longman/config'
import macmillan from '@/components/dictionaries/macmillan/config'
import naver from '@/components/dictionaries/naver/config'
import oald from '@/components/dictionaries/oald/config'
import shanbay from '@/components/dictionaries/shanbay/config'
import sogou from '@/components/dictionaries/sogou/config'
import tencent from '@/components/dictionaries/tencent/config'
import urban from '@/components/dictionaries/urban/config'
import vocabulary from '@/components/dictionaries/vocabulary/config'
import weblio from '@/components/dictionaries/weblio/config'
import weblioejje from '@/components/dictionaries/weblioejje/config'
import websterlearner from '@/components/dictionaries/websterlearner/config'
import wikipedia from '@/components/dictionaries/wikipedia/config'
import youdao from '@/components/dictionaries/youdao/config'
import zdic from '@/components/dictionaries/zdic/config'

export function getALlDicts () {
  // For TypeScript to generate typings
  // Follow alphabetical order for easy reading
  return {
    baidu: baidu(),
    bing: bing(),
    caiyun: caiyun(),
    cambridge: cambridge(),
    cnki: cnki(),
    cobuild: cobuild(),
    etymonline: etymonline(),
    eudic: eudic(),
    google: google(),
    googledict: googledict(),
    guoyu: guoyu(),
    hjdict: hjdict(),
    jukuu: jukuu(),
    liangan: liangan(),
    longman: longman(),
    macmillan: macmillan(),
    naver: naver(),
    oald: oald(),
    shanbay: shanbay(),
    sogou: sogou(),
    tencent: tencent(),
    urban: urban(),
    vocabulary: vocabulary(),
    weblio: weblio(),
    weblioejje: weblioejje(),
    websterlearner: websterlearner(),
    wikipedia: wikipedia(),
    youdao: youdao(),
    zdic: zdic(),
  }
}

interface DictItemBase {
  /**
   * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
   * `1` for supported
   */
  lang: string
  /** Show this dictionary when selection contains words in the chosen languages. */
  selectionLang: SupportedLangs
  /**
   * If set to true, the dict start searching automatically.
   * Otherwise it'll only start seaching when user clicks the unfold button.
   * Default MUST be true and let user decide.
   */
  defaultUnfold: SupportedLangs
  /**
   * This is the default height when the dict first renders the result.
   * If the content height is greater than the preferred height,
   * the preferred height is used and a mask with a view-more button is shown.
   * Otherwise the content height is used.
   */
  selectionWC: {
    min: number,
    max: number,
  },
  /** Word count to start searching */
  preferredHeight: number
}

/**
 * Optional dict custom options. Can only be boolean, number or string.
 * For string, add additional `options_sel` field to list out choices.
 */
type DictItemWithOptions<
  Options extends { [option: string]: number | boolean | string } | undefined = undefined,
> = Options extends undefined ? DictItemBase : DictItemBase & { options: Options }

/**
 * SelKeys is a subset of keyof Options for `string` type options.
 * For example:
 * Options = { lang: 'zh' | 'en', isFoo: boolean }
 * SelKeys should be 'lang'
 */
export type DictItem<
  Options extends { [option: string]: number | boolean | string } | undefined = undefined,
  SelKeys extends string | number | undefined = undefined
> = SelKeys extends keyof Options
  ? DictItemWithOptions<Options> & { options_sel: { [key in SelKeys]: Options[key][] } }
  : DictItemWithOptions<Options>
