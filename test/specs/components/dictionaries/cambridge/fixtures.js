const Accept =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'

module.exports = {
  files: [
    [
      'catch-zht.html',
      {
        url:
          'https://dictionary.cambridge.org/dictionary/english-chinese-traditional/catch',
        Accept
      }
    ],
    [
      'house-zhs.html',
      {
        url:
          'https://dictionary.cambridge.org/dictionary/english-chinese-simplified/house',
        Accept
      }
    ],
    [
      'love.html',
      {
        url: 'https://dictionary.cambridge.org/dictionary/english/love',
        Accept
      }
    ],
    [
      'jumblish.html',
      {
        url: 'https://dictionary.cambridge.org/dictionary/english/jumblish',
        Accept
      }
    ]
  ]
}
