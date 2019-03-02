export interface DictItem {
  lang: string
  defaultUnfold: boolean
  selectionWC: {
    min: number,
    max: number,
  },
  preferredHeight: number
  selectionLang: {
    eng: boolean
    chs: boolean
    japanese: boolean
    korean: boolean
    french: boolean
    spanish: boolean
    deutsch: boolean
    others: boolean
  }
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
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '11111111',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 320,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 999999999999999,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
        japanese: true,
        korean: true,
        french: true,
        spanish: true,
        deutsch: true,
        others: true,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
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
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '11000000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 240,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
      options: {
        tense: true,
        phsym: true,
        cdef: true,
        related: true,
        sentence: 4
      }
    },
    cambridge: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '11100000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 265,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      },
    },
    cobuild: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '10000000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 300,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
      options: {
        sentence: 4
      }
    },
    etymonline: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '10000000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 265,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
      options: {
        resultnum: 4,
        chart: true,
      }
    },
    eudic: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '11000000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 240,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
      options: {
        resultnum: 10
      }
    },
    google: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '11111111',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 320,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 999999999999999,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
        japanese: true,
        korean: true,
        french: true,
        spanish: true,
        deutsch: true,
        others: true,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
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
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '11110000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 240,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
        japanese: true,
        korean: true,
        french: true,
        spanish: true,
        deutsch: true,
        others: true,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
      options: {
        enresult: true
      }
    },
    guoyu: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '00100000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 265,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: false,
        chs: true,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      }
    },
    hjdict: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '10011111',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 265,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 10,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
        japanese: true,
        korean: true,
        french: true,
        spanish: true,
        deutsch: true,
        others: false,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
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
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '00100000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 265,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: false,
        chs: true,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      }
    },
    longman: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '10000000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 265,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
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
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '10000000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 265,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
      options: {
        related: true,
      }
    },
    naver: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '01011000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 465,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 10,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: false,
        chs: true,
        japanese: true,
        korean: true,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
      options: {
        hanAsJa: false,
        korAsJa: false,
      },
    },
    oald: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '10000000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 265,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
      options: {
        related: true,
      },
    },
    sogou: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '11111111',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 320,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 999999999999999,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
        japanese: true,
        korean: true,
        french: true,
        spanish: true,
        deutsch: true,
        others: true,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
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
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '10000000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 180,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
      options: {
        resultnum: 4
      }
    },
    vocabulary: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '10000000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 180,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      }
    },
    weblio: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '00010000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 265,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 20,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
        japanese: true,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      },
    },
    websterlearner: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '10000000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 265,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: false,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
      options: {
        defs: true,
        phrase: true,
        derived: true,
        arts: true,
        related: true,
      },
    },
    wikipedia: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '11110000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 420,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 999999999999999,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
        japanese: true,
        korean: true,
        french: true,
        spanish: true,
        deutsch: true,
        others: true,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
      options: {
        lang: 'auto' as 'auto' | 'zh' | 'zh-cn' | 'zh-tw' | 'zh-hk' | 'en' | 'ja' | 'fr' | 'de',
      },
      options_sel: {
        lang: ['auto', 'zh', 'zh-cn', 'zh-tw', 'zh-hk', 'en', 'ja', 'fr', 'de'],
      },
    },
    youdao: {
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '11000000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 265,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 999999999999999,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      },
      /**
       * Optional dict custom options. Can only be boolean, number or string.
       * For string, add additional `options_sel` field to list out choices.
       */
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
      /**
       * Supported language: en, zh-CN, zh-TW, ja, kor, fr, de, es
       * `1` for supported
       */
      lang: '01000000',
      /**
       * If set to true, the dict start searching automatically.
       * Otherwise it'll only start seaching when user clicks the unfold button.
       * Default MUST be true and let user decide.
       */
      defaultUnfold: true,
      /**
       * This is the default height when the dict first renders the result.
       * If the content height is greater than the preferred height,
       * the preferred height is used and a mask with a view-more button is shown.
       * Otherwise the content height is used.
       */
      preferredHeight: 400,
      /** Word count to start searching */
      selectionWC: {
        min: 1,
        max: 5,
      },
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: false,
        chs: true,
        japanese: false,
        korean: false,
        french: false,
        spanish: false,
        deutsch: false,
        others: false,
      }
    },
  }

  // This is simply for type checking. The returned types are useful.
  // tslint:disable-next-line: no-unused-expression
  allDicts as {
    [index: string]: DictItem
  }

  return allDicts
}
