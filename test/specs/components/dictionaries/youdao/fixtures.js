const Accept =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'

module.exports = {
  files: [
    [
      'jumblish.html',
      {
        url: 'https://dict.youdao.com/w/jumblish',
        Accept
      }
    ],
    [
      'love.html',
      {
        url: 'https://dict.youdao.com/w/love',
        Accept
      }
    ],
    [
      'make.html',
      {
        url: 'https://dict.youdao.com/w/make',
        Accept
      }
    ], // collins
    [
      'translation.html',
      {
        url:
          'https://dict.youdao.com/w/' +
          encodeURIComponent(
            `She walks in beauty, like the night Of cloudless climes and starry skies.`
          ),
        Accept
      }
    ]
  ]
}
