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
      errors.map(([name, e, url]) => `${name}\n${url}\n`).join('\n')
    )
  }

  async function fetchDictFixtures(fixturePath) {
    const fixture = require(fixturePath)

    const fetched = []

    for (const index in fixture.files) {
      const [filename, fetchUrl] = fixture.files[index]

      const destPath = fixturePath.replace(
        /fixtures.js$/,
        `response/${filename}`
      )
      const stat = await fs.stat(destPath).catch(() => null)
      if (stat && stat.isFile()) {
        fetched.push(await fs.readFile(destPath, 'utf8'))
        continue
      }

      const dictname = /[\\/]+([^\\/]+)[\\/]+fixtures.js$/.exec(fixturePath)[1]

      const pgBar = progressBars.create(100, 0, {
        file: `${dictname}/fixture${index * 1 + 1}`,
        status: 'downloading'
      })

      try {
        var customConfig =
          typeof fetchUrl === 'string'
            ? {
                url: fetchUrl
              }
            : fetchUrl(fetched)
      } catch (e) {
        pgBar.update(null, { status: 'parse error' })
        pgBar.stop()
        continue
      }


      if (!customConfig) {
        pgBar.update(null, { status: 'empty config' })
        pgBar.stop()
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

        pgBar.update(100, { status: 'success' })
        pgBar.stop()
      } catch (e) {
        errors.push([`${dictname}/${filename}`, e, axiosConfig.url])

        pgBar.update(null, { status: 'failed' })
        pgBar.stop()
      }
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
