const neutrino = require('neutrino')
const argv = require('yargs-parser')(process.argv.slice(2))

const createNeutrinoConfig = require('./scripts/create-neutrino-config')
const { getBrowsersByManifestVersion } = require('./scripts/webext-targets')

if (argv.mode !== 'production') {
  module.exports = neutrino(createNeutrinoConfig()).webpack()
} else {
  const configs = [2, 3]
    .map(manifestVersion => {
      const browsers = getBrowsersByManifestVersion(manifestVersion)
      if (!browsers.length) {
        return null
      }

      return neutrino(
        createNeutrinoConfig({
          manifestVersion,
          browsers,
          output: `build/.tmp-mv${manifestVersion}`
        })
      ).webpack()
    })
    .filter(Boolean)

  module.exports = configs.length === 1 ? configs[0] : configs
}
