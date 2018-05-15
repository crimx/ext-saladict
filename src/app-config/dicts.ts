import { DeepReadonly } from '@/typings/helpers'

export function getALlDicts () {
  const allDicts = {
    bing: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
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
      /**
       * Only start searching if the selection contains the language.
       * Better set default to true and let user decide.
       */
      selectionLang: {
        eng: true,
        chs: true
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
    eudic: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word.
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
      /**
       * Only start searching if the selection contains the language.
       * Better set default to true and let user decide.
       */
      selectionLang: {
        eng: true,
        chs: true
      },
      /** Optional dict custom options. Can only be boolean or number. */
      options: {
        resultnum: 10
      }
    },
    business: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word
       */
      page: 'http://www.ldoceonline.com/search/?q=%s',
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
      /**
       * Only start searching if the selection contains the language.
       * Better set default to true and let user decide.
       */
      selectionLang: {
        eng: true,
        chs: true
      }
    },
    cobuild: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word
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
      /**
       * Only start searching if the selection contains the language.
       * Better set default to true and let user decide.
       */
      selectionLang: {
        eng: true,
        chs: true
      },
      /** Optional dict custom options. Can only be boolean or number. */
      options: {
        sentence: 4
      }
    },
    dictcn: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word
       */
      page: 'http://dict.cn/%s',
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
      /**
       * Only start searching if the selection contains the language.
       * Better set default to true and let user decide.
       */
      selectionLang: {
        eng: true,
        chs: true
      },
      /** Optional dict custom options. Can only be boolean or number. */
      options: {
        chart: true,
        etym: true
      }
    },
    etymonline: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word
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
      /**
       * Only start searching if the selection contains the language.
       * Better set default to true and let user decide.
       */
      selectionLang: {
        eng: true,
        chs: true
      },
      /** Optional dict custom options. Can only be boolean or number. */
      options: {
        resultnum: 2
      }
    },
    google: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word
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
      /**
       * Only start searching if the selection contains the language.
       * Better set default to true and let user decide.
       */
      selectionLang: {
        eng: true,
        chs: true
      }
    },
    guoyu: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word
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
      /**
       * Only start searching if the selection contains the language.
       * Better set default to true and let user decide.
       */
      selectionLang: {
        eng: true,
        chs: true
      }
    },
    liangan: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word
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
      /**
       * Only start searching if the selection contains the language.
       * Better set default to true and let user decide.
       */
      selectionLang: {
        eng: true,
        chs: true
      }
    },
    macmillan: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word
       */
      page: 'http://www.macmillandictionary.com/dictionary/british/%s',
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
      /**
       * Only start searching if the selection contains the language.
       * Better set default to true and let user decide.
       */
      selectionLang: {
        eng: true,
        chs: true
      }
    },
    urban: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word
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
      /**
       * Only start searching if the selection contains the language.
       * Better set default to true and let user decide.
       */
      selectionLang: {
        eng: true,
        chs: true
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
       * %z will be replaced with the traditional Chinese version of the current word
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
      /**
       * Only start searching if the selection contains the language.
       * Better set default to true and let user decide.
       */
      selectionLang: {
        eng: true,
        chs: true
      }
    },
    zdic: {
      /**
       * Full content page to jump to when user clicks the title.
       * %s will be replaced with the current word.
       * %z will be replaced with the traditional Chinese version of the current word
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
      /**
       * Only start searching if the selection contains the language.
       * Better set default to true and let user decide.
       */
      selectionLang: {
        eng: true,
        chs: true
      }
    },
  }

  // Just for type check. Keys in allDicts are useful so no actual assertion
  // tslint:disable-next-line:no-unused-expression
  allDicts as {
    [id: string]: {
      page: string
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
