import { DeepReadonly } from '@/typings/helpers'

export function getALlDicts () {
  const allDicts = {
    bing: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-"..
       */
      page: 'https://cn.bing.com/dict/search?q=%s',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      },
      /** Optional dict custom options. Can only be boolean or number. */
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
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-"..
       */
      page: {
        en: 'https://dictionary.cambridge.org/dictionary/english/%h',
        'zh-CN': 'https://dictionary.cambridge.org/zhs/词典/英语-汉语-简体/%s',
        'zh-TW': 'https://dictionary.cambridge.org/zht/詞典/英語-漢語-繁體/%z',
      },
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      },
    },
    cobuild: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-".
       */
      page: 'https://www.collinsdictionary.com/dictionary/english/%s',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      },
      /** Optional dict custom options. Can only be boolean or number. */
      options: {
        sentence: 4
      }
    },
    etymonline: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-".
       */
      page: 'http://www.etymonline.com/search?q=%s',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      },
      /** Optional dict custom options. Can only be boolean or number. */
      options: {
        resultnum: 2
      }
    },
    eudic: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-"..
       */
      page: 'https://dict.eudic.net/dicts/en/%s',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      },
      /** Optional dict custom options. Can only be boolean or number. */
      options: {
        resultnum: 10
      }
    },
    google: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-".
       */
      page: 'https://translate.google.com/#auto/zh-CN/%s',
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
      preferredHeight: 110,
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      }
    },
    guoyu: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-".
       */
      page: 'https://www.moedict.tw/%z',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      }
    },
    liangan: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-".
       */
      page: 'https://www.moedict.tw/~%z',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      }
    },
    longman: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-".
       */
      page: 'https://www.ldoceonline.com/dictionary/%h',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      },
      /** Optional dict custom options. Can only be boolean or number. */
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
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-".
       */
      page: 'http://www.macmillandictionary.com/dictionary/british/%h',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      },
      /** Optional dict custom options. Can only be boolean or number. */
      options: {
        related: true,
      }
    },
    oald: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-".
       */
      page: 'https://www.oxfordlearnersdictionaries.com/definition/english/%h',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      },
      /** Optional dict custom options. Can only be boolean or number. */
      options: {
        related: true,
      },
    },
    urban: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-".
       */
      page: 'http://www.urbandictionary.com/define.php?term=%s',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      },
      /** Optional dict custom options. Can only be boolean or number. */
      options: {
        resultnum: 4
      }
    },
    vocabulary: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-".
       */
      page: 'https://www.vocabulary.com/dictionary/%s',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      }
    },
    websterlearner: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-".
       */
      page: 'http://www.learnersdictionary.com/definition/%h',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      },
      /** Optional dict custom options. Can only be boolean or number. */
      options: {
        defs: true,
        phrase: true,
        derived: true,
        arts: true,
        related: true,
      },
    },
    youdao: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-".
       */
      page: 'http://www.youdao.com/w/eng/%s',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      },
      /** Optional dict custom options. Can only be boolean or number. */
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
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
       * %h will be replaced with the current word joining with hyphen "-".
       */
      page: 'http://www.zdic.net/search/?c=1&q=%s',
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
      /** Only start searching if the selection contains the language. */
      selectionLang: {
        eng: true,
        chs: true,
      }
    },
  }

  // Just for type check. Keys in allDicts are useful so no actual assertion
  // tslint:disable-next-line:no-unused-expression
  allDicts as {
    [id: string]: {
      page: string | {
        en: string
        'zh-CN'?: string
        'zh-TW'?: string
      }
      defaultUnfold: boolean
      preferredHeight: number
      selectionLang: {
        eng: boolean
        chs: boolean
      }
      options?: {
        [option: string]: number | boolean
      }
    }
  }

  return allDicts
}
