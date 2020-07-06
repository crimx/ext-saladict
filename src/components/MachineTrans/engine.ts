import { DictID, AppConfig } from '@/app-config'
import { Language } from '@opentranslate/languages'
import { Translator } from '@opentranslate/translator'
import { isContainJapanese, isContainKorean } from '@/_helpers/lang-check'
import { DictSearchResult } from '../dictionaries/helpers'

export interface MachineTranslatePayload<Lang = string> {
  sl?: Lang
  tl?: Lang
}

export interface MachineTranslateResult<ID extends DictID> {
  id: ID
  /** Source language */
  sl: string
  /** Target language */
  tl: string
  searchText: {
    paragraphs: string[]
    tts?: string
  }
  trans: {
    paragraphs: string[]
    tts?: string
  }
}

/**
 * Get Machine Translate arguments
 */
export async function getMTArgs(
  translator: Translator,
  text: string,
  {
    options,
    options_sel
  }: {
    options: {
      tl: 'default' | Language
      tl2: 'default' | Language
      keepLF: 'none' | 'all' | 'webpage' | 'pdf'
    }
    options_sel: {
      tl: ReadonlyArray<'default' | Language>
      tl2: ReadonlyArray<'default' | Language>
    }
  },
  config: AppConfig,
  payload: {
    sl?: Language
    tl?: Language
    isPDF?: boolean
  }
): Promise<{ sl: Language; tl: Language; text: string }> {
  if (
    options.keepLF === 'none' ||
    (options.keepLF === 'pdf' && !payload.isPDF) ||
    (options.keepLF === 'webpage' && payload.isPDF)
  ) {
    text = text.replace(/\n+/g, ' ')
  }

  let sl = payload.sl

  if (!sl) {
    if (isContainJapanese(text)) {
      sl = 'ja'
    } else if (isContainKorean(text)) {
      sl = 'ko'
    }
  }

  if (!sl) {
    sl = await translator.detect(text)
  }

  let tl: Language | '' = ''

  if (payload.tl) {
    tl = payload.tl
  } else if (options.tl === 'default') {
    if (options_sel.tl.includes(config.langCode)) {
      tl = config.langCode
    }
  } else {
    tl = options.tl
  }

  if (!tl) {
    tl =
      options_sel.tl.find((lang): lang is Language => lang !== 'default') ||
      'en'
  }

  if (sl === tl) {
    if (!payload.tl) {
      if (options.tl2 === 'default') {
        if (tl !== config.langCode) {
          tl = config.langCode
        } else if (tl !== 'en') {
          tl = 'en'
        } else {
          tl =
            options_sel.tl.find(
              (lang): lang is Language => lang !== 'default' && lang !== tl
            ) || 'en'
        }
      } else {
        tl = options.tl2
      }
    } else if (!payload.sl) {
      sl = 'auto'
    }
  }

  return { sl, tl, text }
}

/** Generate catalog */
export function machineResult<ID extends DictID>(
  data: DictSearchResult<MachineTranslateResult<ID>>,
  langcodes: ReadonlyArray<string>
): DictSearchResult<MachineTranslateResult<ID>> {
  const langCodesOptions = [
    {
      value: 'auto',
      label: '%t(content:machineTrans.auto)'
    }
  ]
  for (const lang of langcodes) {
    langCodesOptions.push({
      value: lang,
      label: `${lang} %t(langcode:${lang})`
    })
  }

  return {
    ...data,
    catalog: [
      {
        key: 'sl',
        value: data.result.sl,
        options: langCodesOptions
      },
      {
        key: 'tl',
        value: data.result.tl,
        options: langCodesOptions
      },
      {
        key: 'copySrc',
        value: 'copySrc',
        label: '%t(content:copySrc)'
      },
      {
        key: 'copyTrans',
        value: 'copyTrans',
        label: '%t(content:copyTrans)'
      }
    ]
  }
}
