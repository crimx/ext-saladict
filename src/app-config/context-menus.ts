export function getAllContextMenus () {
  const allContextMenus = {
    baidu_page_translate: 'x',
    baidu_search: 'https://www.baidu.com/s?ie=utf-8&wd=%s',
    bing_dict: 'https://cn.bing.com/dict/?q=%s',
    bing_search: 'https://www.bing.com/search?q=%s',
    cambridge: 'http://dictionary.cambridge.org/spellcheck/english-chinese-simplified/?q=%s',
    dictcn: 'https://dict.eudic.net/dicts/en/%s',
    etymonline: 'http://www.etymonline.com/index.php?search=%s',
    google_cn_page_translate: 'x',
    google_page_translate: 'x',
    google_search: 'https://www.google.com/#newwindow=1&q=%s',
    google_translate: 'https://translate.google.cn/#auto/zh-CN/%s',
    guoyu: 'https://www.moedict.tw/%s',
    iciba: 'http://www.iciba.com/%s',
    liangan: 'https://www.moedict.tw/~%s',
    longman_business: 'http://www.ldoceonline.com/search/?q=%s',
    merriam_webster: 'http://www.merriam-webster.com/dictionary/%s',
    microsoft_page_translate: 'x',
    oxford: 'http://www.oxforddictionaries.com/us/definition/english/%s',
    saladict: 'x',
    sogou_page_translate: 'x',
    sogou: 'https://fanyi.sogou.com/#auto/zh-CHS/%s',
    view_as_pdf: 'x',
    youdao_page_translate: 'x',
    youdao: 'http://dict.youdao.com/w/%s',
    youglish: 'https://youglish.com/search/%s',
  }

  // Just for type check. Keys in allContextMenus are useful so no actual assertion
  // tslint:disable-next-line:no-unused-expression
  allContextMenus as { [id: string]: string }

  return allContextMenus
}
