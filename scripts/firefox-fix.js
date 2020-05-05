// Firefox does not support dynamic import in WebExtension
// https://bugzilla.mozilla.org/show_bug.cgi?id=1536094

const path = require('path')
const fs = require('fs-extra')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

const ffPath = path.join(__dirname, '../build/firefox')
const manifestPath = path.join(ffPath, 'manifest.json')

const manifest = require(manifestPath)

main()

async function main() {
  const htmls = (await fs.readdir(ffPath)).filter(name =>
    name.endsWith('.html')
  )
  const htmlTexts = await Promise.all(
    htmls.map(html => fs.readFile(path.join(ffPath, html), 'utf8'))
  )

  const staticChunkIds = await getStaticChunks(htmlTexts)
  const allChunks = await fs.readdir(path.join(ffPath, 'assets'))
  const dynamicChunks = allChunks
    .filter(name => {
      const m = /^([^.]+)\.[^.]+\.js$/.exec(name)
      if (m) {
        return !staticChunkIds.has(m[1])
      }
      return false
    })
    .map(filename => `/assets/${filename}`)

  const dynamicChunksWithoutAntd = dynamicChunks.filter(
    name => !name.startsWith('/assets/antd')
  )

  manifest.content_scripts.forEach(item => {
    if (item.js) {
      if (item.js.some(name => name.startsWith('assets/selection'))) {
        return
      }
      item.js.push(...dynamicChunksWithoutAntd)
    }
  })

  manifest.background.scripts.push(...dynamicChunksWithoutAntd)

  await fs.outputJSON(manifestPath, manifest, { spaces: 2 })

  await Promise.all(
    htmlTexts.map((text, i) => {
      const dom = new JSDOM(text)

      let chunks = dynamicChunksWithoutAntd

      if (
        htmls[i] === 'options.html' ||
        htmls[i] === 'notebook.html' ||
        htmls[i] === 'history.html'
      ) {
        chunks = dynamicChunks
      }

      chunks.forEach(name => {
        const script = dom.window.document.createElement('script')
        script.src = name
        dom.window.document.head.appendChild(script)
      })
      return fs.outputFile(
        path.join(ffPath, htmls[i]),
        dom.window.document.documentElement.outerHTML
      )
    })
  )

  // urgh
  // https://github.com/mozilla/addons-linter/issues/2498
  const runtime = allChunks.find(filename => filename.startsWith('runtime.'))
  const runtimePath = path.join(ffPath, 'assets', runtime)
  await fs.outputFile(
    runtimePath,
    (await fs.readFile(runtimePath, 'utf8')).replace(
      /import\(/g,
      'saladictImport('
    )
  )
}

async function getStaticChunks(htmls) {
  const staticChunks = new Set()

  htmls.forEach(text => {
    const matcher = /"\/assets\/([^.]+)\.[^.]+\.js"/g
    let m
    // eslint-disable-next-line no-cond-assign
    while ((m = matcher.exec(text))) {
      staticChunks.add(m[1])
    }
  })

  manifest.content_scripts.forEach(item => {
    if (item.js) {
      item.js.forEach(name => {
        const m = /assets\/([^.]+)\.[^.]+\.js/.exec(name)
        if (m) {
          staticChunks.add(m[1])
        }
      })
    }
  })

  manifest.background.scripts.forEach(name => {
    const m = /assets\/([^.]+)\.[^.]+\.js/.exec(name)
    if (m) {
      staticChunks.add(m[1])
    }
  })

  staticChunks.delete('franc')

  return staticChunks
}
