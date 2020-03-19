module.exports = {
  files: [
    ['love.html', 'https://dict.eudic.net/dicts/en/love'],
    [
      'sentences.html',
      ([page]) => {
        const statusMatch = /id="page-status" value="([^"]+)"/.exec(page)
        if (statusMatch) {
          return {
            url: 'https://dict.eudic.net/Dicts/en/tab-detail/-12',
            method: 'post',
            transformResponse: [data => data],
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            responseType: 'text/plain',
            data: `status=${statusMatch[1]}`
          }
        }
      }
    ]
  ]
}
