import { initConfig } from '@/_helpers/config-manager'
import { initProfiles } from '@/_helpers/profile-manager'
import { browser } from '../../../test/helper'
import packagejson from '../../../package.json'

browser.runtime.getManifest.callsFake(() => ({
  version: packagejson.version
}))

browser.permissions.contains.callsFake(() => Promise.resolve(true))
browser.permissions.request.callsFake(() => Promise.resolve(false))

initConfig()
initProfiles()
