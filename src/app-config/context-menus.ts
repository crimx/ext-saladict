export function getAllContextMenus () {
  const allContextMenus = {
    google_page_translate: 'x',
    youdao_page_translate: 'x',
    google_search: 'https://www.google.com/#newwindow=1&q=%s',
    baidu_search: 'https://www.baidu.com/s?ie=utf-8&wd=%s',
    bing_search: 'https://www.bing.com/search?q=%s',
    google_translate: 'https://translate.google.cn/#auto/zh-CN/%s',
    etymonline: 'http://www.etymonline.com/index.php?search=%s',
    merriam_webster: 'http://www.merriam-webster.com/dictionary/%s',
    oxford: 'http://www.oxforddictionaries.com/us/definition/english/%s',
    cambridge: 'http://dictionary.cambridge.org/spellcheck/english-chinese-simplified/?q=%s',
    youdao: 'http://dict.youdao.com/w/%s',
    dictcn: 'https://dict.eudic.net/dicts/en/%s',
    iciba: 'http://www.iciba.com/%s',
    liangan: 'https://www.moedict.tw/~%s',
    guoyu: 'https://www.moedict.tw/%s',
    longman_business: 'http://www.ldoceonline.com/search/?q=%s',
    bing_dict: 'https://cn.bing.com/dict/?q=%s'
  }

  // Just for type check. Keys in allContextMenus are useful so no actual assertion
  // tslint:disable-next-line:no-unused-expression
  allContextMenus as { [id: string]: string }

  return allContextMenus
}
