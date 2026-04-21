const fs = require('fs')
const path = require('path')

const manifestDir = path.join(__dirname, '../src/manifest')

function resolveManifestModule(modulePath) {
  return ['.js', '.json']
    .map(ext => `${modulePath}${ext}`)
    .find(filePath => fs.existsSync(filePath))
}

function loadManifest(modulePath) {
  const resolvedPath = resolveManifestModule(modulePath)
  if (!resolvedPath) {
    return null
  }

  delete require.cache[require.resolve(resolvedPath)]
  return require(resolvedPath)
}

function loadCommonManifest() {
  return loadManifest(path.join(manifestDir, 'common.manifest')) || {}
}

function listBrowserTargets() {
  const commonManifest = loadCommonManifest()

  return fs
    .readdirSync(manifestDir)
    .sort()
    .map(fileName => {
      const match = /^([^.]+)\.manifest\.(json|js)$/.exec(fileName)
      if (!match || match[1] === 'common') {
        return null
      }

      const browser = match[1]
      const manifestPath = path.join(manifestDir, fileName)
      const manifest = loadManifest(manifestPath.replace(/\.(json|js)$/, ''))
      const manifestVersion =
        Object.assign({}, commonManifest, manifest).manifest_version || 2

      return {
        browser,
        manifest,
        manifestVersion
      }
    })
    .filter(Boolean)
}

function getBrowsersByManifestVersion(manifestVersion) {
  return listBrowserTargets()
    .filter(target => target.manifestVersion === manifestVersion)
    .map(target => target.browser)
}

module.exports = {
  manifestDir,
  loadCommonManifest,
  loadManifest,
  listBrowserTargets,
  getBrowsersByManifestVersion
}
