module.exports = {
  files: [
    ['love.html', 'https://www.91dict.com/words?w=love'],
    [
      'detail.html',
      ([page]) => {
        const detailMatch = /\/r_subs\?sub_id=[^"']+/.exec(page)
        if (detailMatch) {
          return {
            url: 'https://www.91dict.com' + detailMatch
          }
        }
      }
    ]
  ]
}
