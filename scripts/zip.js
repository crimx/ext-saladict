#!/usr/bin/env node

'use strict'

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production'
}

const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const globby = require('globby')

const root = path.resolve(__dirname, '..')
const dist = path.join(root, 'build')
const packageJson = require('../package.json')

main().catch(err => {
  process.exitCode = 1
  console.error(err)
})

async function main() {
  if (!fs.existsSync(dist)) {
    throw new Error('Build directory does not exist. Run `yarn build` first.')
  }

  console.log('\n\nZipping files...')

  await removeOldZips()

  const browsers = await globby('*', {
    cwd: dist,
    onlyDirectories: true,
    markDirectories: false
  })

  if (!browsers.length) {
    throw new Error(
      'No build artifacts found under build/. Run `yarn build` first.'
    )
  }

  await Promise.all([...browsers.map(packBrowser), packSource()])

  console.log(`Done. See "${dist}".\n\n`)
}

function removeOldZips() {
  return Promise.all(
    fs
      .readdirSync(dist)
      .filter(name => name.endsWith('.zip'))
      .map(name => fs.promises.unlink(path.join(dist, name)))
  )
}

function packBrowser(browser) {
  return pack(path.join(dist, `${browser}.zip`), archive => {
    archive.glob('**/*', {
      cwd: path.join(dist, browser),
      ignore: '**/*.map'
    })
  })
}

async function packSource() {
  const customPatterns = process.argv.slice(2)
  const customNegativePatterns = customPatterns.filter(
    pattern => pattern && pattern[0] === '!'
  )
  const customNormalPatterns = await expandCustomNormalPatterns(
    customPatterns.filter(pattern => pattern && pattern[0] !== '!')
  )

  const files = await globby(['**/*', '!.git', ...customNegativePatterns], {
    cwd: root,
    dot: true,
    absolute: false,
    onlyFiles: true,
    gitignore: true
  })

  const moreFiles = await globby(customNormalPatterns, {
    cwd: root,
    dot: true,
    absolute: false,
    onlyFiles: true,
    gitignore: false
  })

  const rootName = packageJson.name || 'source'
  const names = Array.from(new Set([...files, ...moreFiles]))

  return pack(path.join(dist, 'source.zip'), archive => {
    names.forEach(name => {
      archive.file(path.join(root, name), {
        name: path.join(rootName, name)
      })
    })
  })
}

async function expandCustomNormalPatterns(patterns) {
  const expanded = await Promise.all(
    patterns.map(async pattern => {
      const normalized = pattern.replace(/\\/g, '/').replace(/\/$/, '')
      const fullPath = path.join(root, normalized)

      if (hasMagic(normalized) || !fs.existsSync(fullPath)) {
        return normalized
      }

      const stats = await fs.promises.stat(fullPath)

      return stats.isDirectory() ? `${normalized}/**/*` : normalized
    })
  )

  return expanded
}

function hasMagic(pattern) {
  return /[*?[\]{}()!+@]/.test(pattern)
}

function pack(outputPath, addFiles) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', {})

    output.on('close', resolve)
    output.on('error', reject)

    archive.on('warning', err => {
      if (err.code === 'ENOENT') {
        console.warn(err)
      } else {
        reject(err)
      }
    })

    archive.on('error', reject)
    archive.pipe(output)

    addFiles(archive)

    archive.finalize()
  })
}
