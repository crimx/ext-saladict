module.exports = {
  files: [
    ['love.html', 'https://www.shanbay.com/bdc/mobile/preview/word?word=love'],
    [
      'love.json',
      ([page]) => {
        const wordIdMatch = /"word-spell" data-id="([^"]+)"/.exec(page)
        if (wordIdMatch) {
          return {
            url: `https://www.shanbay.com/api/v1/bdc/example/?vocabulary_id=${
              wordIdMatch[1]
            }&type=sys`
          }
        }
      }
    ]
  ]
}
