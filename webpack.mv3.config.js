const neutrino = require('neutrino')

const createNeutrinoConfig = require('./scripts/create-neutrino-config')
const { getBrowsersByManifestVersion } = require('./scripts/webext-targets')

module.exports = neutrino(
  createNeutrinoConfig({
    manifestVersion: 3,
    browsers: getBrowsersByManifestVersion(3),
    output: 'build/.tmp-mv3'
  })
).webpack()
