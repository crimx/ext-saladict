module.exports = {
  files: [
    ['jumblish.html', 'https://dict.youdao.com/w/jumblish'],
    ['love.html', 'https://dict.youdao.com/w/love'],
    ['make.html', 'https://dict.youdao.com/w/make'], // collins
    [
      'translation.html',
      'https://dict.youdao.com/w/' +
        encodeURIComponent(
          `She walks in beauty, like the night Of cloudless climes and starry skies.`
        )
    ]
  ]
}
