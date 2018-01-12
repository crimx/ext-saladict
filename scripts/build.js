'use strict'

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'
process.env.PUBLIC_URL = './'

const argv = require('minimist')(process.argv.slice(2))
if (argv.debug) { process.env.DEBUG_MODE = true }

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err
})

// Browser targets
const browsers = ['chrome', 'firefox']

// Ensure environment variables are read.
require('../config/env')

const path = require('path')
const chalk = require('chalk')
const fs = require('fs-extra')
const webpack = require('webpack')
const config = require('../config/webpack.config.prod')
const paths = require('../config/paths')
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles')
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages')
const FileSizeReporter = require('react-dev-utils/FileSizeReporter')
const printBuildError = require('react-dev-utils/printBuildError')
const semver = require('semver')

const measureFileSizesBeforeBuild =
  FileSizeReporter.measureFileSizesBeforeBuild
const printFileSizesAfterBuild = FileSizeReporter.printFileSizesAfterBuild
const useYarn = fs.existsSync(paths.yarnLockFile)

// These sizes are pretty large. We'll warn for bundles exceeding them.
const WARN_AFTER_BUNDLE_GZIP_SIZE = 512 * 1024
const WARN_AFTER_CHUNK_GZIP_SIZE = 1024 * 1024

// 'patch' increases 1 on every build (but not devbuild)
if (!argv.devbuild) {
  updateVerison()
}

// First, read the current file sizes in build directory.
// This lets us display how much they changed later.
measureFileSizesBeforeBuild(paths.appBuild)
  .then(previousFileSizes => {
    // Remove all content but keep the directory so that
    // if you're in it, you don't end up in Trash
    fs.emptyDirSync(paths.appBuild)
    // Start the webpack build
    return build(previousFileSizes)
  })
  .then(
    ({ stats, previousFileSizes, warnings }) => {
      if (warnings.length) {
        console.log(chalk.yellow('Compiled with warnings.\n'))
        console.log(warnings.join('\n\n'))
        console.log(
          '\nSearch for the ' +
            chalk.underline(chalk.yellow('keywords')) +
            ' to learn more about each warning.'
        )
        console.log(
          'To ignore, add ' +
            chalk.cyan('// eslint-disable-next-line') +
            ' to the line before.\n'
        )
      } else {
        console.log(chalk.green('Compiled successfully.\n'))
      }

      console.log('File sizes after gzip:\n')
      printFileSizesAfterBuild(
        stats,
        previousFileSizes,
        // only show the basename
        '[browser]/', // paths.appBuild,
        WARN_AFTER_BUNDLE_GZIP_SIZE,
        WARN_AFTER_CHUNK_GZIP_SIZE
      )
      console.log()
    },
    err => {
      console.log(chalk.red('Failed to compile.\n'))
      printBuildError(err)
      process.exit(1)
    }
  )
  .then(generateByBrowser)

// Create the production build and print the deployment instructions.
function build(previousFileSizes) {
  console.log('Creating an optimized production build...')

  let compiler = webpack(config)
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        return reject(err)
      }
      const messages = formatWebpackMessages(stats.toJson({}, true))
      if (messages.errors.length) {
        // Only keep the first error. Others are often indicative
        // of the same problem, but confuse the reader with noise.
        if (messages.errors.length > 1) {
          messages.errors.length = 1
        }
        return reject(new Error(messages.errors.join('\n\n')))
      }
      if (
        process.env.CI &&
        (typeof process.env.CI !== 'string' ||
          process.env.CI.toLowerCase() !== 'false') &&
        messages.warnings.length
      ) {
        console.log(
          chalk.yellow(
            '\nTreating warnings as errors because process.env.CI = true.\n' +
              'Most CI servers set it automatically.\n'
          )
        )
        return reject(new Error(messages.warnings.join('\n\n')))
      }
      return resolve({
        stats,
        previousFileSizes,
        warnings: messages.warnings,
      })
    })
  })
}

// Change version in 'common.manifest.json'
// 'patch' increases 1 on every build
function updateVerison () {
  const manifestPath = require.resolve('../src/manifest/common.manifest.json')
  const rawManifest = fs.readFileSync(manifestPath, 'utf8')
  const manifest = JSON.parse(rawManifest)
  const version = semver.valid(manifest.version)
  if (!version) { throw new Error('Manifest version incorrect') }
  fs.writeFileSync(manifestPath, rawManifest.replace(`"${manifest.version}"`, `"${semver.inc(version, 'patch')}"`))
}

// Generate results for all browsers
function generateByBrowser () {
  const commonManifest = require('../src/manifest/common.manifest.json')
  const files = fs.readdirSync(paths.appBuild)
    .map(name => ({name, path: path.join(paths.appBuild, name)}))

  return Promise.all(browsers.map(browser => {
    const dest = path.join(paths.appBuild, browser)
    if (!fs.existsSync(dest)){ fs.mkdirSync(dest) }

    const browserManifest = require(`../src/manifest/${browser}.manifest.json`)

    return Promise.all([
      // manifest
      fs.writeJson(
        path.join(dest, 'manifest.json'),
        Object.assign({}, commonManifest, browserManifest),
        { spaces: 2 },
      ),
      // public assets
      fs.copy(paths.appPublic, dest, {
        dereference: true,
        // ignore files or dirs start with "."
        filter: file => !/[\\\/]+\./.test(file),
      }),
      // project files
      ...files.map(file => fs.copy(file.path, path.join(dest, file.name)))
    ])
  })).then(() => Promise.all(files.map(file =>
    // clean up files
    fs.remove(file.path)
  )))
}
