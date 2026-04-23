const path = require('path')
const fs = require('fs-extra')
const axios = require('axios')
const fglob = require('fast-glob')
const cliProgress = require('cli-progress')
const randomMua = require('random-mua')
const argv = require('yargs').argv
const env = require('dotenv').config({
  path: path.join(__dirname, '../.env')
}).parsed
const progressBarFormat =
  ' {bar} | "{file}" | {value}/{total} | {status} | {url}'

// prevent hjdict tls error
// There isn't anything sensitive of the source files so it's ok
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// download fixtures
// default only download non-existed files
// --delete remove all fixtures
// --update remove then download all fixtures
// --fileMatchPattern filter file path with regex
// --timeout request timeout in ms

main().catch(console.log)

async function main() {
  if (argv.delete) {
    await deletion()
  } else {
    if (argv.update) {
      await deletion()
    }
    await add()
  }
}

async function add() {
  const rawRequestTimeout = Number(argv.timeout || env?.FIXTURES_TIMEOUT)
  const requestTimeout =
    Number.isFinite(rawRequestTimeout) && rawRequestTimeout > 0
      ? rawRequestTimeout
      : 30000

  function truncateLine(text, maxWidth) {
    const limit =
      Number.isFinite(maxWidth) && maxWidth > 0
        ? Math.max(0, maxWidth - 2)
        : null

    if (limit === null || limit === 0 || text.length <= limit) {
      return text
    }

    if (limit <= 3) {
      return text.slice(0, limit)
    }

    return `${text.slice(0, limit - 3)}...`
  }

  const progressBars = new cliProgress.MultiBar({
    format(options, params, payload) {
      if (payload.kind === 'message') {
        return truncateLine(payload.message || '', params.maxWidth)
      }

      return cliProgress.Format.Formatter(
        {
          ...options,
          format: progressBarFormat
        },
        params,
        payload
      )
    },
    hideCursor: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    clearOnComplete: false,
    stopOnComplete: true
  })

  const errors = []
  const messageBar = progressBars.create(1, 0, {
    kind: 'message',
    message: '[fixtures] errors: 0'
  })

  function formatError(error) {
    if (!error) {
      return 'Unknown error'
    }

    if (error.code === 'ECONNABORTED') {
      return `timeout after ${requestTimeout}ms`
    }

    if (error.response) {
      return [`HTTP ${error.response.status}`, error.response.statusText]
        .filter(Boolean)
        .join(' ')
    }

    return (
      [error.code, error.message].filter(Boolean).join(': ') || String(error)
    )
  }

  function logFixtureError(name, url, error) {
    const message = `[fixtures] errors: ${
      errors.length
    } | latest: ${name} | ${formatError(error)}`

    if (messageBar) {
      messageBar.update({
        kind: 'message',
        message
      })
      return
    }

    console.error(`\n${message}`)

    if (url) {
      console.error(url)
    }
  }

  function withDefaultHeaders(headers, defaults) {
    const nextHeaders = { ...(headers || {}) }
    const headerNames = new Set(
      Object.keys(nextHeaders).map(name => name.toLowerCase())
    )

    Object.entries(defaults).forEach(([name, value]) => {
      if (value && !headerNames.has(name.toLowerCase())) {
        nextHeaders[name] = value
      }
    })

    return nextHeaders
  }

  function canSaveHttpError(response) {
    return (
      !!response &&
      (response.status === 400 || response.status === 404) &&
      typeof response.data !== 'undefined'
    )
  }

  let fixturesPath = await fglob(['**/fixtures.js'], {
    cwd: path.join(__dirname, '../test'),
    absolute: true,
    onlyFiles: true
  })

  if (argv.fileMatchPattern) {
    const matcher = new RegExp(argv.fileMatchPattern)
    fixturesPath = fixturesPath.filter(filePath => matcher.test(filePath))
  }

  await Promise.all(fixturesPath.map(fetchDictFixtures))

  if (messageBar) {
    progressBars.remove(messageBar)
  }

  if (errors.length > 0) {
    await fs.outputFile(
      path.join(__dirname, 'fixtures.log'),
      errors
        .map(([name, error, url]) =>
          [name, error, url].filter(Boolean).join('\n')
        )
        .join('\n\n')
    )
    console.log(
      `\n${errors.length} fixture downloads failed. See ${path.join(
        __dirname,
        'fixtures.log'
      )}`
    )
  }

  async function fetchDictFixtures(fixturePath) {
    const fixture = require(fixturePath)
    const dictname = /[\\/]+([^\\/]+)[\\/]+fixtures.js$/.exec(fixturePath)[1]
    const total = fixture.files.length

    const fetched = []
    let completed = 0
    let pgBar = null

    function ensureProgressBar(filename, url = '') {
      if (!pgBar) {
        pgBar = progressBars.create(total, completed, {
          file: `${dictname}/${filename}`,
          status: 'downloading',
          url
        })
      }
    }

    function updateProgressBar(filename, status, url = '') {
      if (!pgBar) {
        return
      }

      pgBar.update(completed, {
        file: `${dictname}/${filename}`,
        status,
        url
      })
    }

    function finishFixture(filename, status, url = '') {
      completed += 1
      updateProgressBar(filename, status, url)
    }

    for (const [filename, fetchUrl] of fixture.files) {
      const staticUrl = typeof fetchUrl === 'string' ? fetchUrl : ''
      const destPath = fixturePath.replace(
        /fixtures.js$/,
        `response/${filename}`
      )
      const stat = await fs.stat(destPath).catch(() => null)
      if (stat && stat.isFile()) {
        fetched.push(await fs.readFile(destPath, 'utf8'))
        finishFixture(filename, 'cached', staticUrl)
        continue
      }

      ensureProgressBar(filename, staticUrl)
      updateProgressBar(filename, 'downloading', staticUrl)

      try {
        var customConfig =
          typeof fetchUrl === 'string'
            ? {
                url: fetchUrl
              }
            : typeof fetchUrl === 'function'
            ? await fetchUrl(fetched)
            : fetchUrl
      } catch (e) {
        finishFixture(filename, 'parse error', staticUrl)
        continue
      }

      if (!customConfig) {
        finishFixture(filename, 'empty config', staticUrl)
        continue
      }

      const requestUrl = customConfig.url || staticUrl
      updateProgressBar(filename, 'downloading', requestUrl)

      let origin
      let host

      try {
        ;({ origin, host } = new URL(customConfig.url))
      } catch (e) {
        errors.push([`${dictname}/${filename}`, e, customConfig.url])
        logFixtureError(`${dictname}/${filename}`, customConfig.url, e)
        finishFixture(filename, 'invalid url', requestUrl)
        continue
      }

      const axiosConfig = {
        transformResponse: [data => data],
        timeout: requestTimeout,
        proxy: false,
        ...customConfig,
        headers: withDefaultHeaders(
          {
            'user-agent': randomMua(),
            ...(customConfig.headers || {})
          },
          {
            origin,
            referer: origin
          }
        )
      }

      try {
        const response = await axios(axiosConfig).catch(e =>
          canSaveHttpError(e.response)
            ? e.response
            : axios({
                ...axiosConfig,
                headers: withDefaultHeaders(axiosConfig.headers, {
                  origin,
                  host,
                  referer: origin
                })
              }).catch(retryError =>
                canSaveHttpError(retryError.response)
                  ? retryError.response
                  : Promise.reject(retryError)
              )
        )
        const { data: result, status } = response

        fetched.push(result)
        await fs.outputFile(
          fixturePath.replace(/fixtures.js$/, `response/${filename}`),
          result
        )

        finishFixture(
          filename,
          status === 400 || status === 404 ? `saved ${status}` : 'success',
          axiosConfig.url
        )
      } catch (e) {
        errors.push([`${dictname}/${filename}`, e, axiosConfig.url])
        logFixtureError(`${dictname}/${filename}`, axiosConfig.url, e)

        finishFixture(filename, 'failed', axiosConfig.url)
      }
    }

    if (pgBar) {
      progressBars.remove(pgBar)
    }
  }
}

async function deletion() {
  let fixturesPath = await fglob(['**/response'], {
    cwd: path.join(__dirname, '../test'),
    absolute: true,
    onlyDirectories: true
  })

  if (argv.fileMatchPattern) {
    const matcher = new RegExp(argv.fileMatchPattern)
    fixturesPath = fixturesPath.filter(filePath => matcher.test(filePath))
  }

  await Promise.all(fixturesPath.map(fixturePath => fs.remove(fixturePath)))
}
