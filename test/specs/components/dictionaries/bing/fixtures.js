module.exports = {
  files: [
    [
      'lex.html',
      'https://cn.bing.com/dict/clientsearch?mkt=zh-CN&setLang=zh&form=BDVEHC&ClientVer=BDDTV3.5.1.4320&q=love'
    ],
    [
      'machine.html',
      `https://cn.bing.com/dict/clientsearch?mkt=zh-CN&setLang=zh&form=BDVEHC&ClientVer=BDDTV3.5.1.4320&q=${encodeURIComponent(
        'lose yourself in the dark'
      )}`
    ],
    [
      'related.html',
      'https://cn.bing.com/dict/clientsearch?mkt=zh-CN&setLang=zh&form=BDVEHC&ClientVer=BDDTV3.5.1.4320&q=lovxx'
    ]
  ]
}
