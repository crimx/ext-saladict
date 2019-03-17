import { SupportedLangs } from '@/_helpers/lang-check'

export interface DictItem {
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
  /**
   * Optional dict custom options. Can only be boolean, number or string.
   * For string, add additional `options_sel` field to list out choices.
   */
  options?: {
    [option: string]: number | boolean | string
  }
  options_sel?: {
    [choice: string]: string[]
  }
}

export function getALlDicts () {
  const allDicts = {
    baidu: {
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
      },
      preferredHeight: 320,
      selectionWC: {
        min: 1,
        max: 999999999999999,
      },
      options: {
        /** Keep linebreaks on PDF */
        pdfNewline: false,
        tl: 'default' as 'default' | 'zh' | 'cht' | 'en',
      },
      options_sel: {
        tl: ['default', 'zh', 'cht', 'en'],
      },
    },
    bing: {
      lang: '11000000',
      selectionLang: {
        english: true,
        chinese: true,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 240,
      selectionWC: {
        min: 1,
        max: 5,
      },
      options: {
        tense: true,
        phsym: true,
        cdef: true,
        related: true,
        sentence: 4
      }
    },
    cambridge: {
      lang: '11100000',
      selectionLang: {
        english: true,
        chinese: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 265,
      selectionWC: {
        min: 1,
        max: 5,
      },
    },
    cobuild: {
      lang: '10000000',
      selectionLang: {
        english: true,
        chinese: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 300,
      selectionWC: {
        min: 1,
        max: 5,
      },
      options: {
        cibaFirst: true,
      }
    },
    etymonline: {
      lang: '10000000',
      selectionLang: {
        english: true,
        chinese: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 265,
      selectionWC: {
        min: 1,
        max: 5,
      },
      options: {
        resultnum: 4,
        chart: true,
      }
    },
    eudic: {
      lang: '11000000',
      selectionLang: {
        english: true,
        chinese: true,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 240,
      selectionWC: {
        min: 1,
        max: 5,
      },
      options: {
        resultnum: 10
      }
    },
    google: {
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
      },
      preferredHeight: 320,
      selectionWC: {
        min: 1,
        max: 999999999999999,
      },
      options: {
        /** Keep linebreaks on PDF */
        pdfNewline: false,
        cnfirst: true,
        tl: 'default' as 'default' | 'zh-CN' | 'zh-TW' | 'en',
      },
      options_sel: {
        tl: ['default', 'zh-CN', 'zh-TW', 'en'],
      },
    },
    googledict: {
      lang: '11110000',
      selectionLang: {
        english: true,
        chinese: true,
        japanese: true,
        korean: true,
        french: true,
        spanish: true,
        deutsch: true,
        others: true,
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
      },
      preferredHeight: 240,
      selectionWC: {
        min: 1,
        max: 5,
      },
      options: {
        enresult: true
      }
    },
    guoyu: {
      lang: '00100000',
      selectionLang: {
        english: false,
        chinese: true,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 265,
      selectionWC: {
        min: 1,
        max: 5,
      },
    },
    hjdict: {
      lang: '10011111',
      selectionLang: {
        english: true,
        chinese: true,
        japanese: true,
        korean: true,
        french: true,
        spanish: true,
        deutsch: true,
        others: false,
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
      },
      preferredHeight: 265,
      selectionWC: {
        min: 1,
        max: 10,
      },
      options: {
        related: true,
        chsas: 'jp/jc' as 'jp/cj' | 'jp/jc' | 'kor' | 'w' | 'fr' | 'de' | 'es',
        engas: 'w' as 'w' | 'fr' | 'de' | 'es',
        uas: 'fr' as 'fr' | 'de' | 'es',
        aas: 'fr' as 'fr' | 'de',
        eas: 'fr' as 'fr' | 'es',
      },
      options_sel: {
        chsas: ['jp/cj', 'jp/jc', 'kor', 'w', 'fr', 'de', 'es'],
        engas: ['w', 'fr', 'de', 'es'],
        uas: ['fr', 'de', 'es'],
        aas: ['fr', 'de'],
        eas: ['fr', 'es'],
      },
    },
    liangan: {
      lang: '00100000',
      selectionLang: {
        english: false,
        chinese: true,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 265,
      selectionWC: {
        min: 1,
        max: 5,
      },
    },
    longman: {
      lang: '10000000',
      selectionLang: {
        english: true,
        chinese: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 265,
      selectionWC: {
        min: 1,
        max: 5,
      },
      options: {
        wordfams: false,
        collocations: true,
        grammar: true,
        thesaurus: true,
        examples: true,
        bussinessFirst: true,
        related: true,
      }
    },
    macmillan: {
      lang: '10000000',
      selectionLang: {
        english: true,
        chinese: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 265,
      selectionWC: {
        min: 1,
        max: 5,
      },
      options: {
        related: true,
      }
    },
    naver: {
      lang: '01011000',
      selectionLang: {
        english: false,
        chinese: true,
        japanese: true,
        korean: true,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 465,
      selectionWC: {
        min: 1,
        max: 10,
      },
      options: {
        hanAsJa: false,
        korAsJa: false,
      },
    },
    oald: {
      lang: '10000000',
      selectionLang: {
        english: true,
        chinese: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 265,
      selectionWC: {
        min: 1,
        max: 5,
      },
      options: {
        related: true,
      },
    },
    shanbay: {
      lang: '10000000',
      selectionLang: {
        english: true,
        chinese: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 150,
      selectionWC: {
        min: 1,
        max: 30,
      },
      options: {
        basic: true,
        sentence: true,
      }
    },
    sogou: {
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
      },
      preferredHeight: 320,
      selectionWC: {
        min: 1,
        max: 999999999999999,
      },
      options: {
        /** Keep linebreaks on PDF */
        pdfNewline: false,
        tl: 'default' as 'default' | 'zh-CHS' | 'zh-CHT' | 'en',
      },
      options_sel: {
        tl: ['default', 'zh-CHS', 'zh-CHT', 'en'],
      },
    },
    urban: {
      lang: '10000000',
      selectionLang: {
        english: true,
        chinese: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 180,
      selectionWC: {
        min: 1,
        max: 5,
      },
      options: {
        resultnum: 4
      }
    },
    vocabulary: {
      lang: '10000000',
      selectionLang: {
        english: true,
        chinese: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 180,
      selectionWC: {
        min: 1,
        max: 5,
      },
    },
    weblio: {
      lang: '00010000',
      selectionLang: {
        english: true,
        chinese: true,
        japanese: true,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 265,
      selectionWC: {
        min: 1,
        max: 20,
      },
    },
    websterlearner: {
      lang: '10000000',
      selectionLang: {
        english: true,
        chinese: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 265,
      selectionWC: {
        min: 1,
        max: 5,
      },
      options: {
        defs: true,
        phrase: true,
        derived: true,
        arts: true,
        related: true,
      },
    },
    wikipedia: {
      lang: '11110000',
      selectionLang: {
        english: true,
        chinese: true,
        japanese: true,
        korean: true,
        french: true,
        spanish: true,
        deutsch: true,
        others: true,
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
      },
      preferredHeight: 420,
      selectionWC: {
        min: 1,
        max: 999999999999999,
      },
      options: {
        lang: 'auto' as 'auto' | 'zh' | 'zh-cn' | 'zh-tw' | 'zh-hk' | 'en' | 'ja' | 'fr' | 'de',
      },
      options_sel: {
        lang: ['auto', 'zh', 'zh-cn', 'zh-tw', 'zh-hk', 'en', 'ja', 'fr', 'de'],
      },
    },
    youdao: {
      lang: '11000000',
      selectionLang: {
        english: true,
        chinese: true,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 265,
      selectionWC: {
        min: 1,
        max: 999999999999999,
      },
      options: {
        basic: true,
        collins: true,
        discrimination: true,
        sentence: true,
        translation: true,
        related: true,
      }
    },
    zdic: {
      lang: '01000000',
      selectionLang: {
        english: false,
        chinese: true,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
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
      },
      preferredHeight: 400,
      selectionWC: {
        min: 1,
        max: 5,
      },
    },
  }

  // This is simply for type checking. The returned types are useful.
  // tslint:disable-next-line: no-unused-expression
  allDicts as {
    [index: string]: DictItem
  }

  return allDicts
}
