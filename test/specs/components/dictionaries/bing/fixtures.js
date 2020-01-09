module.exports = {
  files: [
    ['lex.html', 'https://cn.bing.com/dict/search?q=love'],
    [
      'machine.html',
      `https://cn.bing.com/dict/search?q=${encodeURIComponent(
        'lose yourself in the dark'
      )}`
    ],
    ['related.html', 'https://cn.bing.com/dict/search?q=lovxx']
  ]
}
