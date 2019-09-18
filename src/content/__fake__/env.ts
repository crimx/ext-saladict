import faker from 'faker'
import '@/selection'
import { initConfig, updateConfig } from '@/_helpers/config-manager'
import { initProfiles, updateProfile } from '@/_helpers/profile-manager'
import { ProfileMutable } from '@/app-config/profiles'
import { AppConfigMutable } from '@/app-config'

browser.runtime.sendMessage['_sender'].callsFake(() => ({
  tab: {
    id: 'saladict-page'
  }
}))

initConfig().then(config => {
  ;(config as AppConfigMutable).mode.instant.enable = true
  updateConfig(config)
})
initProfiles().then(profile => {
  ;(profile as ProfileMutable).dicts.selected = ['bing']
  updateProfile(profile)
})

for (let i = 0; i < 10; i++) {
  const $p = document.createElement('p')
  $p.innerHTML = 'love ' + faker.lorem.paragraph()
  document.body.appendChild($p)
}
