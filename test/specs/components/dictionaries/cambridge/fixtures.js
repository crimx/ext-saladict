const Accept =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'

module.exports = {
  files: [
    [
      'catch-zht.html',
      {
        url:
          'https://dictionary.cambridge.org/zht/%E6%90%9C%E7%B4%A2/direct/?datasetsearch=english-chinese-traditional&q=catch',
        Accept
      }
    ],
    [
      'house-zhs.html',
      {
        url:
          'https://dictionary.cambridge.org/zhs/%E6%90%9C%E7%B4%A2/direct/?datasetsearch=english-chinese-simplified&q=house',
        Accept
      }
    ],
    [
      'love.html',
      {
        url:
          'https://dictionary.cambridge.org/search/direct/?datasetsearch=english&q=love',
        Accept
      }
    ],
    [
      'jumblish.html',
      {
        url:
          'https://dictionary.cambridge.org/search/direct/?datasetsearch=english&q=jumblish',
        Accept
      }
    ]
  ]
}
