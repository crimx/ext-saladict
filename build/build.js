// https://github.com/shelljs/shelljs
const shell = require('shelljs')
shell.env.NODE_ENV = 'production'

const glob = require('glob')
const fs = require('fs')
const path = require('path')
const ora = require('ora')
const webpack = require('webpack')
const packageConfig = require('../package.json')
const webpackConfig = require('./webpack.prod.conf')

const spinner = ora(`building for ${process.env.BUILD_ENV || 'production'}...`)
spinner.start()

const distPath = path.resolve(__dirname, '../dist')
const assetsPath = path.resolve(distPath, 'assets')
shell.rm('-rf', distPath)
shell.mkdir('-p', distPath)
shell.mkdir('-p', assetsPath)
shell.cp('-R', 'assets/static/*', assetsPath)
shell.mkdir('-p', path.join(assetsPath, 'dicts'))
glob(path.join(__dirname, '../src/dictionaries/**/favicon.png'), (err, files) => {
  if (err) { throw (err) }
  files.forEach(file => {
    fs.readFile(file, (err, data) => {
      if (err) { throw (err) }
      fs.writeFile(
        path.join(assetsPath, 'dicts', `${path.basename(path.dirname(file))}.png`),
        data,
        logError
      )
    })
  })
})

require('./dicts/_locales.js')

const manifest = require(path.join(__dirname, '../src/manifest.json'))
if (process.env.BUILD_ENV !== 'devproduction') {
  manifest.version = packageConfig.version
}
fs.writeFile(
  path.join(distPath, 'manifest.json'),
  JSON.stringify(manifest, null, '\t'),
  logError
)

webpack(webpackConfig, function (err, stats) {
  spinner.stop()
  if (err) throw err
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n')
})

function logError (err) {
  if (err) { console.error(err) }
}
