const path = require('path')
const fs = require('fs-extra')
const axios = require('axios')
const SocksProxyAgent = require('socks-proxy-agent')
const fglob = require('fast-glob')
const cliProgress = require('cli-progress')
const randomMua = require('random-mua')
const argv = require('yargs').argv
const env = require('dotenv').config({
  path: path.join(__dirname, '../.env')
}).parsed

// prevent hjdict tls error
// There isn't anything sensitive of the source files so it's ok
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// download fixtures
// default only download non-existed files
// --delete remove all fixtures
// --update remove then download all fixtures
// --fileMatchPattern filter file path with regex

main().catch(console.log)

async function main() {
  if (argv.delete) {
    deletion()
  } else {
    if (argv.update) {
      await deletion()
    }
    add()
  }
}

async function add() {
  let proxyConfig = {}

  if (env.PROXY_HOST) {
    if (env.PROXY_PROTOCAL && env.PROXY_PROTOCAL.startsWith('socks')) {
      const httpsAgent = new SocksProxyAgent(
        `socks5://${env.PROXY_HOST}:${env.PROXY_PORT}`
      )
      proxyConfig = {
        httpsAgent,
        httpAgent: httpsAgent
      }
    } else {
      proxyConfig = {
        proxy: {
          host: env.PROXY_HOST,
          port: env.PROXY_PORT
        }
      }
    }
  }

  if (env.PROXY_HOST) {
    console.log(
      `with proxy: ${env.PROXY_PROTOCAL}://${env.PROXY_HOST}:${env.PROXY_PORT}`
    )
  }

  const progressBars = new cliProgress.MultiBar({
    format: ' {bar} | "{file}" | {value}/{total} | {status}',
    hideCursor: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    clearOnComplete: false,
    stopOnComplete: true
  })

  const errors = []

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

  if (errors.length > 0) {
    await fs.outputFile(
      path.join(__dirname, 'fixtures.log'),
      errors.map(([name, error]) => name + '\n' + error).join('\n\n')
    )
    console.log(
      '\nErrors:\n\n',
      errors.map(([name, e, url]) => `${name}, ${e}\n${url}\n`).join('\n')
    )
  }

  async function fetchDictFixtures(fixturePath) {
    const fixture = require(fixturePath)
    const dictname = /[\\/]+([^\\/]+)[\\/]+fixtures.js$/.exec(fixturePath)[1]
    const total = fixture.files.length

    const fetched = []
    let completed = 0
    let pgBar = null

    function ensureProgressBar(filename) {
      if (!pgBar) {
        pgBar = progressBars.create(total, completed, {
          file: `${dictname}/${filename}`,
          status: 'downloading'
        })
      }
    }

    function updateProgressBar(filename, status) {
      if (!pgBar) {
        return
      }

      pgBar.update(completed, {
        file: `${dictname}/${filename}`,
        status
      })
    }

    function finishFixture(filename, status) {
      completed += 1
      updateProgressBar(filename, status)
    }

    for (const [filename, fetchUrl] of fixture.files) {
      const destPath = fixturePath.replace(
        /fixtures.js$/,
        `response/${filename}`
      )
      const stat = await fs.stat(destPath).catch(() => null)
      if (stat && stat.isFile()) {
        fetched.push(await fs.readFile(destPath, 'utf8'))
        finishFixture(filename, 'cached')
        continue
      }

      ensureProgressBar(filename)
      updateProgressBar(filename, 'downloading')

      try {
        var customConfig =
          typeof fetchUrl === 'string'
            ? {
                url: fetchUrl
              }
            : fetchUrl(fetched)
      } catch (e) {
        finishFixture(filename, 'parse error')
        continue
      }

      if (!customConfig) {
        finishFixture(filename, 'empty config')
        continue
      }

      const { origin, host } = new URL(customConfig.url)
      const axiosConfig = {
        transformResponse: [data => data],
        ...proxyConfig,
        ...customConfig,
        headers: {
          'user-agent': randomMua(),
          ...(customConfig.headers || {})
        }
      }

      try {
        const { data: result } = await axios(axiosConfig).catch(e =>
          e.response && e.response.status === 404 && e.response.data
            ? e.response
            : axios({
                ...axiosConfig,
                headers: {
                  ...axiosConfig.headers,
                  origin,
                  host,
                  referer: origin
                }
              })
        )

        fetched.push(result)
        await fs.outputFile(
          fixturePath.replace(/fixtures.js$/, `response/${filename}`),
          result
        )

        finishFixture(filename, 'success')
      } catch (e) {
        errors.push([`${dictname}/${filename}`, e, axiosConfig.url])

        finishFixture(filename, 'failed')
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
