import { DictID, AppConfig } from '@/app-config'
import { Language } from '@opentranslate/languages'
import { Translator } from '@opentranslate/translator'
import { DictItem, SelectOptions } from '@/app-config/dicts'
import { isContainJapanese, isContainKorean } from '@/_helpers/lang-check'
import { DictSearchResult } from '../dictionaries/helpers'

export interface MachineTranslatePayload<Lang = string> {
  sl?: Lang
  tl?: Lang
}

export interface MachineTranslateResult<ID extends DictID> {
  id: ID
  slInitial: 'hide' | 'collapse' | 'full'
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
  requireCredential?: boolean
}

type DefaultMachineOptions<Lang extends Language> = {
  /** Keep linebreaks */
  keepLF: 'none' | 'all' | 'webpage' | 'pdf'
  /** Source language initial state */
  slInitial: 'hide' | 'collapse' | 'full'
  tl: 'default' | Lang
  tl2: 'default' | Lang
}

export type MachineDictItem<
  Lang extends Language,
  Options extends { [option: string]: number | boolean | string } = {}
> = DictItem<Options & DefaultMachineOptions<Lang>>

export type ExtractLangFromConfig<Config> = Config extends MachineDictItem<
  infer Lang,
  infer Options
>
  ? Lang
  : never

export type ExtractOptionsFromConfig<Config> = Config extends MachineDictItem<
  infer Lang,
  infer Options
>
  ? Omit<Options, keyof DefaultMachineOptions<Lang>>
  : never

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

export function machineConfig<Config extends MachineDictItem<Language>>(
  langs: ExtractLangFromConfig<Config>[],
  /** overwrite configs */
  config: Partial<Config>,
  options: ExtractOptionsFromConfig<Config>,
  optionsSel: SelectOptions<ExtractOptionsFromConfig<Config>>
): Config {
  return {
    lang: '11111111',
    selectionLang: {
      english: true,
      chinese: true,
      japanese: true,
      korean: true,
      french: true,
      spanish: true,
      deutsch: true,
      others: true,
      matchAll: false
    },
    defaultUnfold: {
      english: true,
      chinese: true,
      japanese: true,
      korean: true,
      french: true,
      spanish: true,
      deutsch: true,
      others: true,
      matchAll: false
    },
    preferredHeight: 320,
    selectionWC: {
      min: 1,
      max: 999999999999999
    },
    ...config,
    options: {
      keepLF: 'webpage',
      slInitial: 'collapse',
      tl: 'default',
      tl2: 'default',
      ...(options as any)
    },
    options_sel: {
      keepLF: ['none', 'all', 'webpage', 'pdf'],
      slInitial: ['collapse', 'hide', 'full'],
      tl: ['default', ...langs],
      tl2: ['default', ...langs],
      ...optionsSel
    }
  } as Config
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

  const catalog: DictSearchResult<MachineTranslateResult<ID>>['catalog'] = [
    {
      key: 'sl',
      value: data.result.sl,
      title: '%t(content:machineTrans.sl)',
      options: langCodesOptions
    },
    {
      key: 'tl',
      value: data.result.tl,
      title: '%t(content:machineTrans.tl)',
      options: langCodesOptions
    },
    {
      key: 'copySrc',
      value: 'copySrc',
      label: '%t(content:machineTrans.copySrc)'
    },
    {
      key: 'copyTrans',
      value: 'copyTrans',
      label: '%t(content:machineTrans.copyTrans)'
    }
  ]

  if (data.result.slInitial === 'hide') {
    catalog.push({
      key: 'showSl',
      value: '',
      label: '%t(content:machineTrans.showSl)'
    })
  }

  return {
    ...data,
    catalog
  }
}
